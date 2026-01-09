import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, X, Loader2 } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isVerificationSent, setIsVerificationSent] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === 'login') {
                const data = await apiRequest('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                });

                // Save token and notify parent
                localStorage.setItem('token', data.access_token);
                // Fetch profile to update UI immediately
                const profile = await apiRequest('/auth/profile', { token: data.access_token });
                onSuccess(profile);
                onClose();
            } else {
                // Register Flow
                await apiRequest('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ email, password, name }),
                });
                setIsVerificationSent(true);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Ocurrió un error. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:3000/auth/google';
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setError(null);
        setIsVerificationSent(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-[420px] bg-[#09090b] border border-[var(--blaze-neon)] rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header Illustration */}
                <div className="relative h-32 bg-gradient-to-b from-[var(--blaze-neon)]/20 to-transparent flex items-center justify-center overflow-hidden">
                    <img
                        src="/blaze_v5.png"
                        alt="Blaze"
                        className="h-full w-full object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent" />

                    <h2 className="absolute bottom-4 text-2xl font-black uppercase italic text-white drop-shadow-md tracking-tight">
                        {isVerificationSent ? '¡Casi listo!' : (mode === 'login' ? 'Bienvenido de nuevo' : 'Únete a la Arena')}
                    </h2>
                </div>

                <div className="p-8 pt-2">
                    {isVerificationSent ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-[var(--blaze-neon)]/10 text-[var(--blaze-neon)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--blaze-neon)]/30">
                                <Mail className="w-8 h-8 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Verifica tu correo</h3>
                            <p className="text-white/60 mb-6">Hemos enviado un enlace de activación a <strong>{email}</strong>.</p>
                            <button onClick={toggleMode} className="text-[var(--blaze-neon)] font-bold hover:underline text-sm">
                                Volver al inicio de sesión
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Google Button */}
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full h-12 flex items-center justify-center gap-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all mb-6 group"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                                <span>Continuar con Google</span>
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
                            </button>

                            <div className="relative flex items-center justify-center mb-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                <span className="relative bg-[#09090b] px-3 text-xs text-white/30 uppercase font-bold tracking-widest">o con tu correo</span>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-bold text-center animate-shake">
                                        {error}
                                    </div>
                                )}

                                {mode === 'register' && (
                                    <div className="space-y-1">
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                            <input
                                                type="text"
                                                placeholder="Nombre de Usuario"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl h-10 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[var(--blaze-neon)] focus:ring-1 focus:ring-[var(--blaze-neon)] transition-all placeholder:text-white/20"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            type="email"
                                            placeholder="Correo Electrónico"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl h-10 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[var(--blaze-neon)] focus:ring-1 focus:ring-[var(--blaze-neon)] transition-all placeholder:text-white/20"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            type="password"
                                            placeholder="Contraseña"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl h-10 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[var(--blaze-neon)] focus:ring-1 focus:ring-[var(--blaze-neon)] transition-all placeholder:text-white/20"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 mt-2 bg-gradient-to-r from-[var(--blaze-neon)] to-[var(--blaze-deep)] text-black font-black uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {mode === 'login' ? 'Acceder' : 'Crear Cuenta'}
                                </button>
                            </form>

                            {/* Footer Toggle */}
                            <div className="mt-6 text-center">
                                <p className="text-white/40 text-xs">
                                    {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                                    <button
                                        onClick={toggleMode}
                                        className="ml-1 text-[var(--blaze-neon)] font-bold hover:underline"
                                    >
                                        {mode === 'login' ? 'Regístrate' : 'Entra aquí'}
                                    </button>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
