import { Navigate, useLocation } from "react-router-dom";
import { ACCESS_TOKEN_KEY, clearAuthStorage, isGuestMode, isTokenValid } from "../utils/auth";

export default function PrivateRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const guest = isGuestMode();

  if (!guest && !isTokenValid(token)) {
    clearAuthStorage();
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return children;
}
