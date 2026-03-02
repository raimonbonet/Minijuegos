import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, X, Loader2 } from 'lucide-react';
import { apiRequest, API_URL } from '../lib/api';

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
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
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
                    body: JSON.stringify({ email, password, username: name, origin: window.location.origin }),
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
        if (mode === 'register' && (!acceptedTerms || !acceptedPrivacy)) {
            setError('Debes aceptar las políticas de privacidad y los términos y condiciones para continuar con Google.');
            return;
        }
        window.location.href = `${API_URL}/auth/google`;
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
            <div className="relative w-full max-w-[420px] bg-[var(--bg-deep)] border-4 border-wood rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[var(--text-main)] hover:text-red-500 transition-colors z-10 p-1 bg-white/50 rounded-full"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header Section */}
                <div className="relative pt-8 pb-4 px-8 flex flex-col items-center justify-center bg-wood border-b-4 border-black/10">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    <h2 className="relative z-10 text-3xl font-black uppercase italic text-white drop-shadow-md tracking-tight text-center w-full">
                        {isVerificationSent ? '¡Casi listo!' : (mode === 'login' ? 'Bienvenido' : 'Registro')}
                    </h2>
                </div>

                <div className="p-8 pt-6">
                    {isVerificationSent ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-[var(--kai-green)]/10 text-[var(--kai-green)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--kai-green)]/30">
                                <Mail className="w-8 h-8 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Verifica tu correo</h3>
                            <p className="text-[var(--text-secondary)] mb-6 text-sm">Hemos enviado un enlace de activación a <br /><strong>{email}</strong>.</p>
                            <button onClick={toggleMode} className="text-[var(--blaze-neon)] font-bold hover:underline text-sm uppercase tracking-wider">
                                Volver al inicio
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Google Button */}
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full h-12 flex items-center justify-center gap-3 bg-white text-[var(--text-main)] font-black uppercase tracking-wider rounded-xl hover:bg-gray-50 transition-all mb-6 group shadow-md border-2 border-gray-200"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                                <span>{mode === 'login' ? 'Acceder con Google' : 'Registrarse con Google'}</span>
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
                            </button>

                            <div className="relative flex items-center justify-center mb-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--glass-border)]"></div></div>
                                <span className="relative bg-[var(--bg-deep)] px-3 text-[10px] text-[var(--text-secondary)] uppercase font-black tracking-widest">o con tu correo</span>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-red-600 text-xs font-bold text-center animate-shake">
                                        {error}
                                    </div>
                                )}

                                {mode === 'register' && (
                                    <div className="space-y-1">
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                            <input
                                                type="text"
                                                placeholder="Nombre de Usuario"
                                                className="w-full bg-white border border-[var(--glass-border)] rounded-xl h-12 pl-10 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all font-medium shadow-sm"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                        <input
                                            type="email"
                                            placeholder="Correo Electrónico"
                                            className="w-full bg-white border border-[var(--glass-border)] rounded-xl h-12 pl-10 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all font-medium shadow-sm"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                        <input
                                            type="password"
                                            placeholder="Contraseña"
                                            className="w-full bg-white border border-[var(--glass-border)] rounded-xl h-12 pl-10 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all font-medium shadow-sm"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {mode === 'register' && (
                                    <div className="space-y-3 mt-4 text-sm text-[var(--text-secondary)]">
                                        <label className="flex items-start gap-2 cursor-pointer group">
                                            <div className="relative flex items-center pt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={acceptedPrivacy}
                                                    onChange={(e) => {
                                                        setAcceptedPrivacy(e.target.checked);
                                                        if (error) setError(null);
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-300 bg-white text-[var(--kai-green)] focus:ring-[var(--kai-green)] focus:ring-offset-0 cursor-pointer"
                                                />
                                            </div>
                                            <span className="leading-tight text-xs group-hover:text-[var(--text-main)] transition-colors">
                                                He leído y acepto las{' '}
                                                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--kai-green)] hover:underline font-bold">
                                                    Políticas de Privacidad
                                                </a>.
                                            </span>
                                        </label>

                                        <label className="flex items-start gap-2 cursor-pointer group">
                                            <div className="relative flex items-center pt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={acceptedTerms}
                                                    onChange={(e) => {
                                                        setAcceptedTerms(e.target.checked);
                                                        if (error) setError(null);
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-300 bg-white text-[var(--kai-green)] focus:ring-[var(--kai-green)] focus:ring-offset-0 cursor-pointer"
                                                />
                                            </div>
                                            <span className="leading-tight text-xs group-hover:text-[var(--text-main)] transition-colors">
                                                He leído y acepto los{' '}
                                                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[var(--kai-green)] hover:underline font-bold">
                                                    Términos y Condiciones
                                                </a>.
                                            </span>
                                        </label>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || (mode === 'register' && (!acceptedTerms || !acceptedPrivacy))}
                                    className={`btn-wood w-full h-12 mt-4 text-white font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${loading || (mode === 'register' && (!acceptedTerms || !acceptedPrivacy)) ? 'opacity-50 cursor-not-allowed scale-100' : 'hover:scale-[1.02] active:scale-95'}`}
                                >
                                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {mode === 'login' ? 'Entrar' : 'Registrarme'}
                                </button>
                            </form>

                            {/* Footer Toggle */}
                            <div className="mt-6 text-center">
                                <p className="text-[var(--text-secondary)] text-xs font-medium">
                                    {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                                    <button
                                        onClick={toggleMode}
                                        className="ml-2 text-[var(--kai-green)] font-black hover:underline uppercase tracking-wide"
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
