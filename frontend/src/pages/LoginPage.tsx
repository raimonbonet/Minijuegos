
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
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
        window.location.href = 'http://localhost:3000/auth/google';
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--blaze-neon)]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--blaze-neon)] to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
                        Iniciar <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--blaze-neon)] to-blue-500">Sesión</span>
                    </h1>
                    <p className="text-white/40 text-sm font-bold tracking-wider uppercase">Introduce tus credenciales</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--blaze-neon)] uppercase tracking-[0.2em] ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[var(--blaze-neon)] transition-colors" />
                            <input
                                type="email"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-12 text-white placeholder-white/20 focus:outline-none focus:border-[var(--blaze-neon)]/50 focus:bg-white/10 transition-all font-medium"
                                placeholder="correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--blaze-neon)] uppercase tracking-[0.2em] ml-1">Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[var(--blaze-neon)] transition-colors" />
                            <input
                                type="password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-12 text-white placeholder-white/20 focus:outline-none focus:border-[var(--blaze-neon)]/50 focus:bg-white/10 transition-all font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[var(--blaze-neon)] to-blue-600 text-black font-black uppercase py-4 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Cargando...' : 'Entrar al Sistema'}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-[#101012] px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">O acceder con</span>
                    </div>
                </div>

                {/* Google Button */}
                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full bg-white hover:bg-gray-100 text-black font-bold uppercase py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg"
                >
                    <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google" className="w-5 h-5" />
                    <span>Google</span>
                </button>

                {/* Register Link */}
                <div className="mt-8 text-center bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-white/40 text-xs font-medium mb-3">
                        ¿Aún no tienes cuenta registrada?
                    </p>
                    <button
                        onClick={() => setIsRegisterOpen(true)}
                        className="text-[var(--blaze-neon)] font-black uppercase tracking-widest text-xs hover:text-white transition-colors border-b border-[var(--blaze-neon)]/30 hover:border-white pb-0.5"
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
