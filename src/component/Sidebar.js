import React from "react";
import { Link } from "react-router-dom";
import Users from "./Users";
import { FiMoreVertical, FiSearch } from "react-icons/fi";
import { BsFilter } from "react-icons/bs";

const Sidebar = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div
      style={{
        width: "320px",
        backgroundColor: "#f0f2f5",
        height: "100%",
        borderRight: "1px solid #d1d5db",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 🔼 Top: Header */}
      <div
        style={{
          backgroundColor: "#f0f2f5",
          padding: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #d1d5db",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1f2937" }}>
            WhatsApp
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#4b5563" }}>
          <button
            style={{
              padding: "4px",
              borderRadius: "9999px",
              cursor: "pointer",
              backgroundColor: "transparent",
              border: "none",
            }}
            title="Filter chats"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <BsFilter size={20} />
          </button>
          <button
            style={{
              padding: "4px",
              borderRadius: "9999px",
              cursor: "pointer",
              backgroundColor: "transparent",
              border: "none",
            }}
            title="More options"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <FiMoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* 🔼 Search Bar */}
      <div style={{ padding: "8px", backgroundColor: "#ffffff" }}>
        <div
          style={{
            backgroundColor: "#f0f2f5",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            padding: "4px 12px",
          }}
        >
          <FiSearch size={18} />
          <input
            type="text"
            placeholder="Search or start new chat"
            style={{
              backgroundColor: "transparent",
              width: "100%",
              padding: "8px 0",
              outline: "none",
              fontSize: "0.875rem",
              color: "#1f2937",
              marginLeft: "8px",
              border: "none",
            }}
          />
        </div>
      </div>

      {/* 🔼 Chat/User List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          backgroundColor: "#ffffff",
        }}
      >
        <Users />
      </div>

      {/* 🔽 Bottom: Account Section */}
      <div
        style={{
          backgroundColor: "#f0f2f5",
          padding: "12px",
          borderTop: "1px solid #d1d5db",
        }}
      >
        <Link
          to="/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px",
            borderRadius: "8px",
            textDecoration: "none",
            color: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          {currentUser?.profileImage ? (
            <img
              src={currentUser.profileImage}
              alt="Profile"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #d1d5db",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
            />
          ) : (
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#d1d5db",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4b5563",
                fontWeight: "bold",
                fontSize: "1.125rem",
                border: "1px solid #d1d5db",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
            >
              {currentUser?.firstName?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: "500", color: "#1f2937" }}>
              {currentUser?.firstName || "User"}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>My Account</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
