import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { FiEdit2, FiCamera, FiX, FiCheck } from "react-icons/fi"; // FiCamera for profile
import { MdOutlinePhotoCamera } from "react-icons/md"; // A different camera icon for cover

const Profile = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImage: "",
    coverImage: "", // State for cover image
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null); // State for cover image file
  const [coverPreview, setCoverPreview] = useState(null); // State for cover image preview

  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false); // State for cover upload
  const [showProfileImagePopup, setShowProfileImagePopup] = useState(false);
  const [showCoverImagePopup, setShowCoverImagePopup] = useState(false); // State for cover modal
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // State for mobile view

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Handle window resize for responsiveness
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);

    if (!currentUser?.id) return;
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/users/${currentUser.id}`);
        const user = res.data.data;
        setUserData({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage || "",
          coverImage: user.coverImage || "", // Initialize cover image
        });
        setProfilePreview(user.profileImage || null);
        setCoverPreview(user.coverImage || null); // Initialize cover preview
      } catch (error) {
        toast.error("Failed to fetch user info.");
        console.error(error);
      }
    };
    fetchUser();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [currentUser.id]);

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setProfilePreview(URL.createObjectURL(file));
      setShowProfileImagePopup(true);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setShowCoverImagePopup(true);
    }
  };

  const uploadImage = async (type) => {
    let fileToUpload;
    let setUploadingState;
    let setPreviewState;
    let setShowPopupState;
    let updateField;

    if (type === "profile") {
      fileToUpload = profileImageFile;
      setUploadingState = setUploadingProfile;
      setPreviewState = setProfilePreview;
      setShowPopupState = setShowProfileImagePopup;
      updateField = "profileImage";
    } else if (type === "cover") {
      fileToUpload = coverImageFile;
      setUploadingState = setUploadingCover;
      setPreviewState = setCoverPreview;
      setShowPopupState = setShowCoverImagePopup;
      updateField = "coverImage";
    } else {
      return;
    }

    if (!fileToUpload) return;
    setUploadingState(true);

    try {
      const formData = new FormData();
      formData.append("upload", fileToUpload);
      const res = await axios.post("http://localhost:5000/api/v1/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = res.data.url;

      const updateRes = await axios.put(
        `http://localhost:5000/api/v1/users/update-profile/${currentUser.id}`,
        { [updateField]: imageUrl }
      );
      localStorage.setItem("user", JSON.stringify(updateRes.data.data)); // Update local storage
      setUserData((prev) => ({ ...prev, [updateField]: imageUrl }));
      setPreviewState(imageUrl);
      toast.success(`${type === "profile" ? "Profile" : "Cover"} image updated successfully!`);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(`Failed to upload ${type} image`);
    } finally {
      setUploadingState(false);
      setShowPopupState(false);
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

  // Inline styles for inputs and labels
  const inputStyle = (editable = true) => ({
    width: "100%",
    padding: isMobile ? "0.5rem 0.75rem" : "0.6rem 1rem", // Responsive padding
    borderRadius: "6px", // Slightly rounded corners
    border: editable ? "1px solid #CCD0D5" : "1px solid #E4E6EB", // Facebook border colors
    backgroundColor: editable ? "#FFFFFF" : "#F0F2F5", // White for editable, light grey for read-only
    boxShadow: editable ? "inset 0 1px 2px rgba(0,0,0,0.05)" : "none", // Subtle inner shadow for editable
    outline: "none",
    fontSize: isMobile ? "14px" : "15px", // Responsive font size
    color: "#1C1E21", // Dark text
    textAlign: "left",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease-in-out, background-color 0.2s ease-in-out",
  });

  const labelStyle = {
    marginBottom: "0.25rem", // Slightly reduced margin
    fontWeight: "600",
    color: "#65676B", // Darker grey for labels
    fontSize: isMobile ? "13px" : "14px", // Responsive font size
    display: "block",
    textAlign: "left",
  };

  const buttonBaseStyle = {
    padding: isMobile ? "0.6rem 1rem" : "0.75rem 1.25rem", // Responsive padding
    borderRadius: "6px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s ease-in-out",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    fontSize: isMobile ? "14px" : "15px",
  };

  const primaryButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "#1877F2", // Facebook blue
    color: "#FFFFFF",
  };

  const secondaryButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "#E4E6EB", // Light grey
    color: "#1C1E21",
  };

  const dangerButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "#FA383E", // Red for destructive actions
    color: "#FFFFFF",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start", // Align to top for better content flow
        background: "#F0F2F5", // Facebook background color
        minHeight: "100vh",
        padding: isMobile ? "1rem" : "2rem", // Responsive padding
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        boxSizing: "border-box", // Ensure padding is included in total width
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: isMobile ? "95%" : "850px", // Increased max width for desktop to accommodate cover
          backgroundColor: "#FFFFFF", // White card background
          borderRadius: "8px", // Slightly rounded corners for the card
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)", // More prominent shadow
          overflow: "hidden",
        }}
      >
        {/* Cover Image Section */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: isMobile ? "150px" : "250px", // Responsive height for cover
            backgroundColor: "#E4E6EB", // Placeholder background
            backgroundImage: coverPreview ? `url(${coverPreview})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center", // Ensures the image is centered
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            display: "flex",
            justifyContent: "flex-end", // Align button to bottom right
            alignItems: "flex-end", // Align button to bottom right
            padding: "1rem", // Padding for the button
          }}
        >
          <label
            style={{
              ...buttonBaseStyle,
              backgroundColor: "rgba(255,255,255,0.8)", // Semi-transparent white
              color: "#1C1E21",
              padding: isMobile ? "0.4rem 0.8rem" : "0.6rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.8)")}
          >
            <MdOutlinePhotoCamera size={isMobile ? 18 : 20} />
            <span style={{ display: isMobile ? "none" : "inline" }}>Edit Cover Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {/* Profile Picture and User Info */}
        <div
          style={{
            position: "relative",
            marginTop: isMobile ? "-60px" : "-80px", // Pull profile pic up over cover
            padding: isMobile ? "0 1rem 1rem" : "0 1.5rem 1.5rem", // Responsive padding
            textAlign: "center",
            zIndex: 10, // Ensure profile pic is above other content
          }}
        >
          <div
            style={{
              position: "relative",
              display: "inline-block",
              border: `5px solid #FFFFFF`, // White border around profile pic
              borderRadius: "50%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)", // Shadow for profile pic
              background: "#FFFFFF", // Background for the border
            }}
          >
            {profilePreview ? (
              <img
                src={profilePreview}
                alt="Profile"
                style={{
                  width: isMobile ? "110px" : "150px", // Responsive image size
                  height: isMobile ? "110px" : "150px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block", // Remove extra space below image
                }}
              />
            ) : (
              <div
                style={{
                  width: isMobile ? "110px" : "150px", // Responsive size
                  height: isMobile ? "110px" : "150px",
                  borderRadius: "50%",
                  backgroundColor: "#E4E6EB", // Light grey placeholder
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? "2.5rem" : "3.5rem", // Responsive font size
                  fontWeight: "bold",
                  color: "#65676B",
                }}
              >
                {userData.firstName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <label
              style={{
                position: "absolute",
                bottom: isMobile ? "5px" : "10px", // Responsive positioning
                right: isMobile ? "5px" : "10px", // Responsive positioning
                background: "#E4E6EB", // Light grey background for camera icon
                padding: isMobile ? "0.4rem" : "0.5rem", // Responsive padding
                borderRadius: "50%",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)", // Subtle shadow
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1C1E21", // Dark icon color
                transition: "background-color 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#CCD0D5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E4E6EB")}
            >
              <FiCamera size={isMobile ? 18 : 20} />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
          <h3 style={{ marginTop: "1rem", color: "#1C1E21", fontSize: isMobile ? "1.4rem" : "1.75rem", fontWeight: "bold" }}>
            {userData.firstName} {userData.lastName}
          </h3>
          <p style={{ color: "#65676B", fontSize: isMobile ? "0.85rem" : "0.95rem" }}>{userData.email}</p>
        </div>

        {/* Account Information Section */}
        <div style={{ padding: isMobile ? "1rem" : "1.5rem", paddingTop: isMobile ? "0.5rem" : "1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              borderBottom: "1px solid #E4E6EB", // Separator line
              paddingBottom: "0.5rem",
            }}
          >
            <strong style={{ color: "#1C1E21", fontSize: isMobile ? "1rem" : "1.1rem" }}>Account Information</strong>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  ...secondaryButtonStyle,
                  backgroundColor: "transparent", // Make it look like a text link
                  color: "#1877F2", // Facebook blue for edit link
                  padding: isMobile ? "0.25rem 0.5rem" : "0.5rem 0.75rem", // Smaller padding for text link
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(24, 119, 242, 0.1)")} // Blue hover
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <FiEdit2 size={isMobile ? 16 : 18} /> Edit
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  ...secondaryButtonStyle,
                  backgroundColor: "#E4E6EB", // Light grey for cancel button
                  color: "#1C1E21",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#CCD0D5")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E4E6EB")}
              >
                <FiX size={isMobile ? 16 : 18} /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem", // Slightly reduced gap
              }}
            >
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={inputStyle(isEditing)}
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={inputStyle(isEditing)}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={userData.email}
                  readOnly
                  style={inputStyle(false)}
                />
              </div>
              {isEditing && (
                <button
                  type="submit"
                  style={{
                    ...primaryButtonStyle,
                    marginTop: "1rem", // Add some top margin
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#166FE5")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1877F2")}
                >
                  <FiCheck size={isMobile ? 16 : 18} /> Save Changes
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Profile Image Upload Modal */}
      {showProfileImagePopup && profilePreview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)", // Darker overlay
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000, // Higher z-index for modal
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "8px", // Rounded corners for modal
              width: "90%",
              maxWidth: isMobile ? "300px" : "400px", // Responsive width
              padding: isMobile ? "1.25rem" : "1.5rem", // Responsive padding
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)", // Stronger shadow
            }}
          >
            <h2 style={{ margin: "0 0 1rem 0", color: "#1C1E21", fontSize: isMobile ? "1.1rem" : "1.25rem" }}>Update Profile Picture</h2>
            <img
              src={profilePreview}
              alt="Preview"
              style={{
                width: isMobile ? "100px" : "120px", // Responsive image size
                height: isMobile ? "100px" : "120px",
                borderRadius: "50%",
                objectFit: "cover",
                margin: "1rem auto", // Center image
                border: "4px solid #F0F2F5", // Light border
              }}
            />
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                onClick={() => {
                  setShowProfileImagePopup(false);
                  setProfileImageFile(null); // Clear selected file
                  setProfilePreview(userData.profileImage || null); // Revert preview to current profile image
                }}
                style={{
                  ...secondaryButtonStyle,
                  flex: 1,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#CCD0D5")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E4E6EB")}
              >
                Cancel
              </button>
              <button
                onClick={() => uploadImage("profile")}
                disabled={uploadingProfile}
                style={{
                  ...primaryButtonStyle,
                  flex: 1,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#166FE5")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1877F2")}
              >
                {uploadingProfile ? (
                  <div
                    style={{
                      width: "1rem",
                      height: "1rem",
                      borderWidth: "2px",
                      borderTopColor: "white",
                      borderColor: "rgba(255,255,255,0.3)",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cover Image Upload Modal */}
      {showCoverImagePopup && coverPreview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)", // Darker overlay
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000, // Higher z-index for modal
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "8px", // Rounded corners for modal
              width: "90%",
              maxWidth: isMobile ? "300px" : "400px", // Responsive width
              padding: isMobile ? "1.25rem" : "1.5rem", // Responsive padding
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)", // Stronger shadow
            }}
          >
            <h2 style={{ margin: "0 0 1rem 0", color: "#1C1E21", fontSize: isMobile ? "1.1rem" : "1.25rem" }}>Update Cover Photo</h2>
            <img
              src={coverPreview}
              alt="Preview"
              style={{
                maxWidth: "100%",
                height: isMobile ? "120px" : "150px", // Responsive height
                objectFit: "cover",
                margin: "1rem auto", // Center image
                borderRadius: "4px", // Slightly rounded corners for cover preview
                border: "4px solid #F0F2F5", // Light border
              }}
            />
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                onClick={() => {
                  setShowCoverImagePopup(false);
                  setCoverImageFile(null); // Clear selected file
                  setCoverPreview(userData.coverImage || null); // Revert preview to current cover image
                }}
                style={{
                  ...secondaryButtonStyle,
                  flex: 1,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#CCD0D5")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E4E6EB")}
              >
                Cancel
              </button>
              <button
                onClick={() => uploadImage("cover")}
                disabled={uploadingCover}
                style={{
                  ...primaryButtonStyle,
                  flex: 1,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#166FE5")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1877F2")}
              >
                {uploadingCover ? (
                  <div
                    style={{
                      width: "1rem",
                      height: "1rem",
                      borderWidth: "2px",
                      borderTopColor: "white",
                      borderColor: "rgba(255,255,255,0.3)",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
