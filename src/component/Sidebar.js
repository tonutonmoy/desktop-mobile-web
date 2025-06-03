import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import Users from "./Users"; // Assuming Users component is correctly imported and styled internally
// Removed react-icons imports, using inline SVGs instead
import { toast } from 'sonner'; // Import toast from sonner

const Sidebar = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false); // State for logout menu visibility
  const moreOptionsButtonRef = useRef(null); // Ref for the more options button
  const logoutMenuRef = useRef(null); // Ref for the logout menu itself
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Effect to handle clicks outside the logout menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        logoutMenuRef.current &&
        !logoutMenuRef.current.contains(event.target) &&
        moreOptionsButtonRef.current &&
        !moreOptionsButtonRef.current.contains(event.target)
      ) {
        setShowLogoutMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user data from local storage
    toast.success("Logged out successfully!"); // Show success toast
    navigate("/login"); // Redirect to login page
    // For a full application reset, you might also want to do:
    // window.location.href = "/login";
  };

  return (
    <div
      style={{
        width: isMobile ? "100vw" : "360px", // Full width on mobile, fixed on desktop
        minWidth: isMobile ? "100vw" : "360px", // Ensure minimum width for desktop
        backgroundColor: "#F0F2F5", // Facebook light grey background
        height: "100vh",
        borderRight: isMobile ? "none" : "1px solid #E4E6EB", // No border on mobile
        display: "flex",
        flexDirection: "column",
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', // Facebook's preferred font stack
        boxSizing: "border-box", // Include padding and border in the element's total width and height
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#FFFFFF", // White header like FB Messenger
          padding: isMobile ? "12px 16px" : "16px 20px", // Responsive padding
          color: "#1C1E21", // Dark text
          fontWeight: "700",
          fontSize: isMobile ? "1.1rem" : "1.25rem", // Responsive font size
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)", // Subtle shadow
          borderBottom: "1px solid #E4E6EB", // Light border
          flexShrink: 0, // Prevent header from shrinking
        }}
      >
        {/* Home Link - Styled like Facebook */}
        <Link
          to='/home'
          style={{
            letterSpacing: "0.02em",
            color: "#1877F2", // Facebook blue for the link
            textDecoration: "none", // Remove underline
            fontWeight: "bold",
            fontSize: isMobile ? "1.1rem" : "1.25rem",
            padding: "4px 8px", // Add some padding to make it clickable
            borderRadius: "6px", // Slightly rounded corners
            transition: "background-color 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(24, 119, 242, 0.1)")} // Light blue hover
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          Home
        </Link>

        <div
          style={{
            display: "flex",
            gap: isMobile ? "10px" : "16px", // Responsive gap
            color: "#65676B", // Icons are grey
            position: "relative", // Needed for absolute positioning of the logout menu
          }}
        >
          <button
            aria-label="Filter"
            style={{
              padding: "8px", // Larger touch target
              borderRadius: "50%",
              cursor: "pointer",
              backgroundColor: "transparent", // Transparent background
              border: "none",
              transition: "background-color 0.2s ease-in-out",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0, 123, 255, 0.1)")
            } // Blue hover
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            {/* BsFilter icon replaced with inline SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? 20 : 22} height={isMobile ? 20 : 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#007BFF" }}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          </button>

          <button
            ref={moreOptionsButtonRef} // Assign ref to the button
            aria-label="More options"
            onClick={() => setShowLogoutMenu(!showLogoutMenu)} // Toggle logout menu
            style={{
              padding: "8px", // Larger touch target
              borderRadius: "50%",
              cursor: "pointer",
              backgroundColor: "transparent", // Transparent background
              border: "none",
              transition: "background-color 0.2s ease-in-out",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0, 123, 255, 0.1)")
            } // Blue hover
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            {/* FiMoreVertical icon replaced with inline SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? 20 : 22} height={isMobile ? 20 : 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#007BFF" }}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>

          {/* Logout Menu */}
          {showLogoutMenu && (
            <div
              ref={logoutMenuRef} // Assign ref to the menu
              style={{
                position: "absolute",
                top: "calc(100% + 10px)", // Position below the button
                right: "0",
                backgroundColor: "#FFFFFF", // White background
                borderRadius: "8px", // Rounded corners
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)", // Subtle shadow
                minWidth: "160px", // Slightly wider for better padding
                zIndex: 20, // Ensure it's above other content
                padding: "4px 0", // Reduced vertical padding for a tighter menu
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 16px", // Increased horizontal padding
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "15px", // Slightly larger font for readability
                  color: "#1C1E21", // Dark text color
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background-color 0.2s ease-in-out",
                  borderRadius: "6px", // Rounded corners for the button itself
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F0F2F5")} // Light grey hover
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div
        style={{
          backgroundColor: "#FFFFFF", // White background for search area
          padding: isMobile ? "8px 12px" : "10px 16px", // Responsive padding
          borderBottom: "1px solid #E4E6EB",
          flexShrink: 0, // Prevent search from shrinking
        }}
      >
        <div
          style={{
            backgroundColor: "#F0F2F5", // Light grey background for input
            borderRadius: "20px", // Rounded search bar
            display: "flex",
            alignItems: "center",
            padding: isMobile ? "6px 12px" : "8px 16px", // Responsive padding
            gap: "8px",
          }}
        >
            {/* FiSearch icon replaced with inline SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#65676B" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Search Messenger"
            style={{
              flex: 1,
              border: "none",
              backgroundColor: "transparent",
              outline: "none",
              fontSize: isMobile ? "13px" : "14px", // Responsive font size
              color: "#050505",
              padding: "0", // Remove default input padding
            }}
          />
        </div>
      </div>

      {/* Users List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          backgroundColor: "#FFFFFF", // White background for user list
          paddingTop: isMobile ? "4px" : "8px", // Responsive padding
          paddingBottom: isMobile ? "4px" : "8px",
        }}
      >
        {/* The Users component will be rendered here.
            Ensure that the Users component itself applies Facebook-like
            styling to individual user list items (e.g., rounded avatars,
            online status indicators, appropriate padding, and hover states). */}
        <Users />
      </div>

      {/* Profile Link */}
      <div
        style={{
          backgroundColor: "#FFFFFF", // White background
          padding: isMobile ? "10px 12px" : "12px 16px", // Responsive padding
          borderTop: "1px solid #E4E6EB",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          cursor: "pointer",
          transition: "background-color 0.2s ease-in-out",
          flexShrink: 0, // Prevent profile link from shrinking
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F0F2F5")} // Light grey hover
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
      >
        <Link
          to="/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            color: "#050505", // Dark text for link
            width: "100%",
          }}
        >
          {currentUser?.profileImage ? (
            <img
              src={currentUser.profileImage}
              alt="Profile"
              style={{
                width: isMobile ? "36px" : "40px", // Responsive avatar size
                height: isMobile ? "36px" : "40px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1.5px solid #E4E6EB", // Light border
              }}
            />
          ) : (
            <div
              style={{
                width: isMobile ? "36px" : "40px", // Responsive avatar size
                height: isMobile ? "36px" : "40px",
                borderRadius: "50%",
                backgroundColor: "#E4E6EB", // Light grey placeholder
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#65676B", // Dark grey text
                fontWeight: "700",
                fontSize: isMobile ? "16px" : "18px", // Responsive font size
              }}
            >
              {currentUser?.firstName?.[0]?.toUpperCase() || "U"}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontWeight: "600",
                fontSize: isMobile ? "14px" : "15px", // Responsive font size
                lineHeight: 1.2, // Adjusted line height
                color: "#050505",
              }}
            >
              {currentUser?.firstName || "User"}
            </span>
            <span
              style={{
                fontSize: isMobile ? "12px" : "13px", // Responsive font size
                color: "#606770", // Dark grey for "Account"
                lineHeight: 1.2, // Adjusted line height
                marginTop: "2px",
              }}
            >
              Account
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
