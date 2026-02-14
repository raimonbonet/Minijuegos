import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

// --- Shared Components (Would be in /components in real app) ---

const GameCard = ({ title, category, image, active, isVip, onClick }: { title: string, category: string, image?: string, active?: boolean, isVip?: boolean, onClick?: () => void }) => (
    <div onClick={onClick} className={`relative group overflow-hidden rounded-xl aspect-[3/4] cursor-pointer transition-all duration-300 ${active ? 'ring-4 ring-[var(--blaze-neon)] shadow-[0_4px_20px_rgba(255,159,28,0.3)] z-10 scale-[1.02]' : 'opacity-90 hover:opacity-100 hover:scale-105 hover:shadow-xl'}`}>
        {/* Background Image Placeholder */}
        <div className="absolute inset-0 bg-[var(--bg-panel)]">
            {image && <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--text-dark)] via-transparent to-transparent opacity-80" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 w-full p-5">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-black text-white bg-[var(--blaze-neon)] px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-sm">{category}</span>
                {isVip && <span className="text-[9px] font-black text-[var(--text-main)] bg-[var(--zoin-gold)] px-1.5 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">VIP</span>}
            </div>
            <h3 className="text-xl font-black text-white leading-none uppercase italic drop-shadow-md">{title}</h3>

            {active && (
                <div className="mt-2 w-full h-0.5 bg-[var(--blaze-neon)] shadow-[0_0_10px_var(--blaze-neon)]" />
            )}
        </div>
    </div>
);

const MarketCard = ({ name, price, image }: { name: string, price: number, image?: string }) => (
    <div className="glass-panel p-3 rounded-2xl flex flex-col group cursor-pointer hover:bg-[var(--bg-panel)]/80 transition-all hover:-translate-y-1 hover:border-[var(--kai-green)]/50 hover:shadow-lg">
        <div className="aspect-square w-full rounded-xl bg-[var(--bg-deep)]/20 mb-3 overflow-hidden relative border border-white/10">
            {image && <img src={image} alt={name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-[var(--text-main)]/10 flex items-center gap-1 shadow-sm">
                <img src="/zoins_icon.jpg" alt="Z" className="w-3 h-3 rounded-full" />
                <span className="text-[var(--text-main)] font-black text-xs">{price}</span>
            </div>
        </div>
        <div>
            {/* Contrast fix: Text white on Blue panel */}
            <h4 className="text-sm font-bold text-white group-hover:text-[var(--zoin-gold)] transition-colors leading-tight mb-1">{name}</h4>
            <span className="text-[10px] text-[var(--kai-soft)] font-bold uppercase tracking-wider border border-[var(--kai-soft)]/30 px-1.5 py-0.5 rounded-md bg-[var(--kai-green)]/20">Exclusivo</span>
        </div>
    </div>
);

// --- Main Page ---

export default function DashboardPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[var(--bg-deep)] pb-32 transition-colors duration-500">
            {/* Tropical Background Decorations - Sand Theme */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                {/* Subtle water caustics hint or palm shadows could go here */}
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--zoin-gold)]/5 rounded-full blur-[100px] mix-blend-multiply animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[var(--bg-panel)]/10 rounded-full blur-[100px] mix-blend-multiply" />
            </div>

            {/* Main Content Container */}
            <main className="pt-8 px-4 max-w-lg mx-auto md:max-w-5xl lg:max-w-6xl space-y-16 relative z-10">

                {/* Hero / Welcome */}
                <header className="text-center space-y-4 py-8">
                    <h1 className="text-4xl md:text-6xl font-black text-[var(--text-main)] uppercase italic tracking-tighter drop-shadow-sm">
                        Compite. <span className="text-[var(--blaze-neon)] drop-shadow-[0_2px_10px_rgba(255,159,28,0.4)]">Gana.</span>
                    </h1>
                    <p className="text-[var(--text-main)]/80 text-sm md:text-lg max-w-md mx-auto font-medium">
                        La plataforma de eSports casual definitiva.
                    </p>
                </header>

                {/* BLAZE ZONE: Games */}
                <section className="space-y-6 relative">
                    {/* Section Header */}
                    <div className="flex items-end justify-between border-b border-[var(--text-main)]/10 pb-4">
                        <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6 text-[var(--blaze-neon)]" />
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight italic text-[var(--text-main)]">Arena de Juegos</h2>
                                <p className="text-xs text-[var(--blaze-neon)] font-bold">ZONA COMPETITIVA</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/admin')} className="text-xs text-[var(--text-muted)] font-bold hover:text-[var(--text-main)] cursor-pointer transition-colors">VER RANKING ABSOLUTO &rarr;</button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <GameCard
                            title="Neon Match"
                            category="Puzzle"
                            image="https://images.unsplash.com/photo-1596727147705-09a27c541a74?auto=format&fit=crop&q=80&w=500" // Tropical Fruit/Puzzle abstract
                            active={true}
                            isVip={true}
                            onClick={() => navigate('/game/neon-match')} // Link to game
                        />
                        <GameCard
                            title="Cyber Drift"
                            category="Racing"
                            image="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=500"
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
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[var(--kai-green)]/10 to-transparent -z-10 rounded-3xl blur-3xl opacity-50" />

                    <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                        {/* Kai Floating Illustration (User Provided) */}
                        <div className="relative w-32 md:w-48 shrink-0 hover-float">
                            <img src="/kai_v3.png" alt="Kai" className="w-full drop-shadow-[0_10px_30px_rgba(56,142,60,0.4)]" />
                        </div>

                        <div className="w-full">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--text-main)] flex items-center gap-2">
                                        Kai's Market <span className="text-xs bg-[var(--kai-green)] text-white px-2 py-0.5 rounded font-bold tracking-widest shadow-sm">OPEN</span>
                                    </h2>
                                    <p className="text-sm text-[var(--kai-green)] font-bold">Canjea tus victorias por premios reales.</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-3 py-1 bg-[var(--bg-deep)] rounded border-2 border-[var(--text-main)]/10 text-xs font-bold text-[var(--text-main)] hover:bg-white cursor-pointer shadow-sm transition-all">Filtrar por Precio</div>
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
