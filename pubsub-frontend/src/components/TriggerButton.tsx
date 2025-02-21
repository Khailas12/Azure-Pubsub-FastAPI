import { useState } from "react";

interface TriggerButtonProps {
  onClick: () => Promise<void>;
}

const TriggerButton = ({ onClick }: TriggerButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
    } catch (err) {
      console.error("❌ Error triggering API:", err);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
      disabled={loading}
    >
      {loading ? "Sending..." : "🚀 Trigger API"}
    </button>
  );
};

export default TriggerButton;