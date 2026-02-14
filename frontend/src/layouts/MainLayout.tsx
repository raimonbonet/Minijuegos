
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { apiRequest } from '../lib/api';
import AuthModal from '../components/AuthModal';

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<any>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Initial Auth Check & Token Handling
    useEffect(() => {
        const tokenToken = new URLSearchParams(window.location.search).get('token');

        if (tokenToken) {
            localStorage.setItem('token', tokenToken);
            // Clean URL but keep path
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        async function loadUser() {
            const currentToken = localStorage.getItem('token');
            if (!currentToken) {
                return;
            }
            try {
                const profile = await apiRequest('/auth/profile');
                setUser(profile);
            } catch (e) {
                console.error("Failed to load user in layout", e);
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                // Loading finished
            }
        }
        loadUser();
    }, [navigate, location.search]); // Re-run if URL token changes

    // Update user state when requested (e.g. after game)
    const refreshUser = async () => {
        try {
            const profile = await apiRequest('/auth/profile');
            setUser(profile);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-deep)]">
            <Navbar
                user={user}
                onLoginClick={() => setIsAuthModalOpen(true)}
                onLogoutClick={() => {
                    localStorage.removeItem('token');
                    setUser(null);
                    navigate('/');
                }}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={(newUser) => {
                    setUser(newUser);
                    setIsAuthModalOpen(false);
                }}
            />

            {/* Main Content Area */}
            {/* Add padding top to account for fixed navbar (h-16 = 4rem = 64px) */}
            <div className="pt-16">
                {/* Pass user and refreshUser to children via Outlet context */}
                <Outlet context={{ user, refreshUser, setUser }} />
            </div>
        </div>
    );
}
