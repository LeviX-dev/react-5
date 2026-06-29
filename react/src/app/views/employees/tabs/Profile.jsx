import React, { useState, useRef, useEffect } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import avatar from "../Image/avatar.jpg";
import api from "app/services/api";
import { setUserData } from "app/redux/auth/authSlice";

const formatDisplayDate = (value) => {
  if (!value) return "-";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return String(value);

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Profile({ employee, onPhotoUpdate }) {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Load photo from employee data when component mounts or employee changes
  useEffect(() => {
    if (employee?.photo) {
      setPhotoUrl(employee.photo);
    }
  }, [employee?.photo]);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadError("Only gif, jpg, jpeg, png allowed");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setUploadError(null);
    setUploadMessage(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setUploadError("Please select image");
      return;
    }

    setLoading(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append("photo", file); // The file
      formData.append("employee_id", employee?.id); // Employee ID

      const response = await api.post("/api/employees/upload-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        const uploadedPhoto = `${response.data.data.photo.split("?")[0]}?t=${Date.now()}`;
        setUploadMessage("Photo uploaded successfully!");
        // Update the photoUrl with the new photo path
        setPhotoUrl(uploadedPhoto);
        setPreview(null);
        setFile(null);
        fileInputRef.current.value = ""; // Reset file input

        let latestAuthUser = authUser;

        try {
          const meResponse = await api.get("/api/auth/me");
          if (meResponse.data?.user) {
            latestAuthUser = meResponse.data.user;
          }
        } catch (refreshError) {
          // Keep local state update even if refresh endpoint is temporarily unavailable.
        }

        if (latestAuthUser) {
          dispatch(
            setUserData({
              ...latestAuthUser,
              photo: uploadedPhoto,
              employee_photo: response.data.data.photo,
              profile_photo: response.data.data?.filename || latestAuthUser.profile_photo,
            }),
          );
        }

        // Call parent callback to refresh employee data if provided
        if (onPhotoUpdate) {
          onPhotoUpdate(response.data.data);
        }

        // Clear message after 3 seconds
        setTimeout(() => setUploadMessage(null), 3000);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      const errorMsg = error.response?.data?.message || "Failed to upload photo. Please try again.";
      setUploadError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setFile(null);
    setUploadError(null);
    setUploadMessage(null);
    fileInputRef.current.value = ""; // Reset file input
  };

  // Get employee details
  const fullName = `${employee?.first_name || ""} ${employee?.last_name || ""}`.trim();
  const email = employee?.email || "-";
  const phone = employee?.contact_no || "-";
  const designation = employee?.designation?.designation_name || employee?.designation || "-";
  const department = employee?.department?.department_name || employee?.department || "-";
  const company = employee?.company?.company_name || employee?.company || "-";
  const dob = formatDisplayDate(employee?.date_of_birth);
  const joiningDate = formatDisplayDate(employee?.joining_date);
  const staffId = employee?.staff_id || "-";
  const gender = employee?.gender || "-";
  const address = employee?.address || "-";
  const city = employee?.city || "-";
  const state = employee?.state || "-";
  const country = employee?.country || "-";
  const zipCode = employee?.zip_code || "-";

  return (
    <Card>
      <Card.Body>
        <Row className="align-items-center">
          {/* Profile Picture with Edit Icon */}
          <Col md={4} className="text-center">
            <div className="position-relative d-inline-block mb-3">
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 8,
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Employee Photo"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <img
                    src={avatar}
                    alt="Avatar"
                    width={140}
                    height={140}
                    className="rounded"
                  />
                )}
              </div>
              {/* Edit Icon */}
              <button
                className="btn btn-sm position-absolute"
                style={{
                  bottom: "0",
                  right: "0",
                  backgroundColor: "#663399",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Edit Profile Picture"
              >
                <i className="i-Edit text-white"></i>
              </button>
            </div>
            <h6 className="mb-1">{fullName}</h6>
            <p className="text-muted small mb-0">{designation}</p>
          </Col>

          {/* Employee Details */}
          <Col md={8}>
            <h6 className="mb-2">Basic Information</h6> 
            <Row className="g-2">
              <Col md={3}>
                <div className="p-2 rounded">
                  <small className="text-muted d-block mb-1">Staff ID</small>
                  <strong>{staffId}</strong>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-2 rounded">
                  <small className="text-muted d-block mb-1">Email</small>
                  <strong>{email}</strong>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-2 rounded">
                  <small className="text-muted d-block mb-1">Phone</small>
                  <strong>{phone}</strong>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-2 rounded">
                  <small className="text-muted d-block mb-1">Department</small>
                  <strong>{department}</strong>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-2 rounded">
                  <small className="text-muted d-block mb-1">Designation</small>
                  <strong>{designation}</strong>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-2 rounded">
                  <small className="text-muted d-block mb-1">Date of Birth</small>
                  <strong>{dob}</strong>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-2 rounded">
                  <small className="text-muted d-block mb-1">Joining Date</small>
                  <strong>{joiningDate}</strong>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-2 rounded">
                  <small className="text-muted d-block mb-1">Gender</small>
                  <strong>{gender}</strong>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-2 rounded">
                  <small className="text-muted d-block mb-1">Address</small>
                  <strong>{address}</strong>
                </div>
              </Col>
            </Row>

            {/* Hidden File Input */}
            <Form.Control
              ref={fileInputRef}
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: "none" }}
            />

            {/* Show save button only if file is selected */}
            {file && (
              <div className="mt-2 pt-2 border-top">
                {uploadMessage && (
                  <div className="alert alert-success mb-2" role="alert">
                    {uploadMessage}
                  </div>
                )}
                {uploadError && (
                  <div className="alert alert-danger mb-2" role="alert">
                    {uploadError}
                  </div>
                )}
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  size="sm"
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Save Picture"}
                </Button>
                <Button
                  variant="light"
                  onClick={handleCancel}
                  size="sm"
                  className="ms-2"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Show error message if file not selected but error exists */}
            {!file && uploadError && (
              <div className="mt-2">
                <div className="alert alert-danger mb-0" role="alert">
                  {uploadError}
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

