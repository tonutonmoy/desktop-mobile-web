import React, { useEffect, useState } from "react";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/notifications/${currentUser.id}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div
      style={{
        maxWidth: "28rem",
        margin: "1.5rem auto 0 auto",
        padding: "1rem",
        backgroundColor: "#ffffff",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.75rem" }}>
        Notifications
      </h2>

      {notifications.length > 0 ? (
        notifications.map((n) => (
          <div
            key={n.id}
            style={{
              borderBottom: "1px solid #e5e7eb",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
            }}
          >
            <p>
              <strong>From:</strong> {n.senderId}
            </p>
            <p>
              <strong>Message:</strong> {n.message}
            </p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      ) : (
        <p style={{ color: "#6b7280" }}>No notifications yet</p>
      )}
    </div>
  );
};

export default Notifications;
