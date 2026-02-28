import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  clearAuthStorage,
  isTokenValid,
} from "./utils/auth";

function App() {
  const location = useLocation();
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!isTokenValid(stored)) {
      clearAuthStorage();
      return null;
    }
    return stored;
  });

  useEffect(() => {
    const syncToken = () => {
      const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!isTokenValid(stored)) {
        clearAuthStorage();
        setToken(null);
        return;
      }
      setToken(stored);
    };
    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  const isAuth = useMemo(() => isTokenValid(token), [token]);

  const handleLoginSuccess = ({ access, refresh }) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
    setToken(access);
  };

  const handleLogout = () => {
    clearAuthStorage();
    setToken(null);
  };

  const publicPaths = ["/login", "/register"];
  const showNavbar = isAuth && !publicPaths.includes(location.pathname);

  return (
    <div className="app-shell">
      {showNavbar ? <Navbar onLogout={handleLogout} /> : null}
      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={<Navigate replace to={isAuth ? "/dashboard" : "/login"} />}
          />
          <Route
            path="/login"
            element={
              isAuth ? (
                <Navigate replace to="/dashboard" />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/register"
            element={isAuth ? <Navigate replace to="/dashboard" /> : <Register />}
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="*"
            element={<Navigate replace to={isAuth ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
