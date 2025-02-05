import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../../api.js'
import { REFRESH_TOKEN, ACCESS_TOKEN } from '../constants/index.jsx';
import { Loader } from 'lucide-react';

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        authenticateUser().catch(() => setIsAuthorized(false));
    }, []);

    /**
     * Attempts to refresh the access token using the stored refresh token.
     * If successful, updates the access token and authorizes the user.
     * If it fails, it sets authorization to false.
     */
    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshToken) {
            setIsAuthorized(false);
            return;
        }

        try {
            const res = await api.post("/api/auth/token/refresh/", { refresh: refreshToken });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (err) {
            console.error("Error refreshing token:", err);
            setIsAuthorized(false);
        }
    };

    /**
     * Checks if the access token exists and is valid.
     * If the token is expired, it tries to refresh it.
     */
    const authenticateUser = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;

            if (tokenExpiration < now) {
                await refreshToken();
            } else {
                setIsAuthorized(true);
            }
        } catch (err) {
            console.error("Invalid token:", err);
            setIsAuthorized(false);
        }
    };

    // Show a loading icon while checking authentication status
    if (isAuthorized === null) {
        return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin w-8 h-8" /></div>;
    }

    // Redirect to login page if not authorized, otherwise render protected content
    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
