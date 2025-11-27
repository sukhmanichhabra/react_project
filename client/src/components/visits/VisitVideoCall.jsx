import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

const VisitVideoCall = () => {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppSelector(selectAuth);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const otherSocketIdRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingOfferRef = useRef(null);

  const [statusText, setStatusText] = useState("Connecting...");
  const [error, setError] = useState("");
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);

  const cleanupPeer = () => {
    const pc = peerConnectionRef.current;
    if (pc) {
      pc.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      pc.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      remoteVideoRef.current.srcObject = null;
    }

    setRemoteConnected(false);
  };

  const ensurePeerConnection = async () => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (
        event.candidate &&
        socketRef.current &&
        otherSocketIdRef.current &&
        visitId
      ) {
        socketRef.current.emit("visit-ice-candidate", {
          to: otherSocketIdRef.current,
          candidate: event.candidate,
          visitId,
        });
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (remoteVideoRef.current && stream) {
        remoteVideoRef.current.srcObject = stream;
      }
      setRemoteConnected(true);
    };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = mediaStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
        localVideoRef.current.muted = true;
      }

      mediaStream.getTracks().forEach((track) => {
        pc.addTrack(track, mediaStream);
      });

      setStatusText("Waiting for other participant...");
    } catch (err) {
      setError("Could not access camera or microphone.");
    }

    return pc;
  };

  const startOffer = async (targetSocketId) => {
    if (!visitId) {
      return;
    }

    const pc = await ensurePeerConnection();
    if (!pc || !socketRef.current) {
      return;
    }

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit("visit-offer", {
        to: targetSocketId,
        sdp: offer,
        visitId,
        callerName: user?.name || user?.username || user?.email,
      });
      setStatusText("Calling...");
    } catch (err) {
      setError("Failed to start call.");
    }
  };

  const handleToggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const next = !micEnabled;
    stream.getAudioTracks().forEach((track) => {
      // Enable/disable audio sending
      track.enabled = next;
    });
    setMicEnabled(next);
  };

  const handleToggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const next = !cameraEnabled;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    setCameraEnabled(next);
  };

  const handleAcceptCall = async () => {
    const offerData = pendingOfferRef.current;
    if (!offerData || !visitId) return;

    const pc = await ensurePeerConnection();
    if (!pc || !socketRef.current) return;

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offerData.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current.emit("visit-answer", {
        to: offerData.from,
        sdp: answer,
        visitId,
      });
      setIncomingCall(null);
      setStatusText("In call");
      toast.success("Call connected");
    } catch (err) {
      console.error("Failed to answer call", err);
      setError("Failed to answer call.");
    }
  };

  const handleRejectCall = () => {
    pendingOfferRef.current = null;
    setIncomingCall(null);
    if (socketRef.current && otherSocketIdRef.current && visitId) {
      socketRef.current.emit("visit-call-declined", {
        to: otherSocketIdRef.current,
        visitId,
      });
    }
    toast.dismiss();
    setStatusText("Call declined");
    cleanupPeer();
    navigate(-1);
  };

  useEffect(() => {
    if (!visitId || !user) {
      return;
    }

    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect_error", () => {
      setError("Unable to connect to video server.");
    });

    socket.emit("join-visit", {
      visitId,
      userId: user._id,
      name: user.name || user.username || user.email,
      role: user.role,
    });

    socket.on("other-user", async ({ otherSocketId }) => {
      otherSocketIdRef.current = otherSocketId;
      await startOffer(otherSocketId);
    });

    socket.on("user-joined", ({ otherSocketId }) => {
      otherSocketIdRef.current = otherSocketId;
      setStatusText("Other participant joined. Waiting for call...");
    });

    socket.on("visit-offer", ({ sdp, from, callerName }) => {
      otherSocketIdRef.current = from;
      pendingOfferRef.current = { sdp, from, callerName };
      setIncomingCall({
        from,
        callerName: callerName || "Other participant",
      });
      setStatusText("Incoming call...");

      toast((t) => (
        <div className="text-sm">
          <div className="font-semibold">Incoming video call</div>
          <div className="text-xs text-gray-200 mt-1">
            From: {callerName || "Other participant"}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              className="px-3 py-1 rounded-md text-xs bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                handleRejectCall();
                toast.dismiss(t.id);
              }}
            >
              Decline
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded-md text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => {
                handleAcceptCall();
                toast.dismiss(t.id);
              }}
            >
              Accept
            </button>
          </div>
        </div>
      ));
    });

    socket.on("visit-answer", async ({ sdp }) => {
      const pc = peerConnectionRef.current;
      if (!pc) {
        return;
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        setStatusText("In call");
      } catch (err) {
        setError("Failed to complete call setup.");
      }
    });

    socket.on("visit-ice-candidate", async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      if (!pc || !candidate || pc.signalingState === "closed") {
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error handling ICE candidate", err);
      }
    });

    socket.on("visit-peer-left", () => {
      cleanupPeer();
      setStatusText("Other participant left the call.");
    });

    socket.on("visit-call-declined", () => {
      cleanupPeer();
      setStatusText("Call was declined");
      toast.error("Video call was declined");
      navigate(-1);
    });

    return () => {
      if (socketRef.current && visitId) {
        socketRef.current.emit("leave-visit", { visitId });
        socketRef.current.disconnect();
      }
      cleanupPeer();
    };
  }, [visitId, user]);

  const handleEndCall = () => {
    if (socketRef.current && visitId) {
      socketRef.current.emit("leave-visit", { visitId });
    }
    cleanupPeer();
    navigate(-1);
  };

  if (!visitId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Invalid visit.</p>
      </div>
    );
  }

  const statusColor = error ? "text-red-400" : "text-slate-300";

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      <header className="py-6 px-4 border-b border-gray-200 flex flex-col items-center bg-white/80 backdrop-blur">
        <h1 className="text-2xl font-semibold text-gray-900">Visit Video Call</h1>
        <p className="text-xs text-gray-500 mt-1">Visit ID: {visitId}</p>
        <p className={`text-sm mt-2 ${statusColor}`}>{error || statusText}</p>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl aspect-video bg-slate-900 rounded-2xl relative overflow-hidden shadow-xl">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-black"
          />

          {!remoteConnected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-200 bg-gradient-to-br from-slate-900/80 to-slate-800/70">
              <i className="fas fa-user-circle text-6xl mb-4 text-slate-400"></i>
              <p className="font-semibold text-lg">
                Waiting for other participant...
              </p>
              <p className="text-xs text-slate-300 mt-2 max-w-xs text-center">
                Share this visit link and keep this tab open. You will join
                automatically once they accept the call.
              </p>
            </div>
          )}

          <div className="absolute bottom-4 right-4 w-32 h-20 md:w-48 md:h-28 bg-slate-900/80 rounded-lg overflow-hidden border border-white/10 shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </main>

      <footer className="pb-8 flex justify-center">
        <div className="flex items-center justify-center gap-6 bg-white/95 px-6 py-3 rounded-full shadow-xl border border-gray-200 h-16 w-64">
          <button
            type="button"
            onClick={handleToggleMic}
            className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-lg md:text-xl shadow-sm transition-colors ${
              micEnabled
                ? "bg-black text-white hover:bg-neutral-900"
                : "bg-black text-red-500 hover:bg-neutral-900"
            }`}
          >
            <i
              className={`fas ${
                micEnabled
                  ? "fa-microphone text-white"
                  : "fa-microphone-slash text-red-500"
              }`}
            ></i>
          </button>

          <button
            type="button"
            onClick={handleToggleCamera}
            className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-lg md:text-xl shadow-sm transition-colors ${
              cameraEnabled
                ? "bg-black text-white hover:bg-neutral-900"
                : "bg-black text-red-500 hover:bg-neutral-900"
            }`}
          >
            <i
              className={`fas ${
                cameraEnabled
                  ? "fa-video text-white"
                  : "fa-video-slash text-red-500"
              }`}
            ></i>
          </button>

          <button
            type="button"
            onClick={handleEndCall}
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-lg md:text-xl bg-black text-red-500 hover:bg-neutral-900 shadow-sm"
          >
            <i className="fas fa-phone-slash"></i>
          </button>
        </div>
      </footer>

      {incomingCall && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-200">
            <div className="flex flex-col items-center text-center text-gray-900">
              <i className="fas fa-video text-3xl text-emerald-500 mb-3"></i>
              <p className="font-semibold text-lg">Incoming video call</p>
              <p className="text-xs text-gray-500 mt-1">
                From: {incomingCall.callerName || "Other participant"}
              </p>
              <div className="flex gap-4 mt-5">
                <button
                  type="button"
                  onClick={handleRejectCall}
                  className="flex-1 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-800"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={handleAcceptCall}
                  className="flex-1 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-white"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitVideoCall;
