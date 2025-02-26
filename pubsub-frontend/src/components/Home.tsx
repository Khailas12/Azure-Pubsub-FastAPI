import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import NotificationList from "./NotificationList";
import TriggerButton from "./TriggerButton";
import usePubSub from "../hooks/usePubSub";
import axios from "../hooks/useAxios";


interface HomeProps {
    setIsAuthenticated: (isAuthenticated: boolean) => void;
  }
  

const Home = ({ setIsAuthenticated }: HomeProps) => {
  const navigate = useNavigate(); // Now this will work
  const negotiateUrl = "http://127.0.0.1:8000/negotiate";

  // Get the user ID from localStorage or your authentication system
  const userId = localStorage.getItem("user_id") || "default_user_id";

  // Use the usePubSub hook to manage WebSocket connection and messages
  const { messages, error } = usePubSub(negotiateUrl, userId);

  const triggerApi = async () => {
    try {
      const connectionId = localStorage.getItem("connectionId");
      const userId = localStorage.getItem("user_id"); // Get the user ID from localStorage
      if (!connectionId || !userId) {
        throw new Error("Connection ID or User ID not found in localStorage");
      }
      console.log("Triggering API for connection:", connectionId, "and user:", userId); // Debugging
      const response = await axios.post("/trigger-api", { 
        connection_id: connectionId, 
        user_id: userId 
      });
      console.log('djdjd-==', response)
      if (response.status !== 200) throw new Error("Failed to trigger API");
      console.log("API triggered successfully");
    } catch (err) {
      console.error("❌ Error triggering API:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("user_id");
      localStorage.removeItem("token");
      setIsAuthenticated(false); // Update authentication state
      navigate("/login");
    }
  };


  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6">
      <h1 className="text-2xl font-bold text-center">Azure Web PubSub with React</h1>
      <p className="text-center mt-2">Notifications will appear below.</p>

      {/* Trigger Button */}
      <TriggerButton onClick={triggerApi} />

      {/* Error Message */}
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {/* Notification List */}
      <NotificationList messages={messages} />

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-4 p-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default Home;