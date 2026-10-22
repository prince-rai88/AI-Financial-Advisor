import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import ToastContainer from "./components/ToastContainer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Insights from "./pages/Insights";
import Budget from "./pages/Budget";

const AppleLanding = lazy(() => import("./pages/AppleLanding"));
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

  const handleLoginSuccess = ({ access, refresh }) => {
    setGuestMode(false);
    setIsGuest(false);
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
    setToken(access);
  };

  const handleGuestLogin = () => {
    clearAuthStorage();
    setToken(null);
    setGuestMode(true);
    setIsGuest(true);
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
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#00e599] animate-spin" />
                  </div>
                }
              >
                <AppleLanding
                  onGuestLogin={handleGuestLogin}
                  isAuth={isAuth}
                />
              </Suspense>
            }
          />
          <Route
            path="/overview"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#00e599] animate-spin" />
                  </div>
                }
              >
                <AppleLanding
                  onGuestLogin={handleGuestLogin}
                  isAuth={isAuth}
                />
              </Suspense>
            }
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
