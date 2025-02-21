import usePubSub from "./hooks/usePubSub";
import NotificationList from "./components/NotificationList";
import TriggerButton from "./components/TriggerButton";

function App() {
  const negotiateUrl = "http://127.0.0.1:8000/negotiate";
  const triggerApiUrl = "http://127.0.0.1:8000/trigger-api";

  const { messages, error } = usePubSub(negotiateUrl);

  const triggerApi = async () => {
    try {
      const response = await fetch(triggerApiUrl, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to trigger API");
      console.log("API triggered successfully");
    } catch (err) {
      console.error("❌ Error triggering API:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6">
      <h1 className="text-2xl font-bold text-center">Azure Web PubSub with React</h1>
      <p className="text-center mt-2">Notifications will appear as toast messages.</p>
      <TriggerButton onClick={triggerApi} />
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      <NotificationList messages={messages} />
    </div>
  );
}

export default App;