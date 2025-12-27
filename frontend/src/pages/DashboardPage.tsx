import { useNavigate, Link } from 'react-router-dom';
import { LogOut, CheckCircle, User as UserIcon, LogIn, Coins, ShoppingBag, Zap, Trophy, Flame, Menu, X, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [welcomeName, setWelcomeName] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [savingUsername, setSavingUsername] = useState(false);
    const [activeTab, setActiveTab] = useState('juegos');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);

    useEffect(() => {
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
        }

        async function loadUser() {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const profile = await apiRequest('/auth/profile');
                setUser(profile);
                setNewUsername(profile.username || '');
                if (!profile.profileCompleted) {
                    navigate('/complete-profile');
                }
            } catch (e) {
                console.error(e);
                localStorage.removeItem('token');
            }
        }
        loadUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/');
    };

    const handleInlineLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoggingIn(true);
        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });
            localStorage.setItem('token', data.access_token);
            setIsLoginOpen(false);
            const profile = await apiRequest('/auth/profile');
            setUser(profile);
        } catch (error: any) {
            alert(error.message || 'Error en el inicio de sesión');
        } finally {
            setLoggingIn(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:3000/auth/google';
    };

    const handleSaveUsername = async () => {
        setSavingUsername(true);
        try {
            await apiRequest('/auth/change-username', {
                method: 'POST',
                body: JSON.stringify({ username: newUsername })
            });
            setShowWelcome(false);
            const profile = await apiRequest('/auth/profile');
            setUser(profile);
        } catch (error: any) {
            alert(error.message || 'Error al actualizar el nombre de usuario');
        } finally {
            setSavingUsername(false);
        }
    };

    const handleSkipUsername = () => {
        setShowWelcome(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleLogin = () => {
        setIsLoginOpen(!isLoginOpen);
    };

    const selectTab = (tab: string) => {
        setActiveTab(tab);
        setIsMenuOpen(false);
    };

    // Games data
    const games = [
        {
            id: 1,
            title: 'Star Odyssey',
            category: 'Acción / Espacio',
            image: '/space_shooter_cover_1766842874682.png',
            trending: true
        },
        {
            id: 2,
            title: 'Mystic Quest',
            category: 'Fantasía / RPG',
            image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000'
        },
        {
            id: 3,
            title: 'Cyber Drift',
            category: 'Carreras / Neon',
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000',
            new: true
        },
        {
            id: 4,
            title: 'Ancient Shadows',
            category: 'Aventura / Puzle',
            image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000'
        }
    ];

    // Market data
    const marketItems = [
        {
            id: 1,
            name: 'Skin Legendaria: Fuego',
            price: 500,
            image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=500'
        },
        {
            id: 2,
            name: 'Pack de 10 Boosters',
            price: 200,
            image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=500'
        },
        {
            id: 3,
            name: 'Espada de Cristal',
            price: 1200,
            image: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24ef88?auto=format&fit=crop&q=80&w=500'
        },
        {
            id: 4,
            name: 'Mascota: Dragoncito',
            price: 3000,
            image: 'https://images.unsplash.com/photo-1559124391-7d5c9ee76d11?auto=format&fit=crop&q=80&w=500'
        }
    ];

    if (showWelcome) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="glass-card w-full max-w-md animate-in text-center">
                    <div className="flex justify-center mb-6">
                        <CheckCircle className="w-20 h-20 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                                ¡Bienvenido, {welcomeName}!
                            </h2>
                            <p className="text-slate-400 mt-2">
                                Tu cuenta ha sido verificada en el sistema.
                            </p>
                        </div>
                        <div className="text-left space-y-2">
                            <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-1">
                                Alias de Operador
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Ingresa tu alias..."
                            />
                        </div>
                        <div className="pt-4 space-y-3">
                            <button
                                onClick={handleSaveUsername}
                                disabled={savingUsername}
                                className="btn-primary w-full"
                            >
                                {savingUsername ? 'Asignando...' : 'INICIAR SESIÓN'}
                            </button>
                            <button
                                onClick={handleSkipUsername}
                                className="w-full text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                            >
                                Omitir por ahora
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const NavigationLinks = () => (
        <>
            <button
                onClick={() => selectTab('juegos')}
                className={`nav-item ${activeTab === 'juegos' ? 'active' : ''}`}
            >
                <Zap className="w-4 h-4 mr-2 text-indigo-400" />
                JUEGOS
            </button>
            <button
                onClick={() => selectTab('mercado')}
                className={`nav-item ${activeTab === 'mercado' ? 'active' : ''}`}
            >
                <ShoppingBag className="w-4 h-4 mr-2 text-indigo-400" />
                MERCADO
            </button>
            <button
                onClick={() => selectTab('ranking')}
                className={`nav-item ${activeTab === 'ranking' ? 'active' : ''}`}
            >
                <Trophy className="w-4 h-4 mr-2 text-indigo-400" />
                RANKING
            </button>
            <button
                onClick={() => selectTab('suscripciones')}
                className={`nav-item ${activeTab === 'suscripciones' ? 'active' : ''}`}
            >
                <Flame className="w-4 h-4 mr-2 text-indigo-400" />
                SUSCRIPCIONES
            </button>
        </>
    );

    return (
        <div className="w-full min-h-screen flex flex-col items-stretch">
            {/* Immersive Hero Section */}
            <header className="banner flex flex-col items-center justify-center">
                <div className="animate-in flex flex-col items-center">
                    <h1 className="leading-none">MiniJuegos</h1>
                </div>
            </header>

            {/* HUD Navigation Bar */}
            <nav className="nav-bar">
                <div className="nav-container">
                    <div className="flex items-center">
                        <button className="menu-toggle" onClick={toggleMenu}>
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <div className="nav-links">
                            <NavigationLinks />
                        </div>
                    </div>

                    <div className="flex items-center h-full relative">
                        {user ? (
                            <div className="user-nav-block">
                                <div className="credits-pill">
                                    <Coins className="w-4 h-4" />
                                    <span>{user.wallet?.credits || 0}</span>
                                </div>

                                <div className="nav-user-info">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 overflow-hidden">
                                        <UserIcon className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div className="hidden sm:flex flex-col leading-tight">
                                        <span className="text-sm font-bold text-white truncate max-w-[100px]">
                                            {user.username || user.email.split('@')[0]}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="btn-icon-nav"
                                    title="Desconectar"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={toggleLogin}
                                    className={`btn-primary ${isLoginOpen ? 'ring-2 ring-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : ''}`}
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    ACCESO / REGISTRO
                                </button>

                                {isLoginOpen && (
                                    <div className="login-dropdown">
                                        <h3 className="text-white font-black uppercase tracking-tighter mb-6 text-xl">
                                            Acceso <span className="text-indigo-500">Rápido</span>
                                        </h3>
                                        <form onSubmit={handleInlineLogin} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">Email</label>
                                                <input
                                                    type="email"
                                                    className="input-field"
                                                    placeholder="correo@ejemplo.com"
                                                    value={loginEmail}
                                                    onChange={(e) => setLoginEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">Contraseña</label>
                                                <input
                                                    type="password"
                                                    className="input-field"
                                                    placeholder="••••••••"
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button
                                                disabled={loggingIn}
                                                type="submit"
                                                className="btn-primary w-full h-12 text-sm mt-2"
                                            >
                                                {loggingIn ? 'ENTRANDO...' : 'INICIAR SESIÓN'}
                                            </button>
                                        </form>

                                        <div className="dropdown-divider"></div>

                                        <button
                                            onClick={handleGoogleLogin}
                                            className="btn-google"
                                        >
                                            <img src="https://www.google.com/favicon.ico" alt="Google" />
                                            <span>ACCEDER CON GOOGLE</span>
                                        </button>

                                        <div className="mt-6 text-center">
                                            <p className="text-slate-500 text-[10px] mb-2 font-bold uppercase tracking-widest">¿No tienes cuenta?</p>
                                            <Link
                                                to="/register"
                                                className="text-indigo-400 hover:text-indigo-300 font-black text-xs uppercase tracking-tighter"
                                                onClick={() => setIsLoginOpen(false)}
                                            >
                                                CREAR NUEVA CUENTA
                                                <ArrowRight className="w-3 h-3 inline ml-1" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {/* Mobile Dropdown */}
                {isMenuOpen && (
                    <div className="mobile-menu">
                        <NavigationLinks />
                    </div>
                )}
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 w-full bg-slate-900/10 pb-32">
                {activeTab === 'juegos' && (
                    <div className="max-w-[1400px] mx-auto px-6 mt-12">
                        <div className="game-grid animate-in">
                            {games.map((game) => (
                                <div key={game.id} className="game-card group">
                                    <img src={game.image} alt={game.title} />
                                    {game.trending && (
                                        <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-orange-500/90 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl z-10 backdrop-blur-md">
                                            <Flame className="w-3 h-3" /> Tendencia
                                        </div>
                                    )}
                                    {game.new && (
                                        <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-indigo-500/90 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl z-10 backdrop-blur-md">
                                            <Zap className="w-3 h-3" /> Nuevo
                                        </div>
                                    )}
                                    <div className="game-overlay">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">{game.category}</span>
                                        <h3>{game.title}</h3>
                                        <p className="text-slate-400 text-sm line-clamp-1 opacity-60 group-hover:opacity-100 transition-opacity">Únete a miles de jugadores en esta aventura espacial sin precedentes.</p>
                                        <div className="flex gap-4 mt-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            <button className="btn-primary text-xs py-3 px-8 flex-1">JUGAR AHORA</button>
                                            <button className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                                                <Trophy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'mercado' && (
                    <div className="max-w-[1400px] mx-auto px-6 mt-12">
                        <div className="market-grid animate-in">
                            {marketItems.map((item) => (
                                <div key={item.id} className="item-card group">
                                    <div className="item-img-container p-4">
                                        <img src={item.image} alt={item.name} className="rounded-2xl" />
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-white font-bold mb-1 truncate w-[160px]">{item.name}</h3>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">OBJETO ÉPICO</span>
                                            </div>
                                            <div className="price-tag">
                                                <Coins className="w-3 h-3" />
                                                <span>{item.price}</span>
                                            </div>
                                        </div>
                                        <button className="btn-buy flex items-center justify-center gap-2">
                                            <Zap className="w-4 h-4" />
                                            ADQUIRIR
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'ranking' && (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in">
                        <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-8">
                            <Trophy className="w-12 h-12 text-indigo-400" />
                        </div>
                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Salón de la Fama</h2>
                        <p className="text-slate-500 max-w-md mx-auto">El sistema está procesando las puntuaciones globales. El ranking de temporada se activará en 24 horas.</p>
                    </div>
                )}

                {activeTab === 'suscripciones' && (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in">
                        <div className="w-24 h-24 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-8">
                            <Flame className="w-12 h-12 text-orange-400" />
                        </div>
                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Suscripciones</h2>
                        <p className="text-slate-500 max-w-md mx-auto">Próximamente podrás suscribirte para obtener beneficios exclusivos y créditos mensuales.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
