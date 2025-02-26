import { useEffect, useState, useRef } from "react";
import { WebPubSubClient } from "@azure/web-pubsub-client";
import axios from "./useAxios"; // Custom axios instance

const usePubSub = (negotiateUrl: string, userId: string) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<WebPubSubClient | null>(null);

  useEffect(() => {
    let isMounted = true; // To avoid setting state after unmount

    const initializeWebSocket = async () => {
      try {
        console.log("🔄 Fetching WebSocket URL...");
        const response = await axios.get(`${negotiateUrl}/${userId}`); // Pass user ID
        const { url } = response.data;

        if (!url) throw new Error("Invalid WebSocket URL received");

        // Initialize Web PubSub client
        const client = new WebPubSubClient(url);
        clientRef.current = client;
        console.log("🔍 Subscribing to messages for user:", userId);

        // Register event listeners
        client.on("connected", (e: any) => {
          console.log("✅ WebSocket connected, Connection ID:", e.connectionId);
          localStorage.setItem("connectionId", e.connectionId);

          // Register user connection with backend
          axios
            .post(`/user-connected/${userId}/${e.connectionId}`)
            .then(() => console.log("🔗 User connection registered successfully"))
            .catch((err) =>
              console.error("❌ Failed to register user connection:", err.response?.data || err.message)
            );
        });

        client.on("disconnected", () => {
          console.warn("⚠️ WebSocket disconnected. Attempting to reconnect...");
        });

        client.on("server-message", (e) => {
          console.log("📩 Received raw message:", e);
          try {
            const rawData = e?.message?.data;
            console.log("Raw data:", rawData);
        
            const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
            console.log("Parsed data:", data);
        
            if (data?.message && isMounted) {
              console.log("✅ Valid message received:", data.message);
        
              // Show message temporarily
              setMessages([data.message]);
        
              // Auto-clear message after 5 seconds
              setTimeout(() => {
                setMessages([]);
              }, 15000);
            } else {
              console.warn("Received message but no 'message' field found");
            }
          } catch (error) {
            console.error("❌ Failed to parse message:", error);
          }
        });
        


        // Start the connection
        console.log("🚀 Attempting to start WebSocket connection...");
        await client.start();
        console.log("✅ WebSocket connection established successfully");
        console.log("✅ WebSocket connection established");
      } catch (err) {
        console.error("❌ WebSocket initialization failed:", err.response?.data || err.message);
        setError("Failed to connect to WebSocket");
      }
    };

    initializeWebSocket();

    // ... existing code ...

    // Cleanup function
    return () => {
      isMounted = false;
      const client = clientRef.current;

      if (client) {
        console.log("🛑 Cleaning up WebSocket...");
        try {
          // First, try to stop the client
          const stopPromise = client.stop();

          // Check if stop() returned a promise
          if (stopPromise && typeof stopPromise.then === 'function') {
            stopPromise
              .then(() => {
                console.log("✅ WebSocket connection stopped");
                localStorage.removeItem("connectionId");

                // Unregister user connection from backend
                axios
                  .post(`/user-disconnected/${userId}`)
                  .then(() => console.log("🔗 User unregistered successfully"))
                  .catch((err) =>
                    console.error("❌ Failed to unregister user:", err.response?.data || err.message)
                  );
              })
              .catch((err) => {
                console.error("❌ Error stopping WebSocket:", err);
              });
          } else {
            // If stop() didn't return a promise, just clean up
            console.log("🛑 WebSocket client stopped (no promise returned)");
            localStorage.removeItem("connectionId");
            axios
              .post(`/user-disconnected/${userId}`)
              .then(() => console.log("🔗 User unregistered successfully"))
              .catch((err) =>
                console.error("❌ Failed to unregister user:", err.response?.data || err.message)
              );
          }
        } catch (err) {
          console.error("❌ Error during WebSocket cleanup:", err);
        }
      } else {
        console.log("🛑 No WebSocket client to clean up");
      }
    };

  }, [negotiateUrl, userId]);


  return { messages, error };
};

export default usePubSub;