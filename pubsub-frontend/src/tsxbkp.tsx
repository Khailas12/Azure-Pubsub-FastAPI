import { useEffect, useState, useRef } from "react";
import { WebPubSubClient } from "@azure/web-pubsub-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [client, setClient] = useState(null);
  const clientRef = useRef(null); // Create a ref to store the client
  const isListenerRegistered = useRef(false); // Track if the listener is already registered

  useEffect(() => {
    const fetchWebSocketUrl = async () => {
      try {
        const VITE_WEBPUBSUB_URL = "http://127.0.0.1:8000/negotiate";
        const response = await fetch(VITE_WEBPUBSUB_URL);
        const { url } = await response.json();

        // Initialize Web PubSub client
        const client = new WebPubSubClient(url);
        setClient(client);
        clientRef.current = client; // Store the client in the ref

        // Start the connection
        await client.start();
        console.log("WebSocket connection established");

        // Register the message handler only once
        if (!isListenerRegistered.current) {
          client.on("server-message", (e) => {
            console.log("Message received:", e);

            try {
              // Handle cases where contentType is undefined
              const data = JSON.parse(e.message.data);
              console.log("Parsed message data:", data);
              toast.info(data.message); // Show toast notification
            } catch (error) {
              console.error("Failed to parse message:", error);
            }
          });

          isListenerRegistered.current = true; // Mark the listener as registered
        }
      } catch (error) {
        console.error("Failed to connect to Web PubSub:", error);
      }
    };

    fetchWebSocketUrl();

    // Cleanup on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.stop(); // Stop the WebSocket connection
        isListenerRegistered.current = false; // Reset the listener flag
      }
    };
  }, []);

  // Function to trigger the API
  const triggerApi = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/trigger-api", {
        method: "POST",
      });
      const result = await response.json();
      console.log("API Triggered:", result);
    } catch (error) {
      console.error("Failed to trigger API:", error);
    }
  };

  return (
    <div>
      <h1>Azure Web PubSub with React</h1>
      <p>Notifications will appear as toast messages.</p>
      <button onClick={triggerApi} style={styles.button}>
        Trigger API
      </button>
      <button
        onClick={() => toast.info("Test toast notification")}
        style={styles.button}
      >
        Test Toast
      </button>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

// Basic button styling
const styles = {
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px", // Add margin between buttons
  },
};

export default App;