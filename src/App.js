import React, { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import "./App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProfileUpdate from "./pages/UpdateProfile";
import MainLayout from "./layouts/MainLayout";
import Chat from "./pages/Chat";
import socket from "./socket";
import { Toaster, toast } from "sonner";

function AppWrapper() {
  const location = useLocation();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (currentUser?.id) {
      socket.emit("join", currentUser.id);

      socket.on("new_notification", (notification) => {
        const currentPath = location.pathname;
        const chatPath = `/chat/${notification.senderId}`;
        if (currentPath !== chatPath) {
          toast(`🔔 New message from ${notification?.sender?.firstName || "a user"}`);
        }
      });
    }

    return () => {
      socket.off("new_notification");
    };
  }, [location]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes inside MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/chat/:partnerId" element={<Chat />} />
          <Route path="/profile" element={<ProfileUpdate />} />
        </Route>
      </Routes>

      <Toaster richColors position="top-right" />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
