import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import {
    User as UserIcon,
    Calendar,
    CreditCard,
    ArrowRight,
    Gamepad2,
    CheckCircle
} from 'lucide-react';

export default function CompleteProfilePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showWelcome, setShowWelcome] = useState(false);
    const [userName, setUserName] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        dni: '',
        fechaNacimiento: '',
        sexo: 'M',
        affiliateName: ''
    });

    useEffect(() => {
        const initVerification = async () => {
            // Check for token in URL (from email link or Google OAuth)
            const searchParams = new URLSearchParams(window.location.search);
            const urlToken = searchParams.get('token');

            if (urlToken) {
                console.log('DEBUG: Found token in URL:', urlToken);

                // Try to decode the token to check if it's a Google OAuth token (already a session JWT)
                // Google OAuth tokens are session JWTs, email verification tokens need to be verified
                try {
                    const tokenPayload = JSON.parse(atob(urlToken.split('.')[1]));

                    // If token has 'sub' (user ID), it's a session JWT from Google OAuth
                    if (tokenPayload.sub && !tokenPayload.type) {
                        console.log('DEBUG: Google OAuth session token detected');
                        localStorage.setItem('token', urlToken);
                        window.history.replaceState({}, document.title, window.location.pathname);
                        setMessage({ type: 'success', text: '¡Bienvenido! Completa tu perfil para continuar.' });
                        return;
                    }
                } catch (e) {
                    // If decode fails, treat as verification token
                }

                // Otherwise, it's an email verification token - verify with backend
                try {
                    setLoading(true);
                    const data = await apiRequest('/auth/verify', {
                        method: 'POST',
                        body: JSON.stringify({ token: urlToken })
                    });
                    console.log('DEBUG: Verification response:', data);

                    if (data.access_token) {
                        localStorage.setItem('token', data.access_token);
                        window.history.replaceState({}, document.title, window.location.pathname);
                        setMessage({ type: 'success', text: '¡Cuenta verificada! Completa tu perfil ahora.' });
                    }
                } catch (err: any) {
                    setMessage({ type: 'error', text: 'Enlace de verificación inválido o expirado' });
                    setTimeout(() => navigate('/login'), 3000);
                } finally {
                    setLoading(false);
                }
            }
            // If no URL token, user is already authenticated (route is protected)
        };

        initVerification();
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await apiRequest('/auth/complete-profile', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            // Show welcome message
            setUserName(formData.nombre);
            setShowWelcome(true);

            // Auto-redirect to dashboard after 3 seconds
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error al guardar los datos' });
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
                    <h1 className="text-3xl font-bold tracking-tight">Completar Perfil</h1>
                    <p className="text-slate-400 mt-2">
                        Solo unos datos más para terminar el registro
                    </p>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`px-8 py-3 text-sm text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                        {message.text}
                    </div>
                )}

                {/* Welcome Message */}
                {showWelcome ? (
                    <div className="p-8 text-center space-y-6 animate-in">
                        <div className="flex justify-center">
                            <CheckCircle className="w-20 h-20 text-green-400 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-white">
                                ¡Bienvenido, {userName}! 🎉
                            </h2>
                            <p className="text-slate-400 text-lg">
                                Tu perfil ha sido completado exitosamente
                            </p>
                        </div>
                        <div className="pt-4">
                            <p className="text-sm text-slate-500 mb-4">
                                Serás redirigido al dashboard en unos segundos...
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                Ir al Dashboard ahora
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Form */
                    <form onSubmit={handleSubmit} className="p-8 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <UserIcon className="w-3 h-3" /> Nombre
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    required
                                    className="input-field"
                                    placeholder="Ej: Juan"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    Apellidos
                                </label>
                                <input
                                    type="text"
                                    name="apellidos"
                                    required
                                    className="input-field"
                                    placeholder="Ej: Pérez"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <CreditCard className="w-3 h-3" /> DNI
                                </label>
                                <input
                                    type="text"
                                    name="dni"
                                    required
                                    className="input-field"
                                    placeholder="12345678X"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> F. Nacimiento
                                </label>
                                <input
                                    type="date"
                                    name="fechaNacimiento"
                                    required
                                    className="input-field"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sexo</label>
                            <select name="sexo" className="input-field" onChange={handleChange} value={formData.sexo}>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                                <option value="O">Otro</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Nombre de Afiliado (Opcional)
                            </label>
                            <input
                                type="text"
                                name="affiliateName"
                                className="input-field"
                                placeholder="Si vienes recomendado"
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
                            {loading ? 'Guardando...' : 'Finalizar Registro'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
