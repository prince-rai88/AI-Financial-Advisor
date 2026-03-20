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
  isTokenValid,
} from "./utils/auth";

function App() {
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
