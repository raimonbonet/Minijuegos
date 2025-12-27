import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { Mail, Lock, User as UserIcon, ArrowRight, Gamepad2 } from 'lucide-react';

export default function RegisterPage() {
    const navigate = useNavigate();
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            setMessage({
                type: 'success',
                text: '¡Registro exitoso! Revisa tu correo para verificar tu cuenta.'
            });

            // Clear form
            setFormData({ username: '', email: '', password: '' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error en el registro' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg px-4 animate-in">
            <div className="glass-card overflow-hidden">
                <div className="p-8 text-center bg-white/5 border-b border-white/10">
                    <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
                    <h1 className="text-3xl font-bold tracking-tight">Crear Cuenta</h1>
                    <p className="text-slate-400 mt-2">Únete a la comunidad de jugadores</p>
                </div>

                {message.text && (
                    <div className={`px-8 py-3 text-sm text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleRegister} className="p-8 space-y-5">
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
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

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
                            value={formData.email}
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
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
                        {loading ? 'Procesando...' : 'Registrarse'}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-900 px-2 text-slate-400">o continúa con</span>
                        </div>
                    </div>

                    {/* Google OAuth Button */}
                    <button
                        type="button"
                        onClick={() => window.location.href = 'http://localhost:3000/auth/google'}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar con Google
                    </button>
                </form>

                <div className="p-6 bg-white/5 border-t border-white/10 text-center">
                    <p className="text-sm text-slate-400">
                        ¿Ya tienes cuenta?
                        <button
                            onClick={() => navigate('/login')}
                            className="ml-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                        >
                            Inicia sesión
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
