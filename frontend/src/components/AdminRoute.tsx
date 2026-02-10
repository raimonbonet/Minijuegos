
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';

const AdminRoute = ({ children }: { children: React.JSX.Element }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const profile = await apiRequest('/auth/profile');
                setUser(profile);
            } catch (e) {
                console.error("AdminRoute auth check failed", e);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) {
        // Simple loading state
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Verificando acceso...</div>;
    }

    if (!user || !user.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
