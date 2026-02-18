import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { Trophy, Search, ChevronLeft, ChevronRight, Filter, ArrowLeft } from 'lucide-react';

interface Score {
    id: string;
    amount: number;
    game: string;
    createdAt: string;
    user: {
        username: string;
        membership: string;
    };
}

export default function RankingPage() {
    const [scores, setScores] = useState<Score[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [gameFilter, setGameFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const limit = 20;

    const fetchScores = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(gameFilter && { game: gameFilter }),
                ...(searchTerm && { search: searchTerm }),
            });

            const response = await apiRequest(`/scores/public?${queryParams}`);
            setScores(response.data);
            setTotalPages(response.meta.totalPages);
            setTotalItems(response.meta.total);
        } catch (error) {
            console.error('Error fetching rankings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScores();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, gameFilter]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on search
            fetchScores();
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setGameFilter(e.target.value);
        setPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-deep)] pb-32 pt-24 px-4">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-[var(--text-main)] uppercase italic tracking-tighter drop-shadow-sm flex items-center justify-center gap-3">
                        <Trophy className="w-10 h-10 text-[var(--zoin-gold)]" />
                        Ranking Absoluto
                    </h1>
                    <p className="text-[var(--text-main)]/70 font-bold">Los mejores jugadores de Zooplay</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-wider font-bold">
                        * Los premios se reparten el día 1 de cada mes
                    </p>
                </div>

                {/* Back Button */}
                <div className="flex justify-start">
                    <a href="/" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-white font-bold transition-colors group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Volver al Menú
                    </a>
                </div>

                {/* Filters */}
                <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">

                    {/* Game Filter */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="w-5 h-5 text-[var(--text-muted)]" />
                        <select
                            value={gameFilter}
                            onChange={handleGameChange}
                            className="bg-[var(--bg-deep)] text-[var(--text-main)] font-bold text-sm rounded-lg border border-[var(--text-main)]/10 px-3 py-2 outline-none focus:border-[var(--text-main)] transition-colors w-full md:w-48"
                        >
                            <option value="">Todos los Juegos</option>
                            <option value="neon-match">Neon Match</option>
                            {/* Add more games here as they are created */}
                        </select>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full bg-[var(--bg-deep)] text-[var(--text-main)] font-bold text-sm rounded-lg border border-[var(--text-main)]/10 pl-9 pr-3 py-2 outline-none focus:border-[var(--text-main)] transition-colors placeholder:text-[var(--text-muted)]/50"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/20 text-[var(--text-muted)] uppercase text-xs font-black tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Posición</th>
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Juego</th>
                                    <th className="px-6 py-4 text-right">Puntuación</th>
                                    <th className="px-6 py-4 text-right">Premio Est.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-muted)] font-bold animate-pulse">
                                            Cargando puntuaciones...
                                        </td>
                                    </tr>
                                ) : scores.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-muted)] font-bold">
                                            No se encontraron resultados
                                        </td>
                                    </tr>
                                ) : (
                                    scores.map((score, index) => {
                                        const globalIndex = ((page - 1) * limit) + index + 1;

                                        let effectiveRank = globalIndex;

                                        if (page === 1) {
                                            effectiveRank = scores.findIndex(s => s.amount === score.amount) + 1;
                                        }

                                        let reward = null;
                                        let rowClass = 'hover:bg-white/5 transition-colors';

                                        if (effectiveRank === 1) {
                                            reward = '3.00 Zoins';
                                            rowClass = 'bg-[var(--zoin-gold)]/20 hover:bg-[var(--zoin-gold)]/30 transition-colors border-l-4 border-[var(--zoin-gold)]';
                                        } else if (effectiveRank === 2) {
                                            reward = '1.00 Zoin';
                                            rowClass = 'bg-slate-400/20 hover:bg-slate-400/30 transition-colors border-l-4 border-slate-400';
                                        } else if (effectiveRank >= 3 && effectiveRank <= 5) {
                                            reward = '0.15 Zoins';
                                            rowClass = 'bg-amber-700/20 hover:bg-amber-700/30 transition-colors border-l-4 border-amber-700';
                                        }

                                        return (
                                            <tr key={score.id} className={rowClass}>
                                                <td className="px-6 py-4 font-black">
                                                    <span className={`${effectiveRank === 1 ? 'text-[var(--zoin-gold)] text-xl drop-shadow-sm' :
                                                        effectiveRank === 2 ? 'text-gray-300 text-lg' :
                                                            effectiveRank === 3 ? 'text-amber-600 text-lg' :
                                                                'text-[var(--text-muted)]'
                                                        }`}>
                                                        #{effectiveRank}
                                                        {effectiveRank === 1 && ' 👑'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-bold ${score.user.membership === 'PERLA' ? 'text-[var(--zoin-gold)]' : 'text-white'}`}>
                                                            {score.user.username}
                                                        </span>
                                                        {score.user.membership === 'PERLA' && (
                                                            <span className="text-[10px] bg-[var(--zoin-gold)] text-black font-black px-1.5 rounded ml-1">VIP</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-[var(--blaze-neon)] uppercase">
                                                    {score.game}
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-white text-lg">
                                                    {score.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-[var(--zoin-gold)] text-sm">
                                                    {reward && (
                                                        <span className="bg-[var(--zoin-gold)]/10 px-2 py-1 rounded border border-[var(--zoin-gold)]/20">
                                                            +{reward}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 bg-black/10 border-t border-white/5">
                        <div className="text-xs font-bold text-[var(--text-muted)]">
                            Mostrando {((page - 1) * limit) + 1}-{Math.min(page * limit, totalItems)} de {totalItems}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-white"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-white"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
