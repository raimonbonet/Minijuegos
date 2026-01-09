import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import RegisterModal from '../components/RegisterModal';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            localStorage.setItem('token', data.access_token);
            navigate('/dashboard');
        } catch (error: any) {
            alert(error.message || 'Error en el inicio de sesión');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:3000/auth/google';
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 relative">
            {/* Background Glows (Auth Specific) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>

            <div className="glass-card w-full max-w-[440px] animate-in shadow-2xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                        Iniciar <span className="text-indigo-500">Sesión</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-wide">INTRODUCE TUS CREDENCIALES DE ACCESO</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
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
                            ENTRAR AL SISTEMA
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>

                <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                        <span className="bg-[#121626] px-4 text-slate-500">O acceder con</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="btn-google h-[56px]"
                >
                    <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google" />
                    <span>ACCESO CON GOOGLE</span>
                </button>

                <div className="mt-12 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                    <p className="text-slate-400 text-sm font-medium mb-4">
                        ¿Aún no tienes cuenta registrada?
                    </p>
                    <button
                        onClick={() => setIsRegisterOpen(true)}
                        className="btn-primary-ghost w-full py-3 inline-block text-indigo-400 font-black uppercase tracking-widest text-xs hover:bg-indigo-500/10 rounded-xl transition-all border border-indigo-500/20 bg-transparent cursor-pointer"
                    >
                        SOLICITAR ACCESO / REGISTRO
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
