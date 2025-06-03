import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/v1/users");
        const filteredUsers = currentUser?.id
          ? res.data.data.result.filter((user) => user.id !== currentUser.id)
          : res.data.data.result;

        setUsers(filteredUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, [currentUser?.id]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        maxWidth: "400px",
        margin: "0 auto",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* Optional Header */}
      {/* <div style={{ backgroundColor: "#25D366", color: "white", padding: "1rem", fontSize: "1.25rem", fontWeight: "bold" }}>
        {currentUser?.firstName}'s Chats
      </div> */}

      {/* User List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                borderBottom: "1px solid #e0e0e0",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/chat/${user.id}`)}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "600",
                }}
              >
                {user.firstName.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: "500" }}>
                  {user.firstName} {user.lastName}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#757575" }}>
                  Tap to chat
                </div>
              </div>
            </div>
          ))
        ) : (
          <p
            style={{
              textAlign: "center",
              color: "#757575",
              marginTop: "1rem",
            }}
          >
            No users available
          </p>
        )}
      </div>
    </div>
  );
};

export default Users;
