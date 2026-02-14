
import { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { User, CreditCard, ShoppingBag, Shield, BarChart2, Edit2, Save } from 'lucide-react';
import { apiRequest } from '../lib/api';

// --- Sub-components (will be refactored later if too large) ---

const ProfileData = ({ user, refreshUser }: { user: any, refreshUser: () => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
        dni: user.dni || '',
        fechaNacimiento: user.fechaNacimiento ? new Date(user.fechaNacimiento).toISOString().split('T')[0] : '',
        sexo: user.sexo || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiRequest('/users/profile', {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            await refreshUser();
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            alert('Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-[var(--text-main)] uppercase italic">Mis Datos</h2>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-[var(--text-main)] hover:text-[var(--blaze-neon)] transition-colors">
                        <Edit2 className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wider">Editar</span>
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--text-main)]/70 uppercase tracking-wider">Usuario</label>
                    <input disabled value={user.username} className="w-full bg-white/40 border border-[var(--text-main)]/10 rounded-xl px-4 py-3 text-[var(--text-main)] opacity-60 cursor-not-allowed font-mono font-bold" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--text-main)]/70 uppercase tracking-wider">Email</label>
                    <input disabled value={user.email} className="w-full bg-white/40 border border-[var(--text-main)]/10 rounded-xl px-4 py-3 text-[var(--text-main)] opacity-60 cursor-not-allowed font-mono font-bold" />
                </div>

                {/* Editable Fields */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--text-main)] uppercase tracking-wider">Nombre</label>
                    <input
                        disabled={!isEditing}
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className={`w-full bg-white border rounded-xl px-4 py-3 text-[var(--text-main)] font-bold transition-all ${isEditing ? 'border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/20 shadow-lg' : 'border-[var(--text-main)]/20'}`}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--text-main)] uppercase tracking-wider">Apellidos</label>
                    <input
                        disabled={!isEditing}
                        value={formData.apellidos}
                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                        className={`w-full bg-white border rounded-xl px-4 py-3 text-[var(--text-main)] font-bold transition-all ${isEditing ? 'border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/20 shadow-lg' : 'border-[var(--text-main)]/20'}`}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--text-main)] uppercase tracking-wider">DNI / NIF</label>
                    <input
                        disabled={!isEditing}
                        value={formData.dni}
                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                        className={`w-full bg-white border rounded-xl px-4 py-3 text-[var(--text-main)] font-bold transition-all ${isEditing ? 'border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/20 shadow-lg' : 'border-[var(--text-main)]/20'}`}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--text-main)] uppercase tracking-wider">Fecha Nacimiento</label>
                    <input
                        type="date"
                        disabled={!isEditing}
                        value={formData.fechaNacimiento}
                        onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                        className={`w-full bg-white border rounded-xl px-4 py-3 text-[var(--text-main)] font-bold transition-all ${isEditing ? 'border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/20 shadow-lg' : 'border-[var(--text-main)]/20'}`}
                    />
                </div>

                {isEditing && (
                    <div className="col-span-full flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false); setFormData({
                                    nombre: user.nombre || '',
                                    apellidos: user.apellidos || '',
                                    dni: user.dni || '',
                                    fechaNacimiento: user.fechaNacimiento ? new Date(user.fechaNacimiento).toISOString().split('T')[0] : '',
                                    sexo: user.sexo || '',
                                });
                            }}
                            className="px-6 py-2 rounded-xl text-[var(--text-main)] hover:bg-[var(--text-main)]/10 transition-all font-bold uppercase tracking-wider text-xs border border-[var(--text-main)]/20"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[var(--text-main)] text-white px-8 py-2 rounded-xl font-black uppercase tracking-wider text-xs hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[var(--text-main)]/20"
                        >
                            {loading ? 'Guardando...' : <><Save className="w-4 h-4" /> Guardar Cambios</>}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

const ProfileSubscription = ({ user }: { user: any }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-black text-[var(--text-main)] uppercase italic">Mi Suscripción</h2>

        <div className="bg-gradient-to-br from-[var(--text-main)] to-[#2d1b18] p-6 rounded-2xl relative overflow-hidden text-white shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <CreditCard className="w-40 h-40 text-white" />
            </div>

            <div className="relative z-10">
                <div className="text-sm font-bold text-[var(--zoin-gold)] uppercase tracking-widest mb-1">Plan Actual</div>
                <div className="text-5xl font-black text-white uppercase italic mb-6">{user.membership || 'FREE'}</div>

                <div className="flex flex-col gap-3 text-white/90 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        <span className="font-mono font-bold tracking-wide">Estado: Activo</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[var(--zoin-gold)] shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
                        <span className="font-mono font-bold tracking-wide">Partidas Diarias: {user.membership === 'FREE' ? 3 : user.membership === 'PALMERA' ? 8 : user.membership === 'CORAL' ? 15 : '∞'}</span>
                    </div>
                </div>

                <button
                    onClick={() => window.location.href = '/subscriptions'}
                    className="bg-white text-[var(--text-main)] px-8 py-3 rounded-xl font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-lg border-b-4 border-gray-300 active:border-b-0 active:translate-y-1"
                >
                    Gestionar Suscripción
                </button>
            </div>
        </div>
    </div>
);

const ProfileOrders = ({ user }: { user: any }) => {
    const [transactions] = useState([]);
    console.log("Orders for user:", user.id);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-[var(--text-main)] uppercase italic">Mis Pedidos</h2>
            {transactions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[var(--text-main)]/20 rounded-2xl bg-white/30">
                    <ShoppingBag className="w-12 h-12 text-[var(--text-main)]/30 mx-auto mb-4" />
                    <p className="text-[var(--text-main)]/60 font-mono font-bold">No hay transacciones recientes.</p>
                </div>
            ) : (
                <div>Listado de transacciones...</div>
            )}
        </div>
    );
};

const ProfileSecurity = ({ user, refreshUser }: { user: any, refreshUser: () => void }) => {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async () => {
        if (passwords.new !== passwords.confirm) {
            alert('Las nuevas contraseñas no coinciden');
            return;
        }
        if (passwords.new.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (user.hasPassword && !passwords.current) {
            alert('Por favor introduce tu contraseña actual');
            return;
        }

        setLoading(true);
        try {
            await apiRequest('/users/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    password: passwords.new,
                    currentPassword: passwords.current // Only needed if user.hasPassword
                })
            });
            await refreshUser();
            alert('Contraseña actualizada correctamente');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Error al cambiar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-[var(--text-main)] uppercase italic">Seguridad</h2>
            <div className="max-w-md">
                <div className="space-y-4">
                    {user.hasPassword && (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[var(--text-main)] uppercase tracking-wider">Contraseña Actual</label>
                            <input
                                type="password"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                className="w-full bg-white border border-[var(--text-main)]/20 rounded-xl px-4 py-3 text-[var(--text-main)] font-black focus:border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/10 transition-all placeholder:text-[var(--text-main)]/30"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black text-[var(--text-main)] uppercase tracking-wider">Nueva Contraseña</label>
                        <input
                            type="password"
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            className="w-full bg-white border border-[var(--text-main)]/20 rounded-xl px-4 py-3 text-[var(--text-main)] font-black focus:border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/10 transition-all placeholder:text-[var(--text-main)]/30"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-[var(--text-main)] uppercase tracking-wider">Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            className="w-full bg-white border border-[var(--text-main)]/20 rounded-xl px-4 py-3 text-[var(--text-main)] font-black focus:border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/10 transition-all placeholder:text-[var(--text-main)]/30"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        onClick={handlePasswordChange}
                        disabled={loading}
                        className="bg-red-500 text-white border-b-4 border-red-700 px-6 py-3 rounded-xl font-black uppercase tracking-wider hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all w-full shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'GUARDAR CAMBIOS'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProfileStats = ({ user }: { user: any }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-black text-[var(--text-main)] uppercase italic">Estadísticas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-2 border-[var(--text-main)]/10 p-4 rounded-xl text-center shadow-sm">
                <div className="text-xs font-bold text-[var(--text-main)]/60 uppercase tracking-wider mb-1">Partidas Jugadas</div>
                <div className="text-3xl font-black text-[var(--text-main)] font-mono">{user.dailyGamesPlayed ?? 0}</div>
            </div>
            <div className="bg-white border-2 border-[var(--text-main)]/10 p-4 rounded-xl text-center shadow-sm">
                <div className="text-xs font-bold text-[var(--text-main)]/60 uppercase tracking-wider mb-1">Puntuación Total</div>
                <div className="text-3xl font-black text-[var(--text-main)] font-mono">-</div>
            </div>
        </div>
        {/* Graph or Table placeholder */}
        <div className="h-64 bg-white/40 rounded-2xl flex items-center justify-center border-2 border-[var(--text-main)]/10 border-dashed">
            <BarChart2 className="w-12 h-12 text-[var(--text-main)]/20" />
        </div>
    </div>
);


// --- Main Page Component ---

export default function ProfilePage() {
    const { user, refreshUser } = useOutletContext<any>();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<'data' | 'subscription' | 'orders' | 'security' | 'stats'>('data');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['data', 'subscription', 'orders', 'security', 'stats'].includes(tab)) {
            setActiveTab(tab as any);
        }
    }, [searchParams]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text-main)] p-4 md:p-8 pb-32">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">

                {/* Sidebar Navigation */}
                <div className="md:col-span-3 lg:col-span-3 space-y-4">
                    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl text-center border-2 border-[var(--text-main)]/10 shadow-lg">
                        <div className="w-24 h-24 rounded-full bg-[var(--bg-deep)] border-4 border-[var(--text-main)] mx-auto mb-4 flex items-center justify-center shadow-xl overflow-hidden relative">
                            {/* Initials Avatar Fallback */}
                            <span className="text-3xl font-black text-[var(--text-main)]">
                                {user.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
                            </span>
                        </div>
                        <h1 className="text-xl font-black uppercase italic truncate text-[var(--text-main)]">{user.name || user.username}</h1>
                        <p className="text-xs font-bold text-[var(--text-main)]/60 uppercase tracking-widest mt-1">{user.membership || 'FREE'} MEMBER</p>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: 'data', label: 'Mis Datos', icon: User },
                            { id: 'subscription', label: 'Mi Suscripción', icon: CreditCard },
                            { id: 'orders', label: 'Mis Pedidos', icon: ShoppingBag },
                            { id: 'security', label: 'Seguridad', icon: Shield },
                            { id: 'stats', label: 'Estadísticas', icon: BarChart2 },
                        ].map((item) => {
                            const isActive = activeTab === item.id;
                            // Active: Inverse colors (Gold bg, Brown text) - High contrast
                            // Inactive: Brown bg, Gold text? Or default button style?
                            // User said: "All options as selected" (Filled) and "Selected option inverse".
                            // Let's interpret:
                            // Inactive: bg-[var(--text-main)] text-[var(--bg-deep)] (Brown block)
                            // Active: bg-[var(--bg-deep)] text-[var(--text-main)] (Gold block)
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as any)}
                                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-black uppercase tracking-wider text-xs transition-all shadow-md
                                        ${isActive
                                            ? 'bg-[var(--bg-deep)] text-[var(--text-main)] scale-105 ring-2 ring-[var(--text-main)]'
                                            : 'bg-[var(--text-main)] text-[var(--bg-deep)] hover:brightness-110 hover:translate-x-1'
                                        }
                                    `}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-9 lg:col-span-9">
                    {/* Cream/Sand colored panel for brown text visibility */}
                    <div className="bg-[var(--bg-deep)] p-8 md:p-12 rounded-3xl min-h-[600px] border-4 border-[var(--text-main)]/10 shadow-2xl relative overflow-hidden">

                        {/* Subtle Texture/Decor */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--zoin-gold)]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />

                        <div className="relative z-10 animate-fade-in">
                            {activeTab === 'data' && <ProfileData user={user} refreshUser={refreshUser} />}
                            {activeTab === 'subscription' && <ProfileSubscription user={user} />}
                            {activeTab === 'orders' && <ProfileOrders user={user} />}
                            {activeTab === 'security' && <ProfileSecurity user={user} refreshUser={refreshUser} />}
                            {activeTab === 'stats' && <ProfileStats user={user} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
