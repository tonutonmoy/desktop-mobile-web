import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { FiEdit2, FiCamera, FiX, FiCheck } from "react-icons/fi";

const Profile = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImage: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/v1/users/${currentUser.id}`
        );
        const user = res.data.data;
        setUserData({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage || "",
        });
        setPreview(user.profileImage || null);
      } catch (error) {
        toast.error("Failed to fetch user info.");
        console.error(error);
      }
    };

    fetchUser();
  }, [currentUser.id]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setShowImagePopup(true);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("upload", imageFile);

      const res = await axios.post(
        "http://localhost:5000/api/v1/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const imageUrl = res.data.url;

      const updateRes = await axios.put(
        `http://localhost:5000/api/v1/users/update-profile/${currentUser.id}`,
        { profileImage: imageUrl }
      );

      localStorage.setItem("user", JSON.stringify(updateRes.data.data));
      setUserData((prev) => ({ ...prev, profileImage: imageUrl }));
      setPreview(imageUrl);
      toast.success("Profile image updated successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      setShowImagePopup(false);
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:5000/api/v1/users/update-profile/${currentUser.id}`,
        userData
      );
      localStorage.setItem("user", JSON.stringify(res.data.data));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Error updating profile");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "400px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        
        <div style={{ background: "#25D366", padding: "1rem", color: "#fff", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Profile</h1>
        </div>

        <div style={{ padding: "1.5rem", textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                style={{
                  width: "8rem",
                  height: "8rem",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid white",
                  boxShadow: "0 0 8px rgba(0,0,0,0.1)",
                }}
              />
            ) : (
              <div style={{
                width: "8rem",
                height: "8rem",
                borderRadius: "50%",
                backgroundColor: "#ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#666"
              }}>
                {userData.firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <label style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              background: "#fff",
              padding: "0.5rem",
              borderRadius: "50%",
              boxShadow: "0 0 6px rgba(0,0,0,0.2)",
              cursor: "pointer",
            }}>
              <FiCamera />
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
            </label>
          </div>

          <h2 style={{ marginTop: "1rem", fontSize: "1.25rem", fontWeight: "600", color: "#333" }}>
            {userData.firstName} {userData.lastName}
          </h2>
          <p style={{ color: "#666" }}>{userData.email}</p>
        </div>

        <div style={{ padding: "0 1.5rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", alignItems: "center" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "500", color: "#333" }}>Account Info</h3>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} style={{ color: "#25D366", display: "flex", alignItems: "center", gap: "0.25rem", border: "none", background: "none", cursor: "pointer" }}>
                <FiEdit2 size={16} /> Edit
              </button>
            ) : (
              <button onClick={() => setIsEditing(false)} style={{ color: "#999", display: "flex", alignItems: "center", gap: "0.25rem", border: "none", background: "none", cursor: "pointer" }}>
                <FiX size={16} /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem", color: "#555" }}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "0.5rem",
                    backgroundColor: !isEditing ? "#f5f5f5" : "#fff",
                    cursor: !isEditing ? "not-allowed" : "auto"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem", color: "#555" }}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "0.5rem",
                    backgroundColor: !isEditing ? "#f5f5f5" : "#fff",
                    cursor: !isEditing ? "not-allowed" : "auto"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem", color: "#555" }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "0.5rem",
                    backgroundColor: "#f5f5f5",
                    cursor: "not-allowed"
                  }}
                />
              </div>

              {isEditing && (
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    backgroundColor: "#25D366",
                    color: "#fff",
                    fontWeight: "600",
                    borderRadius: "0.5rem",
                    border: "none",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer"
                  }}
                >
                  <FiCheck size={18} /> Save Changes
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImagePopup && preview && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
        }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "1rem", width: "100%", maxWidth: "400px", overflow: "hidden", boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#333" }}>Update Profile Picture</h2>
            </div>
            <div style={{ padding: "1.5rem", textAlign: "center" }}>
              <img src={preview} alt="Preview" style={{
                width: "10rem", height: "10rem",
                borderRadius: "50%", objectFit: "cover",
                marginBottom: "1rem", border: "4px solid white", boxShadow: "0 0 6px rgba(0,0,0,0.1)"
              }} />
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => {
                    setShowImagePopup(false);
                    setPreview(userData.profileImage || null);
                  }}
                  style={{
                    flex: 1, padding: "0.5rem",
                    backgroundColor: "#eee",
                    borderRadius: "0.5rem",
                    fontWeight: "500",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={uploadImage}
                  disabled={uploading}
                  style={{
                    flex: 1, padding: "0.5rem",
                    backgroundColor: "#25D366",
                    color: "#fff",
                    fontWeight: "500",
                    borderRadius: "0.5rem",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
