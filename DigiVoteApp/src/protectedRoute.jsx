// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { getStudentId, getIsAdmin, isTokenExpired, removeToken } from "./utils/auth";

function ProtectedRoute({ children, adminOnly }) {
    if (isTokenExpired()) {
        removeToken();
        return <Navigate to="/" replace />; // redirect to login if expired or missing
    }

    const studentId = getStudentId();
    const isAdmin = getIsAdmin();

    if (!studentId) {
        return <Navigate to="/" replace />;  // redirect to login
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />; // redirect to dashboard if not admin
    }

    return children;
}

export default ProtectedRoute;