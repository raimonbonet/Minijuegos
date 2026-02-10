
import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { Shield, Crown } from 'lucide-react';

interface Score {
    amount: number;
    user: {
        nombre: string | null;
        username: string | null;
        email: string;
        membership: 'FREE' | 'STARTER' | 'PRO' | 'LEGENDARY';
    };
}

const MembershipIcon = ({ type }: { type: Score['user']['membership'] }) => {
    switch (type) {
        case 'LEGENDARY':
            return <Crown className="w-3 h-3 text-yellow-400 drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" />;
        case 'PRO':
            return <Shield className="w-3 h-3 text-[var(--blaze-neon)] drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />;
        case 'STARTER':
            return <Shield className="w-3 h-3 text-gray-400" />;
        default:
            return null;
    }
};

export default function Leaderboard({ game = 'neon-match' }: { game?: string }) {
    const [scores, setScores] = useState<Score[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const data = await apiRequest(`/scores/top/${game}`);
                setScores(data);
            } catch (e) {
                console.error("Failed to load leaderboard", e);
            } finally {
                setLoading(false);
            }
        };
        fetchScores();

        // Refresh every minute
        const interval = setInterval(fetchScores, 60000);
        return () => clearInterval(interval);
    }, [game]);

    return (
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-full h-full flex flex-col shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                <Crown className="w-5 h-5 text-[var(--zoin-gold)] animate-pulse" />
                <h3 className="text-sm font-black uppercase italic text-white tracking-widest">Top Mes</h3>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {loading ? (
                    <div className="text-white/30 text-xs text-center p-4">Cargando...</div>
                ) : scores.length === 0 ? (
                    <div className="text-white/30 text-xs text-center p-4">Sin puntuaciones aún.</div>
                ) : (
                    scores.map((score, index) => (
                        <div key={index} className={`flex items-center justify-between p-2 rounded-lg border transition-all ${index === 0 ? 'bg-[var(--zoin-gold)]/10 border-[var(--zoin-gold)]/30' : 'bg-white/5 border-white/5'}`}>
                            <div className="flex items-center gap-3">
                                {/* Rank */}
                                <span className={`text-xs font-black w-4 text-center ${index === 0 ? 'text-[var(--zoin-gold)]' : 'text-white/30'}`}>
                                    #{index + 1}
                                </span>

                                {/* User */}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-bold text-white leading-none">
                                            {score.user.username || score.user.nombre || score.user.email.split('@')[0]}
                                        </span>
                                        <MembershipIcon type={score.user.membership} />
                                    </div>
                                    {index === 0 && <span className="text-[9px] text-[var(--zoin-gold)] font-black uppercase tracking-wider">Líder</span>}
                                </div>
                            </div>

                            {/* Score */}
                            <span className="text-sm font-mono font-black text-white tracking-tight">
                                {score.amount.toLocaleString()}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Footer decoration */}
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>
    );
}
