import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-indigo-600 p-5 flex justify-between items-center shadow-lg">
      <h1 className="text-white font-bold text-xl">AI Finance Advisor</h1>
      <button onClick={handleLogout} className="btn">
        Logout
      </button>
    </nav>
  );
}