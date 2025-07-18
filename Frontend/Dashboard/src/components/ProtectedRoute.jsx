
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, permission }) => {
    const { isAuthenticated, userPermissions } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (permission && !userPermissions.includes(permission)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;