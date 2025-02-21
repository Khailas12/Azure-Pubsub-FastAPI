import { useEffect } from "react";
import useToast from "../hooks/useToast";

interface NotificationListProps {
  messages: string[];
}

const NotificationList = ({ messages }: NotificationListProps) => {
  const { showToast, Toaster } = useToast();

  useEffect(() => {
    // Only show a toast for the latest message
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      showToast(latestMessage);
    }
  }, [messages, showToast]);

  return <Toaster />;
};

export default NotificationList;