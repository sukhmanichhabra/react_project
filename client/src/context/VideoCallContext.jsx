import React, { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppSelector } from "../store/hooks";
import { selectAuth } from "../store/slices/authSlice";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

const VideoCallContext = createContext(null);

export const VideoCallProvider = ({ children }) => {
  const { user, isAuthenticated } = useAppSelector(selectAuth);
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (socketRef.current) {
      socketRef.current.emit("register-user", {
        userId: user._id,
        name: user.name || user.username || user.email,
        role: user.role,
      });
      return;
    }

    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register-user", {
        userId: user._id,
        name: user.name || user.username || user.email,
        role: user.role,
      });
    });

    socket.on("visit-ring", ({ visitId, fromName }) => {
      if (!visitId) return;

      toast(
        (t) => (
          <div className="text-sm">
            <div className="font-semibold mb-1">Incoming visit video call</div>
            {fromName && (
              <div className="text-xs text-gray-200 mb-2">From: {fromName}</div>
            )}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                className="px-3 py-1 rounded-md text-xs bg-gray-700 hover:bg-gray-600 text-white"
                onClick={() => {
                  toast.dismiss(t.id);
                }}
              >
                Dismiss
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-md text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate(`/visits/video/${visitId}`);
                }}
              >
                Join Call
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user, navigate]);

  const startVisitCall = useCallback(
    ({ visitId, otherUserId, otherName }) => {
      if (!visitId) return;

      navigate(`/visits/video/${visitId}`);

      if (socketRef.current && otherUserId) {
        socketRef.current.emit("visit-ring", {
          visitId,
          toUserId: otherUserId,
          fromName: user?.name || user?.username || user?.email,
          otherName,
        });
      }
    },
    [navigate, user]
  );

  const value = {
    startVisitCall,
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = () => {
  const ctx = useContext(VideoCallContext);
  if (!ctx) {
    throw new Error("useVideoCall must be used within a VideoCallProvider");
  }
  return ctx;
};
