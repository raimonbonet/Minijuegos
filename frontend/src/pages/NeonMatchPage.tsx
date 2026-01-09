import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Timer, Trophy } from 'lucide-react';

const width = 8;
const candyColors = [
    '#ef4444', // Red-500
    '#3b82f6', // Blue-500
    '#22c55e', // Green-500
    '#a855f7', // Purple-500
    '#f59e0b', // Amber-500
];

const NeonMatchPage = () => {
    const navigate = useNavigate();
    const [currentColorArrangement, setCurrentColorArrangement] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isGameOver, setIsGameOver] = useState(false);
    const [selectedPiece, setSelectedPiece] = useState<number | null>(null);

    // --- Helper Logic (Immutable) ---

    // Returns { newBoard, scoreIncrease } or null if no matches
    const getBoardAfterMatches = (board: string[]): { newBoard: string[], scoreIncrease: number } | null => {
        let matchedIndices = new Set<number>();

        // Check Rows
        for (let i = 0; i < 64; i++) {
            if (i % width > width - 3) continue; // Skip end of rows

            const row = [i, i + 1, i + 2];
            const color = board[i];

            if (!color) continue;

            if (row.every(idx => board[idx] === color)) {
                let matchLength = 3;
                while ((i + matchLength) % width !== 0 && board[i + matchLength] === color) {
                    row.push(i + matchLength);
                    matchLength++;
                }
                row.forEach(idx => matchedIndices.add(idx));
            }
        }

        // Check Columns
        for (let i = 0; i <= 47; i++) {
            const col = [i, i + width, i + width * 2];
            const color = board[i];

            if (!color) continue;

            if (col.every(idx => board[idx] === color)) {
                let matchLength = 3;
                while (i + width * matchLength < 64 && board[i + width * matchLength] === color) {
                    col.push(i + width * matchLength);
                    matchLength++;
                }
                col.forEach(idx => matchedIndices.add(idx));
            }
        }

        if (matchedIndices.size > 0) {
            const newBoard = [...board];
            matchedIndices.forEach(idx => {
                newBoard[idx] = ''; // Clear matched pieces
            });
            // Score: 10 base + bonus for extra
            const scoreIncrease = matchedIndices.size * 10;
            return { newBoard, scoreIncrease };
        }

        return null;
    };

    const getBoardAfterGravity = (board: string[]): string[] => {
        const newBoard = [...board];
        let movesMade = false;

        for (let i = 0; i <= 55; i++) {
            const firstRow = [0, 1, 2, 3, 4, 5, 6, 7];
            const isFirstRow = firstRow.includes(i);

            if (isFirstRow && newBoard[i] === '') {
                newBoard[i] = candyColors[Math.floor(Math.random() * candyColors.length)];
                movesMade = true;
            }

            if ((newBoard[i + width]) === '') {
                newBoard[i + width] = newBoard[i];
                newBoard[i] = '';
                movesMade = true;
            }
        }
        return newBoard;
    };

    // --- Life Cycle ---

    const createBoard = () => {
        const randomColorArrangement = [];
        for (let i = 0; i < width * width; i++) {
            const randomColor = candyColors[Math.floor(Math.random() * candyColors.length)];
            randomColorArrangement.push(randomColor);
        }
        setCurrentColorArrangement(randomColorArrangement);
    };

    useEffect(() => {
        createBoard();
    }, []);

    // Game Loop (Gravity & Passive Matching)
    useEffect(() => {
        if (isGameOver) return;

        const timer = setInterval(() => {
            setCurrentColorArrangement(currentBoard => {
                // 1. Try Gravity
                const gravityBoard = getBoardAfterGravity(currentBoard);

                // 2. Try Matches on result
                const matchResult = getBoardAfterMatches(gravityBoard);

                if (matchResult) {
                    setScore(s => s + matchResult.scoreIncrease);
                    return matchResult.newBoard;
                }

                return gravityBoard; // If no matches, just return gravity result (or same board if stable)
            });
        }, 100);

        return () => clearInterval(timer);
    }, [isGameOver]);

    // Timer
    useEffect(() => {
        if (isGameOver) return;
        const countdown = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setIsGameOver(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(countdown);
    }, [isGameOver]);


    // --- Interaction ---

    const handlePieceClick = (index: number) => {
        if (isGameOver) return;

        if (selectedPiece === null) {
            setSelectedPiece(index);
        } else {
            // Check adjacency
            const isAdjacent = [
                selectedPiece - 1,
                selectedPiece + 1,
                selectedPiece - width,
                selectedPiece + width
            ].includes(index);

            if (isAdjacent) {
                // 1. Create swapped board
                const tempBoard = [...currentColorArrangement];
                const temp = tempBoard[index];
                tempBoard[index] = tempBoard[selectedPiece];
                tempBoard[selectedPiece] = temp;

                // 2. Check Valid
                const matchResult = getBoardAfterMatches(tempBoard);

                if (matchResult) {
                    // Valid Move!
                    // Apply the Cleared Board (not just the swapped one)
                    setCurrentColorArrangement(matchResult.newBoard);
                    setScore(s => s + matchResult.scoreIncrease);
                } else {
                    // Invalid - Flash error or just do nothing (swap back is automatic because we never set state)
                    // Optional: Visual shake effect
                }
            }
            setSelectedPiece(null);
        }
    };

    const handleFinish = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience - Reduced opacity */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#3b82f6_0%,_transparent_60%)] opacity-5 blur-3xl" />

            {/* Header */}
            <div className="w-full max-w-md flex items-center justify-between mb-8 z-10">
                <button onClick={() => navigate('/')} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">
                    Neon Match
                </h1>
                <div className="w-10" />
            </div>

            {/* Stats */}
            <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-8 z-10">
                <div className="bg-[#1a1a1e] border border-white/10 rounded-xl p-4 flex flex-col items-center shadow-lg">
                    <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider mb-1">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        Puntuación
                    </div>
                    <span className="text-3xl font-black text-white font-mono">{score}</span>
                </div>
                <div className={`bg-[#1a1a1e] border rounded-xl p-4 flex flex-col items-center shadow-lg ${timeLeft < 10 ? 'border-red-500/50 animate-pulse' : 'border-white/10'}`}>
                    <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider mb-1">
                        <Timer className="w-4 h-4 text-blue-400" />
                        Tiempo
                    </div>
                    <span className={`text-3xl font-black font-mono ${timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
                        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </span>
                </div>
            </div>

            {/* Board */}
            <div className="relative z-10">
                <div className="w-[340px] h-[340px] bg-black/60 rounded-2xl border border-white/10 p-2 shadow-2xl flex flex-wrap backdrop-blur-sm">
                    {currentColorArrangement.map((candyColor, index) => (
                        <div
                            key={index}
                            className={`w-[40px] h-[40px] rounded-lg cursor-pointer transition-all duration-150 flex items-center justify-center
                                ${selectedPiece === index ? 'scale-90 ring-2 ring-white z-20 brightness-110' : 'hover:scale-105 hover:brightness-105'}
                            `}
                            style={{
                                backgroundColor: candyColor,
                                boxShadow: candyColor ? `0 0 10px ${candyColor}40` : 'none',
                                opacity: candyColor === '' ? 0 : 1,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                            onClick={() => handlePieceClick(index)}
                        >
                            <div className="w-full h-full rounded-md bg-gradient-to-br from-white/20 to-transparent" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Game Over */}
            {isGameOver && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#121214] border border-blue-500/30 w-full max-w-sm rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(59,130,246,0.2)] relative overflow-hidden">
                        <h2 className="text-4xl font-black italic uppercase text-white mb-2 drop-shadow-md">¡Tiempo Agotado!</h2>
                        <p className="text-white/60 mb-8">La partida ha terminado.</p>

                        <div className="bg-black/40 rounded-xl p-6 mb-8 border border-white/5">
                            <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-2">Puntuación Final</p>
                            <p className="text-5xl font-black text-white mb-4">{score}</p>
                            <div className="h-px w-full bg-white/10 mb-4" />
                            <div className="flex items-center justify-center gap-2 text-[var(--zoin-gold)]">
                                <img src="/zoins_icon.jpg" className="w-6 h-6 rounded-full" />
                                <span className="text-xl font-black">+{Math.floor(score / 100)} Zoins</span>
                            </div>
                        </div>

                        <button
                            onClick={handleFinish}
                            className="w-full bg-blue-600/20 border border-blue-500/50 text-blue-400 font-black uppercase py-4 rounded-xl hover:bg-blue-600/30 transition-all active:scale-95"
                        >
                            Volver al Menu
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NeonMatchPage;
