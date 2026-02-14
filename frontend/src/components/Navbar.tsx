
import { User, LogIn, LogOut, Gamepad2, CreditCard, ShoppingBag, Shield, BarChart2 } from 'lucide-react';

interface NavbarProps {
    user: any;
    onLoginClick: () => void;
    onLogoutClick: () => void;
}

export const Navbar = ({ user, onLoginClick, onLogoutClick }: NavbarProps) => (
    <nav className="fixed top-0 w-full z-50 h-16 px-4 flex items-center justify-between shadow-xl bg-wood transition-colors duration-500">
        {/* Brand */}
        <div
            className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.location.href = '/'}
        >
            <span className="text-2xl font-black tracking-tighter uppercase italic text-white drop-shadow-md">
                Zooplay
            </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
            {user ? (
                <>
                    {/* Games Counter */}
                    <div className="flex items-center gap-2 bg-[var(--bg-deep)] px-4 py-1.5 rounded-full border-2 border-[var(--blaze-neon)]/50 shadow-inner cursor-pointer hover:brightness-110 transition-all">
                        <Gamepad2 className="w-5 h-5 text-[var(--blaze-neon)]" />
                        <span className="font-black text-xl text-[var(--text-main)] tracking-tight font-mono">
                            {user.isAdmin ? '∞' : Math.max(0, (function (membership) {
                                switch (membership) {
                                    case 'PALMERA': return 8;
                                    case 'CORAL': return 15;
                                    case 'PERLA': return 25;
                                    default: return 3;
                                }
                            })(user.membership || 'FREE') - (user.dailyGamesPlayed || 0))}
                        </span>
                    </div>

                    {/* Wallet - High Contrast Sand on Wood */}
                    <div className="flex items-center gap-2 bg-[var(--bg-deep)] px-4 py-1.5 rounded-full border-2 border-[var(--text-main)]/20 shadow-inner cursor-pointer hover:brightness-110 transition-all">
                        <img src="/zoins_icon.jpg" alt="Zoins" className="w-5 h-5 rounded-full object-cover border border-[var(--text-main)]/10" />
                        <span className="font-black text-xl text-[var(--text-main)] tracking-tight font-mono">
                            {Number(user.Zoins || user.wallet?.balance || 0).toFixed(2)}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block h-6 w-px bg-white/20 mx-1"></div>

                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <span className="hidden md:block text-sm font-bold text-white drop-shadow-sm">
                            {user.name || user.username || user.full_name || user.email?.split('@')[0]}
                        </span>

                        {/* Profile Dropdown */}
                        <div className="relative group">
                            <div
                                onClick={() => window.location.href = '/profile'}
                                className="w-9 h-9 rounded-full bg-[var(--bg-deep)] border-2 border-white/20 flex items-center justify-center shadow-md text-[var(--text-main)] cursor-pointer hover:border-[var(--text-main)] transition-all"
                            >
                                <User className="w-4 h-4" />
                            </div>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--bg-deep)] border-2 border-[var(--text-main)]/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50 overflow-hidden">
                                <div className="py-2">
                                    {[
                                        { label: 'Mis Datos', tab: 'data', icon: User },
                                        { label: 'Mi Suscripción', tab: 'subscription', icon: CreditCard },
                                        { label: 'Mis Pedidos', tab: 'orders', icon: ShoppingBag },
                                        { label: 'Seguridad', tab: 'security', icon: Shield },
                                        { label: 'Estadísticas', tab: 'stats', icon: BarChart2 }
                                    ].map((item) => (
                                        <a
                                            key={item.tab}
                                            href={`/profile?tab=${item.tab}`}
                                            className="flex items-center gap-3 px-4 py-3 text-[var(--text-main)] hover:text-[var(--bg-deep)] hover:bg-[var(--text-main)] transition-colors"
                                        >
                                            <item.icon className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={onLogoutClick}
                            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </>
            ) : (
                <button
                    onClick={onLoginClick}
                    className="flex items-center gap-2 px-6 py-2 bg-[var(--bg-deep)] border-2 border-[var(--text-main)] text-[var(--text-main)] font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-105 hover:shadow-lg"
                >
                    <LogIn className="w-3 h-3" />
                    <span className="hidden sm:block">Acceder</span>
                </button>
            )}
        </div>
    </nav>
);
