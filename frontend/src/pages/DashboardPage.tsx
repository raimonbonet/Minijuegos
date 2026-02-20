import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { Modal } from '../components/ui/Modal';

// --- Shared Components (Would be in /components in real app) ---



const MarketCard = ({ id, name, price, currency = 'ZOIN', image, onClick, status }: { id: string, name: string, price: number, currency?: 'ZOIN' | 'EUR', image?: string, onClick: (id: string, price: number, name: string, currency: 'ZOIN' | 'EUR') => void, status: 'available' | 'login_required' | 'insufficient_balance' }) => {
    const disabled = status !== 'available';
    const label = status === 'login_required' ? 'Login' : status === 'insufficient_balance' ? 'Sin Saldo' : 'Comprar';

    return (
        <div
            onClick={() => !disabled && onClick(id, price, name, currency)}
            className={`glass-panel p-3 rounded-2xl flex flex-col group transition-all border border-transparent
            ${disabled ? 'opacity-70 cursor-not-allowed grayscale-[0.5]' : 'cursor-pointer hover:bg-[var(--bg-panel)]/80 hover:-translate-y-1 hover:border-[var(--kai-green)]/50 hover:shadow-lg'}
        `}
        >
            <div className="aspect-square w-full rounded-xl bg-[var(--bg-deep)]/20 mb-3 overflow-hidden relative border border-white/10">
                {image && <img src={image} alt={name} className={`w-full h-full object-cover transition-all duration-500 ${!disabled && 'group-hover:scale-110'}`} />}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-[var(--text-main)]/10 flex items-center gap-1 shadow-sm">
                    {currency === 'ZOIN' ? (
                        <img src="/zoins_icon.jpg" alt="Z" className="w-3 h-3 rounded-full" />
                    ) : (
                        <span className="text-black font-black text-xs">€</span>
                    )}
                    <span className="text-[var(--text-main)] font-black text-xs">{price}</span>
                </div>
            </div>
            <div>
                <h4 className="text-sm font-bold text-white group-hover:text-[var(--zoin-gold)] transition-colors leading-tight mb-1">{name}</h4>
                <span className={`text-[10px] font-bold uppercase tracking-wider border px-1.5 py-0.5 rounded-md 
                ${disabled ? 'text-gray-400 border-gray-400/30 bg-gray-500/10' : 'text-[var(--kai-soft)] border-[var(--kai-soft)]/30 bg-[var(--kai-green)]/20'}
            `}>
                    {label}
                </span>
            </div>
        </div>
    );
};

// --- Main Page ---

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user, refreshUser } = useOutletContext<any>();
    const userBalance = user ? Number(user.wallet?.balance ?? user.Zoins ?? 0) : 0;

    const getMarketItemStatus = (price: number, currency: 'ZOIN' | 'EUR' = 'ZOIN'): 'available' | 'login_required' | 'insufficient_balance' => {
        if (!user) return 'login_required';
        if (currency === 'EUR') return 'available';
        if (userBalance < price) return 'insufficient_balance';
        return 'available';
    };

    // Modal States
    const [purchaseModal, setPurchaseModal] = useState<{ isOpen: boolean, itemId?: string, price?: number, name?: string, currency?: 'ZOIN' | 'EUR', payload?: any } | null>(null);
    const [usernameModal, setUsernameModal] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [feedbackModal, setFeedbackModal] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleBuyClick = (itemId: string, price: number, name: string, currency: 'ZOIN' | 'EUR' = 'ZOIN') => {
        if (!user) {
            navigate('/login');
            return;
        }
        setPurchaseModal({ isOpen: true, itemId, price, name, currency });
    };

    const confirmPurchase = async () => {
        if (!purchaseModal) return;

        // If it's username change, close purchase modal and open username input
        if (purchaseModal.itemId === 'change-username') {
            setPurchaseModal(null);
            setUsernameModal(true);
            return;
        }

        if (purchaseModal.currency === 'EUR') {
            await processZoinPurchase(purchaseModal.itemId!);
        } else {
            await processTransaction(purchaseModal.itemId!, purchaseModal.payload);
        }
    };

    const processZoinPurchase = async (packId: string) => {
        setLoading(true);
        if (purchaseModal) setPurchaseModal(null);

        try {
            await apiRequest('/market/purchase-zoins', {
                method: 'POST',
                body: JSON.stringify({ packId })
            });

            setFeedbackModal({ type: 'success', message: '¡Zoins comprados con éxito!' });
            await refreshUser(); // Update balance
        } catch (error: any) {
            console.error(error);
            setFeedbackModal({ type: 'error', message: error.message || 'Error al realizar la compra' });
        } finally {
            setLoading(false);
        }
    };

    const processTransaction = async (itemId: string, payload?: any) => {
        setLoading(true);
        if (purchaseModal) setPurchaseModal(null);
        if (usernameModal) setUsernameModal(false);

        try {
            await apiRequest('/market/buy', {
                method: 'POST',
                body: JSON.stringify({ itemId, payload })
            });

            setFeedbackModal({ type: 'success', message: '¡Compra realizada con éxito!' });
            await refreshUser(); // Update balance
        } catch (error: any) {
            console.error(error);
            setFeedbackModal({ type: 'error', message: error.message || 'Error al realizar la compra' });
        } finally {
            setLoading(false);
        }
    };

    const handleUsernameSubmit = () => {
        if (!newUsername.trim()) return;
        processTransaction('change-username', { newUsername });
    };

    return (
        <div className="min-h-screen bg-[var(--bg-deep)] pb-32 transition-colors duration-500">
            {/* Tropical Background Decorations - Sand Theme */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                {/* Subtle water caustics hint or palm shadows could go here */}
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--zoin-gold)]/5 rounded-full blur-[100px] mix-blend-multiply animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[var(--bg-panel)]/10 rounded-full blur-[100px] mix-blend-multiply" />
            </div>

            {/* Modals */}
            {purchaseModal && (
                <Modal
                    isOpen={!!purchaseModal}
                    onClose={() => setPurchaseModal(null)}
                    title="Confirmar Compra"
                >
                    <div className="space-y-4 text-center">
                        <div className="w-16 h-16 bg-[var(--zoin-gold)]/20 rounded-full flex items-center justify-center mx-auto text-3xl">🛒</div>
                        <p className="font-bold text-lg">¿Quieres comprar <span className="text-[var(--text-main)] font-black">{purchaseModal.name}</span>?</p>
                        <p className="text-sm opacity-80">Coste: <span className="font-bold text-[var(--zoin-gold)]">{purchaseModal.price} {purchaseModal.currency === 'EUR' ? '€' : 'Zoins'}</span></p>

                        <div className="flex gap-3 justify-center mt-6">
                            <button onClick={() => setPurchaseModal(null)} className="px-4 py-2 rounded-xl font-bold uppercase text-xs border border-[var(--text-main)]/20 hover:bg-black/5">Cancelar</button>
                            <button onClick={confirmPurchase} disabled={loading} className="px-6 py-2 rounded-xl font-black uppercase text-xs bg-[var(--text-main)] text-[var(--bg-deep)] hover:brightness-110 shadow-lg">
                                {loading ? 'Procesando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            <Modal
                isOpen={usernameModal}
                onClose={() => setUsernameModal(false)}
                title="Nuevo Nombre"
            >
                <div className="space-y-4">
                    <p className="text-sm font-bold opacity-80">Introduce tu nuevo nombre de usuario:</p>
                    <input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full bg-white/50 border-2 border-[var(--text-main)]/10 rounded-xl px-4 py-2 font-bold focus:border-[var(--text-main)] outline-none"
                        placeholder="Ej: MasterGamer99"
                        autoFocus
                    />
                    <div className="flex gap-3 justify-end mt-4">
                        <button onClick={() => setUsernameModal(false)} className="px-4 py-2 rounded-xl font-bold uppercase text-xs border border-[var(--text-main)]/20 hover:bg-black/5">Cancelar</button>
                        <button onClick={handleUsernameSubmit} disabled={loading || !newUsername} className="px-6 py-2 rounded-xl font-black uppercase text-xs bg-[var(--text-main)] text-[var(--bg-deep)] hover:brightness-110 shadow-lg">
                            {loading ? 'Guardando...' : 'GUARDAR'}
                        </button>
                    </div>
                </div>
            </Modal>

            {feedbackModal && (
                <Modal
                    isOpen={!!feedbackModal}
                    onClose={() => setFeedbackModal(null)}
                    title={feedbackModal.type === 'success' ? '¡Éxito!' : 'Error'}
                >
                    <div className="text-center space-y-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl ${feedbackModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {feedbackModal.type === 'success' ? <CheckCircle /> : <AlertCircle />}
                        </div>
                        <p className="font-bold">{feedbackModal.message}</p>
                        <button onClick={() => setFeedbackModal(null)} className="w-full px-4 py-3 rounded-xl font-black uppercase text-xs bg-[var(--text-main)] text-[var(--bg-deep)] hover:brightness-110 mt-4">
                            Entendido
                        </button>
                    </div>
                </Modal>
            )}

            {/* Main Content Container */}
            <main className="pt-4 px-4 max-w-lg mx-auto md:max-w-5xl lg:max-w-6xl space-y-8 relative z-10">

                {/* Hero / Welcome */}
                <header className="text-center space-y-2 py-4">
                    <h1 className="text-4xl md:text-6xl font-black text-[var(--text-main)] uppercase italic tracking-tighter drop-shadow-sm">
                        ZOOPLAY
                    </h1>
                    <p className="text-[var(--text-main)]/80 text-xs md:text-base max-w-2xl mx-auto font-bold leading-relaxed">
                        Tu web de entretenimiento donde puedes conseguir premios en la tienda mientras juegas.
                    </p>
                </header>

                {/* BLAZE ZONE: Games */}
                <section className="space-y-6 relative">
                    {/* Section Header */}
                    {/* Section Header */}
                    <div className="flex items-center justify-between bg-wood p-4 rounded-xl shadow-lg mb-6 border-2 border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--blaze-neon)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 w-full text-center">
                            <h2 className="text-xl font-black uppercase tracking-tight italic text-white leading-none drop-shadow-md">Arena de Juegos</h2>
                        </div>

                    </div>

                    {/* Games Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Neon Match Card */}
                        <div
                            onClick={() => navigate('/game/neon-match')}
                            className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden cursor-pointer group shadow-2xl transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(255,159,28,0.3)] border-4 border-[var(--blaze-neon)]"
                        >
                            <img
                                src="/tropical_match3_banner.png"
                                alt="Neon Match Tropical"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
                                <button className="bg-white text-[var(--text-main)] px-6 py-2 rounded-xl font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-lg border-b-4 border-gray-300 active:border-b-0 active:translate-y-1 flex items-center gap-2 text-sm">
                                    <Zap className="w-4 h-4 fill-current text-[var(--zoin-gold)]" />
                                    JUGAR
                                </button>
                            </div>
                            <div className="absolute top-4 left-4">
                                <span className="bg-[var(--blaze-neon)] text-white px-3 py-1 rounded-lg font-black text-xs uppercase tracking-widest shadow-lg">Popular</span>
                            </div>
                        </div>

                        {/* Bubble Shooter Card */}
                        <div
                            onClick={() => navigate('/game/bubble-shooter')}
                            className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden cursor-pointer group shadow-2xl transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] border-4 border-blue-500"
                        >
                            <img
                                src="/bubble_shooter_cover.png"
                                alt="Bubble Shooter Zoo"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter drop-shadow-md">Bubble Shooter</h3>
                                <p className="text-xs font-bold opacity-80">¡Explota burbujas en 3D!</p>
                            </div>

                            <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
                                <button className="bg-white text-blue-600 px-6 py-2 rounded-xl font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-lg border-b-4 border-gray-300 active:border-b-0 active:translate-y-1 flex items-center gap-2 text-sm">
                                    <Zap className="w-4 h-4 fill-current text-blue-400" />
                                    JUGAR
                                </button>
                            </div>
                            <div className="absolute top-4 left-4">
                                <span className="bg-blue-500 text-white px-3 py-1 rounded-lg font-black text-xs uppercase tracking-widest shadow-lg">Nuevo</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* KAI ZONE: Market/VIP */}
                <section id="market" className="relative pt-8">
                    {/* Background decoration for Kai Section */}
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[var(--kai-green)]/10 to-transparent -z-10 rounded-3xl blur-3xl opacity-50" />

                    <div className="flex flex-col md:flex-row items-center gap-8 mb-8">


                        <div className="w-full">
                            <div className="flex items-center justify-between bg-wood p-4 rounded-xl shadow-lg mb-6 border-2 border-white/10 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-[var(--kai-green)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 w-full text-center">
                                    <h2 className="text-xl font-black uppercase tracking-tight text-white leading-none drop-shadow-md">
                                        Kai's Market
                                    </h2>
                                </div>

                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                <MarketCard
                                    id="change-username"
                                    name="Cambio de Nombre"
                                    price={5}
                                    image="/market_username_change.png"
                                    onClick={(id, price, name) => handleBuyClick(id, price, name)}
                                    status={getMarketItemStatus(5)}
                                />
                                <MarketCard
                                    id="pack-20"
                                    name="Pack 20 Partidas"
                                    price={0.50}
                                    image="/market_pack_20.png"
                                    onClick={(id, price, name) => handleBuyClick(id, price, name)}
                                    status={getMarketItemStatus(0.50)}
                                />
                                <MarketCard
                                    id="pack-5-zoins"
                                    name="5 Zoins"
                                    price={5}
                                    currency="EUR"
                                    image="/market_pack_20.png"
                                    onClick={(id, price, name, currency) => handleBuyClick(id, price, name, currency)}
                                    status={getMarketItemStatus(5, 'EUR')}
                                />
                                <MarketCard
                                    id="pack-10-zoins"
                                    name="10 Zoins"
                                    price={10}
                                    currency="EUR"
                                    image="/market_pack_50.png"
                                    onClick={(id, price, name, currency) => handleBuyClick(id, price, name, currency)}
                                    status={getMarketItemStatus(10, 'EUR')}
                                />
                                <MarketCard
                                    id="pack-50"
                                    name="Pack 50 Partidas"
                                    price={1.00}
                                    image="/market_pack_50.png"
                                    onClick={(id, price, name) => handleBuyClick(id, price, name)}
                                    status={getMarketItemStatus(1.00)}
                                />
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
