import React from 'react';
import { Zap, Trophy, Crown } from 'lucide-react';

export type MembershipType = 'FREE' | 'STARTER' | 'PRO' | 'LEGENDARY';

interface MembershipBadgeProps {
    type: MembershipType;
    className?: string;
    size?: number;
}

export const MembershipBadge: React.FC<MembershipBadgeProps> = ({ type, className = '', size = 12 }) => {
    switch (type) {
        case 'STARTER':
            return (
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-[8px] uppercase tracking-widest ${className}`}>
                    <Zap size={size} strokeWidth={3} />
                    <span>STARTER</span>
                </div>
            );
        case 'PRO':
            return (
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black text-[8px] uppercase tracking-widest ${className}`}>
                    <Trophy size={size} strokeWidth={3} />
                    <span>PRO</span>
                </div>
            );
        case 'LEGENDARY':
            return (
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black text-[8px] uppercase tracking-widest animate-pulse ${className}`}>
                    <Crown size={size} strokeWidth={3} />
                    <span>LEGENDARY</span>
                </div>
            );
        default:
            return null;
    }
};

export const MembershipIcon: React.FC<{ type: MembershipType; size?: number }> = ({ type, size = 14 }) => {
    switch (type) {
        case 'STARTER':
            return <Zap size={size} className="text-indigo-400" strokeWidth={3} />;
        case 'PRO':
            return <Trophy size={size} className="text-purple-400" strokeWidth={3} />;
        case 'LEGENDARY':
            return <Crown size={size} className="text-amber-400" strokeWidth={3} />;
        default:
            return null;
    }
};
