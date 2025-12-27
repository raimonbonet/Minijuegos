import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isVerificationSent, setIsVerificationSent] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, name }),
            });
            setIsVerificationSent(true);
        } catch (error: any) {
            alert(error.message || 'Error en el registro');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:3000/auth/google';
    };

    if (isVerificationSent) {
        return (
            <div className="flex-1 flex items-center justify-center p-6 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>
                <div className="glass-card w-full max-w-[440px] text-center animate-in shadow-2xl">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 mb-8">
                        <Mail className="w-10 h-10 text-indigo-400 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
                        Activar <span className="text-indigo-500">Cuenta</span>
                    </h2>
                    <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                        Hemos enviado un enlace a <span className="text-white font-bold">{email}</span>.
                        Valida tu correo para finalizar el proceso.
                    </p>
                    <Link to="/login" className="btn-primary w-full">
                        VOLVER AL ACCESO
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex items-center justify-center p-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>

            <div className="glass-card w-full max-w-[440px] animate-in shadow-2xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                        Crear <span className="text-indigo-500">Cuenta</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-wide">REGISTRA TUS DATOS EN EL SISTEMA</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] pl-1">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400/50" />
                            <input
                                type="text"
                                className="input-field pl-14"
                                placeholder="Escribe tu nombre..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] pl-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400/50" />
                            <input
                                type="email"
                                className="input-field pl-14"
                                placeholder="correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] pl-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400/50" />
                            <input
                                type="password"
                                className="input-field pl-14"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="btn-primary w-full group py-5 h-auto text-base">
                            CONFIRMAR REGISTRO
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>

                <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                        <span className="bg-[#121626] px-4 text-slate-500">O registrarse con</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full h-[60px] rounded-16 bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-white font-black text-sm hover:bg-white/10 hover:border-indigo-500/50 hover:text-indigo-400 transition-all duration-300"
                    style={{ borderRadius: '16px' }}
                >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale opacity-70" />
                    REGISTRO CON GOOGLE
                </button>

                <p className="mt-12 text-center text-slate-500 font-medium">
                    ¿Ya eres miembro?{' '}
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-widest text-xs hover:underline underline-offset-8 transition-all">
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}
