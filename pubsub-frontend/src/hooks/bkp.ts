import { useEffect, useState, useRef } from "react";
import { WebPubSubClient } from "@azure/web-pubsub-client";

const usePubSub = (negotiateUrl: string) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<WebPubSubClient | null>(null);
  const isListenerRegistered = useRef(false);

  useEffect(() => {
    const fetchWebSocketUrl = async () => {
      try {
        const response = await fetch(negotiateUrl);
        const { url } = await response.json();

        // Initialize Web PubSub client
        const client = new WebPubSubClient(url);
        clientRef.current = client;

        // Start the connection
        await client.start();
        console.log("✅ WebSocket connection established");

        // Register the message handler only once
        if (!isListenerRegistered.current) {
          client.on("server-message", (e) => {
            console.log("📩 Received message:", e);
            try {
              const data = JSON.parse(e.message.data);
              console.log("Parsed message data:", data);
              setMessages((prev) => [...prev, data.message]);
            } catch (error) {
              console.error("Failed to parse message:", error);
            }
          });

          isListenerRegistered.current = true;
        }
      } catch (error) {
        console.error("❌ Failed to connect to Web PubSub:", error);
        setError("Failed to connect to WebSocket");
      }
    };

    fetchWebSocketUrl();

    // Cleanup on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.stop();
        isListenerRegistered.current = false;
      }
    };
  }, [negotiateUrl]);

  return { messages, error };
};

export default usePubSub;