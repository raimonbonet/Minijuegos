
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
                    scores.map((score, index) => {
                        // Calculate Effective Rank (Handling Ties)
                        // If same score as previous, use previous's rank (which is found by looking for the first index of that score)
                        const sameAsPrev = index > 0 && score.amount === scores[index - 1].amount;
                        const effectiveRank = sameAsPrev ?
                            (scores.findIndex(s => s.amount === score.amount) + 1) :
                            (index + 1);

                        let rowClass = 'bg-white/5 border-white/5';
                        let rankColor = 'text-white/30';
                        let rewardText = null;

                        if (effectiveRank === 1) {
                            rowClass = 'bg-[var(--zoin-gold)]/20 border-[var(--zoin-gold)]/30';
                            rankColor = 'text-[var(--zoin-gold)]';
                            rewardText = '+3.00 Zoins';
                        } else if (effectiveRank === 2) {
                            rowClass = 'bg-slate-400/20 border-slate-400/30';
                            rankColor = 'text-slate-300';
                            rewardText = '+1.00 Zoin';
                        } else if (effectiveRank >= 3 && effectiveRank <= 5) {
                            rowClass = 'bg-amber-700/20 border-amber-700/30';
                            rankColor = 'text-amber-500';
                            rewardText = '+0.15 Zoins';
                        }

                        return (
                            <div key={index} className={`flex items-center justify-between p-2 rounded-lg border transition-all ${rowClass}`}>
                                <div className="flex items-center gap-3">
                                    {/* Rank */}
                                    <span className={`text-xs font-black w-4 text-center ${rankColor}`}>
                                        #{effectiveRank}
                                    </span>

                                    {/* User */}
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-bold text-white leading-none">
                                                {score.user.username || score.user.nombre || score.user.email.split('@')[0]}
                                            </span>
                                            <MembershipIcon type={score.user.membership} />
                                        </div>
                                        {rewardText && (
                                            <span className={`text-[9px] font-black uppercase tracking-wider ${rankColor}`}>
                                                {rewardText}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Score */}
                                <span className="text-sm font-mono font-black text-white tracking-tight">
                                    {score.amount.toLocaleString()}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer decoration */}
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>
    );
}
