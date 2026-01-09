import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Mail, Lock, User, ArrowRight, X } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isVerificationSent, setIsVerificationSent] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, name }),
            });
            setIsVerificationSent(true);
        } catch (error: any) {
            alert(error.message || 'Error en el registro');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:3000/auth/google';
    };

    // Modal Content
    const modalContent = (
        <div className="modal-overlay">
            <div className="modal-content-wrapper">
                <div className="modal-card-solid">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="modal-close-btn"
                        type="button"
                    >
                        <X size={24} />
                    </button>

                    {isVerificationSent ? (
                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 mb-8">
                                <Mail className="w-12 h-12 text-indigo-400 animate-pulse" />
                            </div>
                            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                                Activar <span className="text-indigo-500">Cuenta</span>
                            </h2>
                            <p className="text-slate-400 font-medium text-lg mb-10">
                                Enlace enviado a <span className="text-white font-bold">{email}</span>.
                            </p>
                            <button onClick={onClose} className="btn-primary w-full py-5 text-lg">CERRAR Y ACCEDER</button>
                        </div>
                    ) : (
                        <>
                            <header style={{ textAlign: 'center', marginBottom: '48px' }}>
                                <h1 style={{
                                    fontSize: '52px',
                                    fontWeight: 900,
                                    color: '#6366f1',
                                    fontStyle: 'italic',
                                    textTransform: 'uppercase',
                                    letterSpacing: '-2px',
                                    display: 'inline-block',
                                    margin: 0
                                }}>
                                    Registro
                                </h1>
                                <div style={{
                                    height: '6px',
                                    width: '80px',
                                    backgroundColor: '#6366f1',
                                    margin: '12px auto 0',
                                    borderRadius: '99px',
                                    boxShadow: '0 0 15px rgba(99, 102, 241, 0.6)'
                                }} />
                            </header>

                            <form onSubmit={handleRegister}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div className="space-y-2">
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">
                                            <User size={14} strokeWidth={3} />
                                            <span>Usuario</span>
                                        </div>
                                        <input
                                            type="text"
                                            className="input-field h-16"
                                            placeholder="Tu nombre público"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">
                                            <Mail size={14} strokeWidth={3} />
                                            <span>Email</span>
                                        </div>
                                        <input
                                            type="email"
                                            className="input-field h-16"
                                            placeholder="correo@ejemplo.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">
                                            <Lock size={14} strokeWidth={3} />
                                            <span>Contraseña</span>
                                        </div>
                                        <input
                                            type="password"
                                            className="input-field h-16"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: '48px' }}>
                                    <button type="submit" disabled={loading} className="btn-primary w-full group py-5 shadow-2xl">
                                        <span className="font-black tracking-widest uppercase italic text-base">
                                            {loading ? 'Procesando...' : 'CREAR MI CUENTA'}
                                        </span>
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </form>

                            <div style={{ position: 'relative', margin: '48px 0' }}>
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }} />
                                </div>
                                <div style={{
                                    position: 'relative',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    fontStyle: 'italic'
                                }}>
                                    <span style={{ backgroundColor: '#1a1f33', padding: '0 16px', color: '#475569' }}>O Registrar con</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                type="button"
                                className="btn-google h-16 bg-white/5 hover:bg-white/10"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                <span className="font-bold tracking-widest uppercase italic">Registro con Google ID</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
