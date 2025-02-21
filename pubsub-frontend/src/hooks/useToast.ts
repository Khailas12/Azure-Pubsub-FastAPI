import toast, { Toaster } from "react-hot-toast";

const useToast = () => {
  const showToast = (message: string) => {
    toast(message, {
      position: "top-center",
      duration: 5000,
      style: {
        background: "#333",
        color: "#fff",
      },
      icon: "🚀",
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
      iconTheme: {
        primary: '#000',
        secondary: '#fff',
      },
    });
  };

  return { showToast, Toaster };
};

export default useToast;