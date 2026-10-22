import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import ToastContainer from "./components/ToastContainer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Insights from "./pages/Insights";
import Budget from "./pages/Budget";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  clearAuthStorage,
  isGuestMode,
  isTokenValid,
  setGuestMode,
} from "./utils/auth";

function App() {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!isTokenValid(stored)) {
      if (!isGuestMode()) {
        clearAuthStorage();
      }
      return null;
    }
    return stored;
  });

  const [isGuest, setIsGuest] = useState(() => isGuestMode());

  useEffect(() => {
    const syncToken = () => {
      const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
      const guest = isGuestMode();
      setIsGuest(guest);

      if (!isTokenValid(stored)) {
        if (!guest) {
          clearAuthStorage();
        }
        setToken(null);
        return;
      }
      setToken(stored);
    };
    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  const isAuth = useMemo(() => isTokenValid(token) || isGuest, [token, isGuest]);

  const handleLoginSuccess = ({ access, refresh, username }) => {
    setGuestMode(false);
    setIsGuest(false);
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
    if (username) {
      localStorage.setItem("username", username);
    }
    setToken(access);
  };

  const handleGuestLogin = () => {
    clearAuthStorage();
    setToken(null);
    setGuestMode(true);
    setIsGuest(true);
    localStorage.setItem("username", "Guest");
  };

  const handleLogout = () => {
    clearAuthStorage();
    setToken(null);
    setGuestMode(false);
    setIsGuest(false);
  };

  return (
    <div className="app-shell">
      <ToastContainer />
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
                <Login
                  onLoginSuccess={handleLoginSuccess}
                  onGuestLogin={handleGuestLogin}
                />
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
                <Dashboard onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Transactions onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <PrivateRoute>
                <Insights onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <PrivateRoute>
                <Budget onLogout={handleLogout} />
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
