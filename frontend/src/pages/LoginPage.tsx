
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, API_URL } from '../lib/api';
import { Mail, Lock, ArrowRight, Zap } from 'lucide-react';
import RegisterModal from '../components/RegisterModal';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            localStorage.setItem('token', data.access_token);
            navigate('/');
        } catch (error: any) {
            alert(error.message || 'Error en el inicio de sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    return (

        <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience - Tropical Sun & Leaf Shadows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--zoin-gold)]/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[var(--kai-green)]/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />

            {/* Main Card - Blue Glass Panel */}
            <div className="glass-panel rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500 border-white/20">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--blaze-neon)] to-[var(--zoin-gold)] flex items-center justify-center shadow-lg transform rotate-3 border-2 border-white/20">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2 drop-shadow-md">
                        Iniciar <span className="text-[var(--zoin-gold)]">Sesión</span>
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm font-bold tracking-wider uppercase opacity-90">Introduce tus credenciales</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-dark)]/50 group-focus-within:text-[var(--blaze-neon)] transition-colors z-10" />
                            <input
                                type="email"
                                className="w-full bg-[var(--bg-deep)] border-2 border-transparent rounded-xl px-4 py-3.5 pl-12 text-[var(--text-dark)] placeholder-[var(--text-dark)]/30 focus:outline-none focus:border-[var(--blaze-neon)] transition-all font-medium shadow-inner"
                                placeholder="correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] ml-1">Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-dark)]/50 group-focus-within:text-[var(--blaze-neon)] transition-colors z-10" />
                            <input
                                type="password"
                                className="w-full bg-[var(--bg-deep)] border-2 border-transparent rounded-xl px-4 py-3.5 pl-12 text-[var(--text-dark)] placeholder-[var(--text-dark)]/30 focus:outline-none focus:border-[var(--blaze-neon)] transition-all font-medium shadow-inner"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button - Wood Style */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-wood w-full py-4 text-xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                    >
                        {loading ? 'Cargando...' : 'Entrar'}
                        {!loading && <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 drop-shadow-sm">O acceder con</span>
                    </div>
                </div>

                {/* Google Button */}
                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full bg-white hover:bg-gray-50 text-[var(--text-dark)] font-bold uppercase py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg border-b-4 border-gray-200"
                >
                    <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google" className="w-5 h-5" />
                    <span>Google</span>
                </button>

                {/* Register Link */}
                <div className="mt-8 text-center">
                    <p className="text-white/70 text-xs font-medium mb-3">
                        ¿Aún no tienes cuenta registrada?
                    </p>
                    <button
                        onClick={() => setIsRegisterOpen(true)}
                        className="text-[var(--zoin-gold)] font-black uppercase tracking-widest text-xs hover:text-white transition-colors border-b-2 border-transparent hover:border-white pb-0.5 shadow-sm"
                    >
                        Solicitar Acceso / Registro
                    </button>
                </div>

                <RegisterModal
                    isOpen={isRegisterOpen}
                    onClose={() => setIsRegisterOpen(false)}
                />
            </div>
        </div>
    );
}
