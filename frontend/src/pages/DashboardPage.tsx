import { useNavigate } from 'react-router-dom';
import { Gamepad2, LogOut, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [welcomeName, setWelcomeName] = useState('');

    useEffect(() => {
        // Check for welcome parameter from Google OAuth
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        const welcome = searchParams.get('welcome');
        const name = searchParams.get('name');

        if (token) {
            localStorage.setItem('token', token);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (welcome === 'true' && name) {
            setShowWelcome(true);
            setWelcomeName(decodeURIComponent(name));

            // Auto-hide welcome message after 3 seconds
            setTimeout(() => {
                setShowWelcome(false);
            }, 3000);
        }

        async function loadUser() {
            try {
                const profile = await apiRequest('/auth/profile');
                setUser(profile);
                // Check membership again just in case
                if (!profile.membership) {
                    navigate('/complete-profile');
                }
            } catch (e) {
                console.error(e);
                localStorage.removeItem('token');
                navigate('/');
            }
        }
        loadUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    if (!user) return <div className="text-center text-white p-10">Cargando...</div>;

    // Show welcome message for new Google OAuth users
    if (showWelcome) {
        return (
            <div className="glass-card p-8 w-full max-w-md animate-in text-center">
                <div className="flex justify-center mb-6">
                    <CheckCircle className="w-20 h-20 text-green-400 animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white">
                        ¡Bienvenido, {welcomeName}! 🎉
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Tu cuenta ha sido creada exitosamente
                    </p>
                </div>
                <div className="pt-6">
                    <p className="text-sm text-slate-500 mb-4">
                        Accediendo al dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-8 w-full max-w-md animate-in text-center">
            <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
            <h1 className="text-3xl font-bold mb-2">Bienvenido</h1>
            <p className="text-slate-400 mb-8">{user.email}</p>
            {user.username && <p className="text-indigo-400 mb-8">@{user.username}</p>}

            <div className="space-y-4">
                <button className="btn-primary w-full">
                    <Gamepad2 className="w-5 h-5" />
                    Ir a los Juegos
                </button>
                <button onClick={handleLogout} className="w-full text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
