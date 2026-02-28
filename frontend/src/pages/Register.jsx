import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [data, setData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post("register/", data);
      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      alert("Registration failed. Try another username.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleRegister}
        className="bg-white p-10 rounded-3xl w-96 shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-8 text-indigo-600 text-center">
          Register
        </h2>
        <input
          className="input mb-4"
          placeholder="Username"
          value={data.username}
          onChange={(e) => setData({ ...data, username: e.target.value })}
        />
        <input
          className="input mb-6"
          type="password"
          placeholder="Password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />
        <button className="btn w-full mb-4">Register</button>
        <p className="text-gray-500 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;