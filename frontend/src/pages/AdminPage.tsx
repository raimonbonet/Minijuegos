
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Edit, X, User as UserIcon, LogOut, Shield } from 'lucide-react';
import { apiRequest } from '../lib/api';

// --- Types ---
interface User {
    id: string;
    nombre: string | null;
    apellidos: string | null;
    email: string;
    dni: string | null;
    Zoins: string | number;
    isAdmin: boolean;
    isFrozen: boolean; // Added isFrozen
}

interface Score {
    id: string;
    amount: number;
    game: string;
    createdAt: string;
    user: {
        email: string;
        nombre: string | null;
        apellidos: string | null;
    };
}

// --- Components ---

const AdminNavbar = ({ onLogout }: { onLogout: () => void }) => (
    <nav className="fixed top-0 w-full z-50 h-16 px-4 flex items-center justify-between shadow-xl bg-wood">
        <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-white" />
            <span className="text-2xl font-black tracking-tighter uppercase italic text-white drop-shadow-md">
                Admin<span className="text-[var(--blaze-neon)]">Panel</span>
            </span>
        </div>
        <div className="flex items-center gap-4">
            <Link
                to="/"
                className="text-white/70 hover:text-white transition-colors text-sm font-bold drop-shadow-sm"
            >
                Volver al Inicio
            </Link>
            <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10"
            >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-bold">Salir</span>
            </button>
        </div>
    </nav>
);

const EditBalanceModal = ({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (amount: number, mode: 'set' | 'add') => void }) => {
    const [amount, setAmount] = useState<string>('');
    const [mode, setMode] = useState<'set' | 'add'>('set');

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[var(--bg-deep)]/80 backdrop-blur-sm animate-in fade-in">
            <div className="glass-panel w-full max-w-md p-6 relative shadow-2xl rounded-2xl border border-white/20">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-black text-white uppercase italic mb-6 flex items-center gap-2 drop-shadow-md">
                    <Edit className="w-5 h-5 text-[var(--blaze-neon)]" />
                    Editar Saldo
                </h3>

                <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                        <p className="text-xs text-white/70 uppercase font-bold tracking-wider">Usuario</p>
                        <p className="text-lg font-bold text-white">{user.email}</p>
                        <p className="text-sm text-[var(--zoin-gold)] font-mono mt-1">Saldo Actual: {user.Zoins}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setMode('set')}
                            className={`p-2 rounded-lg text-sm font-bold transition-all ${mode === 'set' ? 'bg-[var(--blaze-neon)] text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                        >
                            Establecer Fijo
                        </button>
                        <button
                            onClick={() => setMode('add')}
                            className={`p-2 rounded-lg text-sm font-bold transition-all ${mode === 'add' ? 'bg-[var(--kai-green)] text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                        >
                            Sumar / Restar
                        </button>
                    </div>

                    <div>
                        <label className="text-xs text-white/80 font-bold uppercase tracking-wider mb-2 block">
                            {mode === 'set' ? 'Nuevo Saldo Total' : 'Cantidad a añadir (negativo para restar)'}
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            // Input keeps dark text on light background for readability
                            className="w-full bg-[var(--bg-deep)] border border-white/10 rounded-xl p-3 text-[var(--text-main)] font-mono focus:outline-none focus:border-[var(--blaze-neon)] transition-all placeholder-[var(--text-muted)]/50 shadow-inner"
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>

                    <button
                        onClick={() => onSave(parseFloat(amount), mode)}
                        disabled={!amount}
                        className="btn-wood w-full py-3 text-white font-black uppercase tracking-wider rounded-xl mt-4 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AdminPage() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<'users' | 'scores'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [scores, setScores] = useState<Score[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [selectedGame, setSelectedGame] = useState<string>('neon-match');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await apiRequest(`/admin/users?search=${encodeURIComponent(search)}`);
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchScores = async () => {
        if (!selectedGame) return;
        setLoading(true);
        try {
            const timestamp = new Date().getTime();
            const data = await apiRequest(`/admin/rankings-list?game=${encodeURIComponent(selectedGame)}&_t=${timestamp}`);
            setScores(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search (only for Users)
    useEffect(() => {
        if (tab === 'users') {
            const timer = setTimeout(() => {
                fetchUsers();
            }, 500);
            return () => clearTimeout(timer);
        } else {
            fetchScores();
        }
    }, [search, tab, selectedGame]); // Add selectedGame dependency

    const handleUpdateZoins = async (amount: number, mode: 'set' | 'add') => {
        if (!editingUser) return;
        try {
            await apiRequest(`/admin/users/${editingUser.id}/zoins`, {
                method: 'PATCH',
                body: JSON.stringify({ amount, mode })
            });
            setEditingUser(null);
            fetchUsers(); // Refresh list
        } catch (e) {
            alert('Error updating balance: ' + (e as Error).message);
        }
    };

    const handleUnfreeze = async (userId: string) => {
        if (!confirm('¿Estás seguro de descongelar a este usuario?')) return;
        try {
            await apiRequest(`/admin/users/${userId}/unfreeze`, { method: 'PATCH' });
            fetchUsers();
            alert('Usuario descongelado con éxito.');
        } catch (e) {
            alert('Error al descongelar: ' + (e as Error).message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-deep)] pb-20">
            <AdminNavbar onLogout={handleLogout} />

            <main className="pt-24 px-4 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-[var(--text-main)] uppercase italic tracking-tighter drop-shadow-md">
                                {tab === 'users' ? 'Gestión de Usuarios' : 'Rankings Globales'}
                            </h1>
                            <p className="text-[var(--text-main)]/80 text-sm font-medium">
                                {tab === 'users' ? 'Administra cuentas, saldos y bloqueos.' : 'Supervisa puntuaciones para detectar fraudes.'}
                            </p>
                        </div>

                        <div className="flex bg-[var(--bg-panel)] rounded-lg p-1 self-start md:self-center shadow-md border border-white/10">
                            <button
                                onClick={() => setTab('users')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${tab === 'users' ? 'bg-[var(--blaze-neon)] text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                            >
                                Usuarios
                            </button>
                            <button
                                onClick={() => setTab('scores')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${tab === 'scores' ? 'bg-[var(--blaze-neon)] text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                            >
                                Rankings
                            </button>
                        </div>
                    </div>

                    {tab === 'users' && (
                        <div className="relative w-full group">
                            <input
                                type="text"
                                placeholder="Buscar por Email, Nombre o DNI..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full glass-panel border border-white/20 rounded-xl px-5 py-4 pl-12 text-white placeholder-white/50 focus:outline-none focus:border-[var(--blaze-neon)]/50 focus:bg-[var(--bg-panel)]/80 transition-all text-lg shadow-sm"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-[var(--blaze-neon)] transition-colors" />
                        </div>
                    )}

                    {tab === 'scores' && (
                        <div className="relative w-full md:w-64">
                            <label className="text-xs text-[var(--text-main)]/80 font-bold uppercase tracking-wider mb-2 block pl-1">Filtrar por Juego</label>
                            <select
                                value={selectedGame}
                                onChange={(e) => setSelectedGame(e.target.value)}
                                className="w-full glass-panel border border-white/20 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[var(--blaze-neon)]/50 focus:bg-[var(--bg-panel)]/80 transition-all appearance-none cursor-pointer shadow-sm"
                            >
                                <option value="neon-match" className="bg-[var(--bg-panel)] text-white">Neon Match</option>
                                {/* Add more games here in future */}
                            </select>
                            <div className="absolute right-4 bottom-3.5 pointer-events-none text-white/50">
                                ▼
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    {tab === 'users' ? (
                                        <>
                                            <th className="p-4 text-xs font-black text-white/60 uppercase tracking-wider">Usuario</th>
                                            <th className="p-4 text-xs font-black text-white/60 uppercase tracking-wider text-right">Saldo (Zoins)</th>
                                            <th className="p-4 text-xs font-black text-white/60 uppercase tracking-wider text-right">Acciones</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="p-4 text-xs font-black text-white/60 uppercase tracking-wider">Juego</th>
                                            <th className="p-4 text-xs font-black text-white/60 uppercase tracking-wider">Jugador</th>
                                            <th className="p-4 text-xs font-black text-white/60 uppercase tracking-wider text-right">Puntuación</th>
                                            <th className="p-4 text-xs font-black text-white/60 uppercase tracking-wider text-right">Fecha</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-white/60 italic">Cargando...</td>
                                    </tr>
                                ) : (tab === 'users' ? users : scores).length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-white/60 italic">No se encontraron resultados</td>
                                    </tr>
                                ) : (
                                    tab === 'users' ? (
                                        (users as User[]).map(user => (
                                            <tr key={user.id} className={`hover:bg-white/10 transition-colors group ${user.isFrozen ? 'bg-blue-500/10 hover:bg-blue-500/20' : ''}`}>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.isAdmin ? 'bg-red-500/20 text-red-300' : user.isFrozen ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10 text-white/60'}`}>
                                                            {user.isAdmin ? <Shield className="w-4 h-4" /> : user.isFrozen ? <span className="text-lg">❄️</span> : <UserIcon className="w-4 h-4" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-sm flex items-center gap-2">
                                                                {user.nombre ? `${user.nombre} ${user.apellidos || ''}` : 'Sin nombre'}
                                                                {user.isFrozen && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded uppercase font-black">Congelado</span>}
                                                            </div>
                                                            <div className="text-xs text-white/60 font-mono">{user.email}</div>
                                                            {user.dni && <div className="text-[10px] text-white/40 uppercase tracking-wide mt-0.5">DNI: {user.dni}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className="font-mono font-bold text-[var(--zoin-gold)] text-lg tracking-tight">
                                                        {Number(user.Zoins).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingUser(user)}
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                            Editar
                                                        </button>
                                                        {user.isFrozen && (
                                                            <button
                                                                onClick={() => handleUnfreeze(user.id)}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-xs font-bold text-blue-300 transition-all hover:scale-105"
                                                            >
                                                                🔓 Descongelar
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        (scores as Score[]).map(score => (
                                            <tr key={score.id} className="hover:bg-white/10 transition-colors">
                                                <td className="p-4 text-sm font-bold text-white uppercase tracking-wider">{score.game}</td>
                                                <td className="p-4">
                                                    <div className="text-sm font-bold text-white">{score.user.email}</div>
                                                    <div className="text-xs text-white/60">{score.user.nombre || 'Anon'} {score.user.apellidos || ''}</div>
                                                </td>
                                                <td className="p-4 text-right font-mono font-bold text-white text-lg">
                                                    {score.amount}
                                                </td>
                                                <td className="p-4 text-right text-xs text-white/60 font-mono">
                                                    {new Date(score.createdAt).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {editingUser && (
                <EditBalanceModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleUpdateZoins}
                />
            )}
        </div>
    );
}
