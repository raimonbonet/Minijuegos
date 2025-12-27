import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import {
    Mail,
    Lock,
    User as UserIcon,
    ArrowRight,
    Gamepad2
} from 'lucide-react';

export default function AuthPage() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (isLogin) {
                // Login
                const data = await apiRequest('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password
                    })
                });

                localStorage.setItem('token', data.access_token);

                // Check profile status
                const profile = await apiRequest('/auth/profile', { token: data.access_token });

                if (!profile.membership) {
                    navigate('/complete-profile');
                } else {
                    window.location.href = '/';
                }

            } else {
                // Register Step 1
                await apiRequest('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password
                    })
                });

                setMessage({
                    type: 'success',
                    text: '¡Cuenta creada! Hemos enviado un correo para completar tu registro.'
                });
                setIsLogin(true); // Switch to login view
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error en la autenticación' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg px-4 animate-in">
            <div className="glass-card overflow-hidden">
                {/* Header */}
                <div className="p-8 text-center bg-white/5 border-b border-white/10">
                    <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
                    <h1 className="text-3xl font-bold tracking-tight">MiniJuegos Pro</h1>
                    <p className="text-slate-400 mt-2">
                        {isLogin ? 'Inicia sesión para jugar' : 'Crea tu cuenta de jugador'}
                    </p>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`px-8 py-3 text-sm text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                        {message.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleAuth} className="p-8 space-y-5">
                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <UserIcon className="w-3 h-3" /> Usuario
                            </label>
                            <input
                                type="text"
                                name="username"
                                required
                                className="input-field"
                                placeholder="Ej: Gamer123"
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Mail className="w-3 h-3" /> Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="input-field"
                            placeholder="jugador@ejemplo.com"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Lock className="w-3 h-3" /> Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="input-field"
                            placeholder="••••••••"
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
                        {loading ? 'Procesando...' : isLogin ? 'Entrar' : 'Registrarse'}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>

                {/* Footer */}
                <div className="p-6 bg-white/5 border-t border-white/10 text-center">
                    <p className="text-sm text-slate-400">
                        {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                        >
                            {isLogin ? 'Crea una ahora' : 'Inicia sesión'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
