import React from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token
    navigate("/login"); // Redirect to the login page
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <button
        onClick={handleLogout}
        className="mt-4 p-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;