import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User, LogIn, LogOut, Zap } from 'lucide-react';
import { apiRequest } from '../lib/api';
import AuthModal from '../components/AuthModal';

// --- Shared Components (Would be in /components in real app) ---

const Navbar = ({ user, onLoginClick, onLogoutClick }: { user: any, onLoginClick: () => void, onLogoutClick: () => void }) => (
    <nav className="nav-glass fixed top-0 w-full z-50 h-16 px-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-[var(--blaze-neon)] via-[#fff] to-[var(--kai-green)] text-transparent bg-clip-text drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                Zooplay
            </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
            {user ? (
                <>
                    {/* Wallet */}
                    <div className="flex items-center gap-2 bg-[var(--bg-panel)] px-4 py-1.5 rounded-full border border-[var(--zoin-gold)]/30 shadow-[0_0_15px_rgba(255,215,0,0.15)] hover:border-[var(--zoin-gold)] transition-colors cursor-pointer">
                        <img src="/zoins_icon.jpg" alt="Zoins" className="w-5 h-5 rounded-full object-cover" />
                        <span className="font-black text-xl text-[var(--zoin-gold)] tracking-tight font-mono">
                            {Number(user.Zoins || user.wallet?.balance || 0).toFixed(2)}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-px bg-white/10 mx-1"></div>

                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <span className="hidden md:block text-sm font-bold text-white/90">
                            {user.name || user.username || user.full_name || user.email?.split('@')[0]}
                        </span>

                        {/* Profile Button (Non-functional for now, acting as visual) */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--bg-panel)] to-black border border-white/10 flex items-center justify-center shadow-lg">
                            <User className="w-4 h-4 text-white/80" />
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={onLogoutClick}
                            className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition-all"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </>
            ) : (
                <button
                    onClick={onLoginClick}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-white/10 to-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest rounded transition-all hover:bg-white/20 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-md"
                >
                    <LogIn className="w-3 h-3" />
                    <span className="hidden sm:block">Acceder</span>
                </button>
            )}
        </div>
    </nav>
);

const GameCard = ({ title, category, image, active, isVip, onClick }: { title: string, category: string, image?: string, active?: boolean, isVip?: boolean, onClick?: () => void }) => (
    <div onClick={onClick} className={`relative group overflow-hidden rounded-xl aspect-[3/4] cursor-pointer transition-all duration-300 ${active ? 'ring-2 ring-[var(--blaze-neon)] shadow-[0_0_30px_rgba(0,240,255,0.4)] z-10 scale-[1.02]' : 'opacity-80 hover:opacity-100 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]'}`}>
        {/* Background Image Placeholder */}
        <div className="absolute inset-0 bg-[#050505]">
            {image && <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 w-full p-5">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-black text-black bg-[var(--blaze-neon)] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{category}</span>
                {isVip && <span className="text-[9px] font-black text-black bg-[var(--zoin-gold)] px-1.5 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">VIP</span>}
            </div>
            <h3 className="text-xl font-black text-white leading-none uppercase italic drop-shadow-md">{title}</h3>

            {active && (
                <div className="mt-2 w-full h-0.5 bg-[var(--blaze-neon)] shadow-[0_0_10px_var(--blaze-neon)]" />
            )}
        </div>
    </div>
);

const MarketCard = ({ name, price, image }: { name: string, price: number, image?: string }) => (
    <div className="glass-panel p-3 rounded-2xl flex flex-col group cursor-pointer hover:bg-white/5 transition-all hover:-translate-y-1 hover:border-[var(--kai-green)]/50">
        <div className="aspect-square w-full rounded-xl bg-black/40 mb-3 overflow-hidden relative border border-white/5">
            {image && <img src={image} alt={name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />}
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                <img src="/zoins_icon.jpg" alt="Z" className="w-3 h-3 rounded-full" />
                <span className="text-[var(--zoin-gold)] font-black text-xs">{price}</span>
            </div>
        </div>
        <div>
            <h4 className="text-sm font-bold text-white group-hover:text-[var(--kai-green)] transition-colors leading-tight mb-1">{name}</h4>
            <span className="text-[10px] text-[var(--kai-green)] font-bold uppercase tracking-wider border border-[var(--kai-green)]/30 px-1.5 py-0.5 rounded-md bg-[var(--kai-green)]/10">Exclusivo</span>
        </div>
    </div>
);

// --- Main Page ---

export default function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Auth Simulation (Connecting to real backend)
    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get('token') || localStorage.getItem('token');
        if (token) {
            localStorage.setItem('token', token);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        async function loadUser() {
            const currentToken = localStorage.getItem('token');
            if (!currentToken) { return; }
            try {
                const profile = await apiRequest('/auth/profile');
                setUser(profile);
            } catch (e) {
                console.error(e);
                localStorage.removeItem('token');

            }
        }
        loadUser();
    }, [navigate]);

    return (
        <div className="min-h-screen pb-32">
            <Navbar
                user={user}
                onLoginClick={() => setIsAuthModalOpen(true)}
                onLogoutClick={() => { localStorage.removeItem('token'); setUser(null); }}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={(newUser) => {
                    setUser(newUser);
                    setIsAuthModalOpen(false);
                }}
            />

            {/* Main Content Container */}
            <main className="pt-24 px-4 max-w-lg mx-auto md:max-w-5xl lg:max-w-6xl space-y-16">

                {/* Hero / Welcome */}
                <header className="text-center space-y-4 py-8">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
                        Compite. <span className="text-[var(--zoin-gold)] drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">Gana.</span>
                    </h1>
                    <p className="text-white/50 text-sm md:text-lg max-w-md mx-auto font-medium">
                        La plataforma de eSports casual definitiva.
                    </p>
                </header>

                {/* BLAZE ZONE: Games */}
                <section className="space-y-6 relative">
                    {/* Section Header */}
                    <div className="flex items-end justify-between border-b border-[var(--blaze-neon)]/20 pb-4">
                        <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6 text-[var(--blaze-neon)]" />
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight italic text-white">Arena de Juegos</h2>
                                <p className="text-xs text-[var(--blaze-neon)] font-bold">ZONA COMPETITIVA</p>
                            </div>
                        </div>
                        <span className="text-xs text-white/50 font-bold hover:text-white cursor-pointer transition-colors">VER RANKING ABSOLUTO &rarr;</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <GameCard
                            title="Neon Match"
                            category="Puzzle"
                            image="/blaze_v5.png" // V5 (User Preference)
                            active={true}
                            isVip={true}
                            onClick={() => navigate('/game/neon-match')} // Link to game
                        />
                        <GameCard
                            title="Cyber Drift"
                            category="Racing"
                            image="/cyber_game_cover.png"
                        />
                        <GameCard
                            title="Pixel Raid"
                            category="Acción"
                            image="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=500"
                        />
                        <GameCard
                            title="Void Hunter"
                            category="Estrategia"
                            image="https://images.unsplash.com/photo-1535025183041-0991a977e25b?auto=format&fit=crop&q=80&w=500"
                        />
                    </div>
                </section>

                {/* KAI ZONE: Market/VIP */}
                <section className="relative pt-8">
                    {/* Background decoration for Kai Section */}
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[var(--kai-green)]/5 to-transparent -z-10 rounded-3xl blur-3xl opacity-50" />

                    <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                        {/* Kai Floating Illustration (User Provided) */}
                        <div className="relative w-32 md:w-48 shrink-0 hover-float">
                            <img src="/kai_v3.png" alt="Kai" className="w-full drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
                        </div>

                        <div className="w-full">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                                        Kai's Market <span className="text-xs bg-[var(--kai-green)] text-black px-2 py-0.5 rounded font-bold tracking-widest">OPEN</span>
                                    </h2>
                                    <p className="text-sm text-[var(--kai-green)]">Canjea tus victorias por premios reales.</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-xs font-bold text-white hover:bg-white/10 cursor-pointer">Filtrar por Precio</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                <MarketCard name="Bono de Tiempo x10" price={500} image="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=300&q=80" />
                                <MarketCard name="Avatar: Golden Tiger" price={1200} image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300&q=80" />
                                <MarketCard name="Entrada Torneo" price={250} image="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=300&q=80" />
                                <MarketCard name="Pack Misterioso" price={800} image="https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?auto=format&fit=crop&w=300&q=80" />
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
