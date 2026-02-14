
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Check, X, Crown, Star, Sun, Shield } from 'lucide-react';
import { apiRequest } from '../lib/api';

export default function SubscriptionsPage() {
    const { user, refreshUser } = useOutletContext<any>();
    const navigate = useNavigate();

    const plans = [
        {
            id: 'FREE',
            name: 'Free',
            price: '0€',
            period: '/mes',
            icon: Sun,
            games: 3,
            features: [
                '3 Partidas diarias',
                'Acceso a juegos básicos',
                'Publicidad incluida',
                'Soporte estándar'
            ],
            color: 'text-[var(--text-main)]',
            bg: 'bg-white',
            border: 'border-[var(--text-main)]/20',
            button: 'bg-[var(--text-main)] text-white'
        },
        {
            id: 'PALMERA',
            name: 'Palmera',
            price: '4.99€',
            period: '/mes',
            icon: Star,
            games: 8,
            popular: false,
            features: [
                '8 Partidas diarias',
                'Sin publicidad',
                'Acceso a torneos básicos',
                'Soporte prioritario'
            ],
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            button: 'bg-emerald-600 text-white'
        },
        {
            id: 'CORAL',
            name: 'Coral',
            price: '9.99€',
            period: '/mes',
            icon: Crown,
            games: 15,
            popular: true,
            features: [
                '15 Partidas diarias',
                'Sin publicidad',
                'Acceso a todos los torneos',
                'Soporte VIP 24/7',
                'Badge exclusivo'
            ],
            color: 'text-[var(--blaze-neon)]',
            bg: 'bg-orange-50',
            border: 'border-[var(--blaze-neon)]',
            button: 'bg-[var(--blaze-neon)] text-white'
        },
        {
            id: 'PERLA',
            name: 'Perla',
            price: '19.99€',
            period: '/mes',
            icon: Shield,
            games: 25,
            popular: false,
            features: [
                '25 Partidas diarias',
                'Todas las ventajas Coral',
                'Multiplicador x1.5 Zoins',
                'Acceso anticipado a juegos',
                'Avatar exclusivo'
            ],
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            button: 'bg-purple-600 text-white'
        }
    ];

    const handleSubscribe = async (planId: string) => {
        // Placeholder for subscription logic
        alert(`Has seleccionado el plan ${planId}. Próximamente integración de pagos.`);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text-main)] p-4 md:p-8 pb-32">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

                {/* Header */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic text-[var(--text-main)] drop-shadow-sm">
                        Planes de <span className="text-[var(--zoin-gold)]">Membresía</span>
                    </h1>
                    <p className="text-[var(--text-main)]/80 font-bold text-lg">
                        Elige el plan que mejor se adapte a tu estilo de juego y desbloquea recompensas exclusivas.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                    {plans.map((plan) => {
                        const isCurrent = user?.membership === plan.id;
                        return (
                            <div
                                key={plan.id}
                                className={`
                                    relative p-6 rounded-3xl transition-all duration-300 transform hover:-translate-y-2
                                    ${plan.popular ? 'shadow-2xl scale-105 z-10' : 'shadow-xl hover:shadow-2xl'}
                                    ${plan.bg} border-2 ${plan.border}
                                `}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--zoin-gold)] text-[var(--text-main)] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-md whitespace-nowrap">
                                        Más Popular
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* Icon & Name */}
                                    <div className="flex items-center justify-between">
                                        <div className={`p-3 rounded-2xl bg-white/50 ${plan.color}`}>
                                            <plan.icon className="w-8 h-8" />
                                        </div>
                                        {isCurrent && (
                                            <span className="bg-[var(--text-main)] text-[var(--bg-deep)] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                                Actual
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className={`text-xl font-black uppercase italic ${plan.color}`}>{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-[var(--text-main)]">{plan.price}</span>
                                            <span className="text-[var(--text-main)]/60 font-bold text-sm">{plan.period}</span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px w-full bg-[var(--text-main)]/10" />

                                    {/* Features */}
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3">
                                            <div className="bg-emerald-100 p-1 rounded-full text-emerald-600">
                                                <Check className="w-3 h-3 stroke-[4]" />
                                            </div>
                                            <span className="font-bold text-sm text-[var(--text-main)]">
                                                <strong className="text-black">{plan.games}</strong> partidas diarias
                                            </span>
                                        </li>
                                        {plan.features.slice(1).map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-3">
                                                <div className="bg-emerald-100 p-1 rounded-full text-emerald-600">
                                                    <Check className="w-3 h-3 stroke-[4]" />
                                                </div>
                                                <span className="font-bold text-sm text-[var(--text-main)]/80">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Action Button */}
                                    <div className="pt-4">
                                        <button
                                            onClick={() => handleSubscribe(plan.id)}
                                            disabled={isCurrent}
                                            className={`
                                                w-full py-4 rounded-xl font-black uppercase tracking-wider text-sm transition-all shadow-lg
                                                ${isCurrent
                                                    ? 'bg-[var(--text-main)]/10 text-[var(--text-main)]/40 cursor-not-allowed'
                                                    : `${plan.button} hover:brightness-110 active:scale-95`
                                                }
                                            `}
                                        >
                                            {isCurrent ? 'Plan Actual' : 'Seleccionar Plan'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
