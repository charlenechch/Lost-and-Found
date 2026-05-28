// ReportPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ReportPage.css";

export default function ReportPage({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();

  const [status, setStatus] = useState("lost");
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("status", status);
    formData.append("itemName", itemName);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("date", date);
    formData.append("location", location);
    formData.append("contact", contact);
    if (photo) formData.append("photo", photo);

    try {
      const response = await axios.post(`${API_URL}/items`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const claimcode = response.data.claimcode;
      setSubmittedCode(claimcode || null);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.response?.data?.error || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success modal
  if (submittedCode !== null) {
    return (
      <div className="success-overlay">
        <div className="success-modal">
          <div className="success-icon">✅</div>
          <h2 className="success-title">Report Submitted!</h2>
          <p className="success-subtitle">Your item has been reported successfully.</p>

          <div className="success-code-box">
            <p className="success-code-label">YOUR CLAIM CODE</p>
            <p className="success-code">{submittedCode}</p>
          </div>

          <p className="success-warning">
            📸 Please screenshot this code! You'll need it to verify the item was returned.
          </p>

          <button className="success-btn" onClick={() => onClose ? onClose() : navigate("/")}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page">
      <div className="report-overlay">
        <div className="report-container">

          {/* CLOSE BUTTON */}
          <button className="close-btn" onClick={() => onClose ? onClose() : navigate("/")}>✕</button>

          {/* TITLE */}
          <h1 className="report-title">Report an Item</h1>

          {/* ERROR MESSAGE */}
          {error && <div className="error-message" style={{color: 'red', marginBottom: '10px', fontSize: '14px'}}>{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* STATUS */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="status-row">
                <label className={`status-card ${status === "lost" ? "active-lost" : ""}`}>
                  <input
                    type="radio"
                    value="lost"
                    checked={status === "lost"}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <span>Lost Item</span>
                </label>
                <label className={`status-card ${status === "found" ? "active-found" : ""}`}>
                  <input
                    type="radio"
                    value="found"
                    checked={status === "found"}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <span>Found Item</span>
                </label>
              </div>
            </div>

            {/* ITEM NAME */}
            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input
                type="text"
                placeholder="e.g., Black Backpack"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                placeholder="Provide details about the item..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* CATEGORY + DATE */}
            <div className="double-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="">Select category</option>
                  <option>Electronics</option>
                  <option>Wallet</option>
                  <option>Bag</option>
                  <option>Keys</option>
                  <option>Documents</option>
                  <option>Accessories</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* LOCATION */}
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                placeholder="e.g., Main Library, 2nd Floor"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            {/* CONTACT */}
            <div className="form-group">
              <label className="form-label">Contact Info</label>
              <input
                type="text"
                placeholder="Email or phone number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>

            {/* PHOTO */}
            <div className="form-group">
              <label className="form-label">Photo (Optional)</label>
              <label className="upload-box">
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/jpg"
                />
                <div className="upload-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <h3>{photo ? photo.name : "Click to upload photo"}</h3>
                <p>PNG, JPG up to 10MB</p>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}