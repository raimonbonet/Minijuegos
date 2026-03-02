import { useState } from 'react';
import { apiRequest } from '../lib/api';

export default function ContactPage() {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!subject.trim() || !message.trim()) {
            setStatus('error');
            setErrorMessage('Por favor, completa todos los campos.');
            return;
        }

        try {
            setStatus('loading');
            await apiRequest('/notifications/support', {
                method: 'POST',
                body: JSON.stringify({ subject, message })
            });
            setStatus('success');
            setSubject('');
            setMessage('');
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message || 'Error al enviar el mensaje. Inténtalo de nuevo.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl text-[var(--text-primary)]">
            <h1 className="text-3xl font-bold mb-4 text-[var(--primary)] text-center">Contacto / Soporte</h1>
            <p className="text-[var(--text-secondary)] text-center mb-8">
                ¿Tienes algún problema o sugerencia? Envíanos un mensaje y nuestro equipo te responderá lo antes posible.
            </p>

            <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-20"></div>

                {status === 'success' && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center font-medium">
                        ¡Mensaje enviado con éxito! Te contactaremos pronto.
                    </div>
                )}

                {status === 'error' && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center font-medium">
                        {errorMessage}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                            Asunto
                        </label>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Ej. Problema con mi suscripción"
                            className="w-full bg-[var(--bg-deep)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                            disabled={status === 'loading'}
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                            Mensaje
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe tu problema o sugerencia en detalle..."
                            rows={6}
                            className="w-full bg-[var(--bg-deep)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-y"
                            disabled={status === 'loading'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="btn-wood w-full py-3 px-4 text-white font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {status === 'loading' ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : 'Enviar Mensaje'}
                    </button>
                </div>
            </form>
        </div>
    );
}
