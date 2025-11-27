import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { visitAPI, propertyAPI } from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import { useVideoCall } from "../../context/VideoCallContext";
import "./ScheduleVisit.css";

const ScheduleVisit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyIdFromUrl = searchParams.get("propertyId");

  const { user } = useAppSelector(selectAuth);
  const { startVisitCall } = useVideoCall();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [myVisits, setMyVisits] = useState([]);

  const [formData, setFormData] = useState({
    propertyId: propertyIdFromUrl || "",
    visitDate: "",
    timeSlot: "",
    notes: "",
  });

  const timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
  ];

  const [availableSlots, setAvailableSlots] = useState(timeSlots);
  const [selectedSlot, setSelectedSlot] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (propertyIdFromUrl) {
      setFormData((prev) => ({ ...prev, propertyId: propertyIdFromUrl }));
      fetchPropertyDetails(propertyIdFromUrl);
    }
  }, [propertyIdFromUrl]);

  useEffect(() => {
    if (formData.visitDate && formData.propertyId) {
      fetchAvailableSlots();
    }
  }, [formData.visitDate, formData.propertyId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch properties
      const propertiesRes = await propertyAPI.getAllProperties();
      console.log("Properties response:", propertiesRes.data);

      // Handle different response structures
      let propertiesData = [];
      if (propertiesRes.data.success) {
        propertiesData = propertiesRes.data.properties || [];
      } else if (Array.isArray(propertiesRes.data)) {
        propertiesData = propertiesRes.data;
      } else if (propertiesRes.data.data) {
        propertiesData = propertiesRes.data.data;
      }

      console.log("Extracted properties:", propertiesData);
      setProperties(propertiesData);

      // Fetch visits
      try {
        const visitsRes = await visitAPI.getMyVisits();
        console.log("Visits API response:", visitsRes.data);
        if (visitsRes.data.success) {
          // Handle the nested data structure from the backend API
          const visitsData =
            visitsRes.data.data?.visits || visitsRes.data.visits || [];
          console.log("Extracted visits data:", visitsData);
          setMyVisits(visitsData);
        }
      } catch (visitError) {
        console.log("No visits found or error fetching visits:", visitError);
        // Don't show error for visits as user might not have any
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyDetails = async (propertyId) => {
    try {
      const response = await propertyAPI.getPropertyById(propertyId);
      if (response.data.success) {
        setSelectedProperty(response.data.property);
      }
    } catch (error) {
      console.error("Error fetching property:", error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await visitAPI.getAvailableSlots({
        date: formData.visitDate,
        propertyId: formData.propertyId,
      });

      if (response.data.success) {
        setAvailableSlots(response.data.timeSlots || timeSlots);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      setAvailableSlots(timeSlots);
    }
  };

  const handlePropertySelect = (propertyId) => {
    setFormData({ ...formData, propertyId });
    const property = properties.find((p) => p._id === propertyId);
    setSelectedProperty(property);
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, visitDate: e.target.value });
    setSelectedSlot("");
    setFormData((prev) => ({ ...prev, timeSlot: "" }));
  };

  const handleSlotSelect = (slot) => {
    if (availableSlots.includes(slot)) {
      setSelectedSlot(slot);
      setFormData({ ...formData, timeSlot: slot });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.propertyId || !formData.visitDate || !formData.timeSlot) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      const response = await visitAPI.scheduleVisit(formData);

      if (response.data.success) {
        toast.success(
          "Visit scheduled successfully! Waiting for agent approval."
        );
        setFormData({
          propertyId: "",
          visitDate: "",
          timeSlot: "",
          notes: "",
        });
        setSelectedSlot("");
        setSelectedProperty(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error scheduling visit:", error);
      toast.error(error.response?.data?.message || "Failed to schedule visit");
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
  };

  const getStatusClass = (status) => {
    const statusMap = {
      pending: "status-pending",
      approved: "status-approved",
      rejected: "status-rejected",
      cancelled: "status-cancelled",
      completed: "status-completed",
    };
    return statusMap[status] || "";
  };

  if (loading) {
    return (
      <div className="schedule-visit-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="schedule-visit-container">
      <h1 className="page-title">Schedule a Property Visit</h1>

      <div className="visit-form-wrapper">
        <form onSubmit={handleSubmit} className="visit-form">
          {/* Property Selection */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="step-number">1</span> Select a Property
            </h2>

            {selectedProperty ? (
              <div className="property-card selected">
                <img
                  src={selectedProperty.images?.[0] || "/assets/property-1.jpg"}
                  alt={selectedProperty.title}
                  className="property-image"
                />
                <div className="property-details">
                  <h3 className="property-title">{selectedProperty.title}</h3>
                  <p className="property-location">
                    <i className="fas fa-map-marker-alt"></i>{" "}
                    {selectedProperty.location}
                  </p>
                  <p className="property-price">
                    ₹{selectedProperty.price?.toLocaleString("en-IN")}
                  </p>
                  {selectedProperty.features && (
                    <div className="property-features">
                      <span>
                        <i className="fas fa-bed"></i>{" "}
                        {selectedProperty.features.beds} Beds
                      </span>
                      <span>
                        <i className="fas fa-bath"></i>{" "}
                        {selectedProperty.features.baths} Baths
                      </span>
                      <span>
                        <i className="fas fa-ruler-combined"></i>{" "}
                        {selectedProperty.features.sqft} sqft
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="propertySelect">Choose a property:</label>
                  <select
                    id="propertySelect"
                    value={formData.propertyId}
                    onChange={(e) => handlePropertySelect(e.target.value)}
                    className="form-control"
                    required
                  >
                    <option value="">-- Select a property --</option>
                    {properties.map((property) => (
                      <option key={property._id} value={property._id}>
                        {property.title} - {property.location}
                      </option>
                    ))}
                  </select>
                </div>

                {properties.length > 0 ? (
                  <div className="property-cards">
                    {properties.slice(0, 6).map((property) => (
                      <div
                        key={property._id}
                        className={`property-card ${
                          formData.propertyId === property._id ? "selected" : ""
                        }`}
                        onClick={() => handlePropertySelect(property._id)}
                      >
                        <img
                          src={property.images?.[0] || "/assets/property-1.jpg"}
                          alt={property.title}
                          className="property-image"
                        />
                        <div className="property-details">
                          <h3 className="property-title">{property.title}</h3>
                          <p className="property-location">
                            <i className="fas fa-map-marker-alt"></i>{" "}
                            {property.location}
                          </p>
                          <p className="property-price">
                            ₹{property.price?.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-home"></i>
                    <p>
                      No properties available at the moment. Please check back
                      later.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Date Selection */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="step-number">2</span> Choose Visit Date
            </h2>
            <div className="form-group">
              <label htmlFor="visitDate">Visit Date:</label>
              <input
                type="date"
                id="visitDate"
                value={formData.visitDate}
                onChange={handleDateChange}
                min={getMinDate()}
                max={getMaxDate()}
                className="form-control"
                required
              />
              <small className="form-hint">
                Select a date between tomorrow and 30 days from now
              </small>
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="step-number">3</span> Select Time Slot
            </h2>
            <div className="time-slot-grid">
              {timeSlots.map((slot) => (
                <div
                  key={slot}
                  className={`time-slot ${
                    selectedSlot === slot ? "selected" : ""
                  } ${!availableSlots.includes(slot) ? "unavailable" : ""}`}
                  onClick={() => handleSlotSelect(slot)}
                >
                  {slot}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="step-number">4</span> Additional Notes
            </h2>
            <div className="form-group">
              <label htmlFor="notes">Notes for the agent (optional):</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="form-control"
                rows="3"
                placeholder="Any specific questions or requirements for your visit?"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={
              !formData.propertyId || !formData.visitDate || !formData.timeSlot
            }
          >
            <i className="fas fa-calendar-check"></i> Schedule Visit
          </button>
        </form>
      </div>

      {/* My Visits Section */}
      <div className="my-visits-section">
        <h2 className="section-title">
          <i className="fas fa-list"></i> Your Scheduled Visits
        </h2>

        {(() => {
          // Debug: Log all visits to see what we have
          console.log("All visits:", myVisits);

          // Filter to only show active visits (not completed/cancelled/rejected)
          const activeVisits = myVisits.filter((visit) => {
            const status = visit.status?.toLowerCase();
            const isActive = status === "pending" || status === "approved";

            console.log(
              `Visit ${visit._id}: status=${visit.status}, isActive=${isActive}, date=${visit.visitDate}`
            );

            return isActive;
          });

          console.log("Filtered active visits:", activeVisits);

          return activeVisits.length > 0 ? (
            <div className="visit-list">
              {activeVisits.map((visit) => (
                <div key={visit._id} className="visit-card">
                  <img
                    src={
                      visit.propertyId?.images?.[0] || "/assets/property-1.jpg"
                    }
                    alt={visit.propertyId?.title}
                    className="visit-image"
                  />
                  <div className="visit-details">
                    <h3 className="visit-property">
                      {visit.propertyId?.title}
                    </h3>
                    <div className="visit-meta">
                      <div className="visit-meta-item">
                        <i className="far fa-calendar"></i>
                        {new Date(visit.visitDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="visit-meta-item">
                        <i className="far fa-clock"></i>
                        {visit.timeSlot}
                      </div>
                    </div>
                    <span
                      className={`visit-status ${getStatusClass(visit.status)}`}
                    >
                      {visit.status?.toUpperCase()}
                    </span>
                    {visit.agentNotes && (
                      <div className="visit-notes">
                        <strong>Agent Notes:</strong> {visit.agentNotes}
                      </div>
                    )}
                  </div>
                  <div className="visit-actions">
                    {visit.status?.toLowerCase() === "approved" && (
                      <button
                        onClick={() => {
                          const otherUserId =
                            visit.agentId?.userId?._id || visit.agentId?.userId;
                          const otherName =
                            visit.agentId?.userId?.name || visit.agentId?.name;
                          if (otherUserId) {
                            startVisitCall({
                              visitId: visit._id,
                              otherUserId,
                              otherName,
                            });
                          } else {
                            navigate(`/visits/video/${visit._id}`);
                          }
                        }}
                        className="btn-video-call"
                      >
                        <i className="fas fa-video"></i> Join Video Call
                      </button>
                    )}
                    <button
                      onClick={() =>
                        navigate(`/property/${visit.propertyId?._id}`)
                      }
                      className="btn-outline"
                    >
                      <i className="fas fa-eye"></i> View Property
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-calendar-times"></i>
              <p>You have no upcoming visits scheduled.</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ScheduleVisit;
