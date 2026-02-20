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
            <div className="relative w-full max-w-[420px] glass-panel border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Close Button */}
                < button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button >

                {/* Header Illustration */}
                < div className="relative h-32 flex items-center justify-center overflow-hidden bg-[var(--bg-deep)]/10" >
                    <img
                        src="/blaze_v5.png"
                        alt="Blaze"
                        className="h-full w-full object-cover opacity-80 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-panel)] to-transparent" />

                    <h2 className="absolute bottom-4 text-2xl font-black uppercase italic text-white drop-shadow-md tracking-tight text-center w-full px-4">
                        {isVerificationSent ? '¡Casi listo!' : (mode === 'login' ? 'Bienvenido de nuevo' : 'Únete a la Arena')}
                    </h2>
                </div >

                <div className="p-8 pt-4">
                    {isVerificationSent ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-white/10 text-[var(--blaze-neon)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--blaze-neon)]/30">
                                <Mail className="w-8 h-8 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Verifica tu correo</h3>
                            <p className="text-white/80 mb-6 text-sm">Hemos enviado un enlace de activación a <br /><strong>{email}</strong>.</p>
                            <button onClick={toggleMode} className="text-[var(--blaze-neon)] font-bold hover:underline text-sm uppercase tracking-wider">
                                Volver al inicio
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Google Button */}
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full h-12 flex items-center justify-center gap-3 bg-white text-[var(--text-main)] font-black uppercase tracking-wider rounded-xl hover:bg-gray-100 transition-all mb-6 group shadow-lg"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                                <span>Continuar con Google</span>
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
                            </button>

                            <div className="relative flex items-center justify-center mb-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                <span className="relative bg-[rgba(0,119,190,0.9)] px-3 text-[10px] text-white/50 uppercase font-black tracking-widest">o con tu correo</span>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-white text-xs font-bold text-center animate-shake backdrop-blur-sm">
                                        {error}
                                    </div>
                                )}

                                {mode === 'register' && (
                                    <div className="space-y-1">
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                            <input
                                                type="text"
                                                placeholder="Nombre de Usuario"
                                                className="w-full bg-black/20 border border-white/10 rounded-xl h-12 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[var(--blaze-neon)] focus:bg-black/30 transition-all placeholder:text-white/30 font-medium"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                        <input
                                            type="email"
                                            placeholder="Correo Electrónico"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl h-12 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[var(--blaze-neon)] focus:bg-black/30 transition-all placeholder:text-white/30 font-medium"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                        <input
                                            type="password"
                                            placeholder="Contraseña"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl h-12 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[var(--blaze-neon)] focus:bg-black/30 transition-all placeholder:text-white/30 font-medium"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-wood w-full h-12 mt-4 text-white font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {mode === 'login' ? 'Entrar' : 'Registrarme'}
                                </button>
                            </form>

                            {/* Footer Toggle */}
                            <div className="mt-6 text-center">
                                <p className="text-white/50 text-xs font-medium">
                                    {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                                    <button
                                        onClick={toggleMode}
                                        className="ml-2 text-[var(--zoin-gold)] font-black hover:underline uppercase tracking-wide"
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
