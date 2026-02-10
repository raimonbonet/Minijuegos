import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Timer, Trophy } from 'lucide-react';
import { apiRequest } from '../lib/api';
import Leaderboard from '../components/Leaderboard';

const width = 8;
const candyColors = [
    '#ef4444', // Red-500
    '#3b82f6', // Blue-500
    '#22c55e', // Green-500
    '#a855f7', // Purple-500
    '#f59e0b', // Amber-500
    '#ec4899', // Pink-500 (New color)
];

type FloatingText = {
    id: number;
    x: number; // percentage (0-100) relative to board
    y: number; // percentage (0-100) relative to board
    value: number;
};

const NeonMatchPage = () => {
    const navigate = useNavigate();
    const [currentColorArrangement, setCurrentColorArrangement] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

    // UseRef for reliable id generation in loop
    const nextIdRef = useRef(0);

    // --- Helper Logic (Immutable) ---

    const getBaseColor = (cell: string) => cell.split('|')[0];
    const isMultiplier = (cell: string) => cell.includes('|mul');

    // Returns { newBoard, scoreIncrease, matchCenters } or null if no matches
    const getBoardAfterMatches = (board: string[]): { newBoard: string[], scoreIncrease: number, matchCenters: { x: number, y: number }[] } | null => {
        let matchedIndices = new Set<number>();

        // Check Rows
        for (let i = 0; i < 64; i++) {
            if (i % width > width - 3) continue; // Skip end of rows

            const row = [i, i + 1, i + 2];
            const color = getBaseColor(board[i]);

            if (!color) continue;

            if (row.every(idx => getBaseColor(board[idx]) === color)) {
                let matchLength = 3;
                while ((i + matchLength) % width !== 0 && getBaseColor(board[i + matchLength]) === color) {
                    row.push(i + matchLength);
                    matchLength++;
                }
                row.forEach(idx => matchedIndices.add(idx));
            }
        }

        // Check Columns
        for (let i = 0; i <= 47; i++) {
            const col = [i, i + width, i + width * 2];
            const color = getBaseColor(board[i]);

            if (!color) continue;

            if (col.every(idx => getBaseColor(board[idx]) === color)) {
                let matchLength = 3;
                while (i + width * matchLength < 64 && getBaseColor(board[i + width * matchLength]) === color) {
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

            // Score Logic
            let scoreIncrease = matchedIndices.size * 10;

            // Check for multiplier
            let hasMultiplier = false;
            matchedIndices.forEach(idx => {
                if (isMultiplier(board[idx])) hasMultiplier = true;
            });

            if (hasMultiplier) scoreIncrease *= 10;

            // Calculate center of mass for all matched indices as a simple visual approximation
            let totalX = 0;
            let totalY = 0;
            matchedIndices.forEach(idx => {
                totalX += (idx % width);
                totalY += Math.floor(idx / width);
            });

            const centerX = (totalX / matchedIndices.size) * (100 / width) + (50 / width); // Center of block percent
            const centerY = (totalY / matchedIndices.size) * (100 / width) + (50 / width);

            return { newBoard, scoreIncrease, matchCenters: [{ x: centerX, y: centerY }] };
        }

        return null;
    };

    const getBoardAfterGravity = (board: string[]): string[] => {
        const newBoard = [...board];
        let moved = true;
        while (moved) {
            moved = false;
            for (let i = 55; i >= 0; i--) { // Iterate from bottom-up (above last row)
                // If current cell has a block and below is empty
                if (newBoard[i] !== '' && newBoard[i + width] === '') {
                    newBoard[i + width] = newBoard[i];
                    newBoard[i] = '';
                    moved = true;
                }
            }
        }

        // Refill top row if empty (after all gravity settled)
        // Actually, normal gravity fills top row one by one? 
        // If we want "instant fill", we should fill any empty space in top row
        for (let i = 0; i < width; i++) {
            if (newBoard[i] === '') {
                const baseColor = candyColors[Math.floor(Math.random() * candyColors.length)];
                const isLucky = Math.random() < 0.01;
                newBoard[i] = isLucky ? `${baseColor}|mul` : baseColor;
                // Important: If we fill the top, we should theoretically let it fall again?
                // But simplified: loop will catch it in next tick? 
                // No, we want instant.
                // So checking gravity again would be recursive. 
                // Let's just fill top and let next tick handle falling of NEW blocks if needed?
                // The user wants "caer de golpe".
            }
        }

        // Better Multi-pass approach for Refill + Fall:
        // 1. Drop existing blocks to bottom.
        // 2. Fill empty spaces at top? No, fill empty columns?
        // Standard approach:
        // For each column:
        //   Extract blocks.
        //   Fill remaining space with new randoms.
        //   Reconstruct column.

        for (let col = 0; col < width; col++) {
            let columnBlocks = [];
            for (let row = 0; row < width; row++) {
                const idx = row * width + col;
                if (newBoard[idx] !== '') {
                    columnBlocks.push(newBoard[idx]);
                }
            }

            // How many missing?
            const missing = width - columnBlocks.length;

            // Add new blocks at the START (top)
            const newBlocks = [];
            for (let k = 0; k < missing; k++) {
                const baseColor = candyColors[Math.floor(Math.random() * candyColors.length)];
                const isLucky = Math.random() < 0.01;
                newBlocks.push(isLucky ? `${baseColor}|mul` : baseColor);
            }

            // Final Column: NewBlocks + ExistingBlocks
            const fullColumn = [...newBlocks, ...columnBlocks];

            // Apply to board
            for (let row = 0; row < width; row++) {
                newBoard[row * width + col] = fullColumn[row];
            }
        }

        return newBoard;
    };

    // --- Life Cycle ---

    const createBoard = () => {
        const randomColorArrangement = [];
        for (let i = 0; i < width * width; i++) {
            const baseColor = candyColors[Math.floor(Math.random() * candyColors.length)];
            const isLucky = Math.random() < 0.01;
            randomColorArrangement.push(isLucky ? `${baseColor}|mul` : baseColor);
        }
        setCurrentColorArrangement(randomColorArrangement);
    };

    useEffect(() => {
        createBoard();
    }, []);

    // Game Loop (Gravity & Passive Matching)
    useEffect(() => {
        if (isGameOver || isPaused) return;

        const timer = setInterval(() => {
            setCurrentColorArrangement(currentBoard => {
                // 1. Instant Gravity (Teleport to stable state)
                const gravityBoard = getBoardAfterGravity(currentBoard);

                // 2. Try Matches on result
                const matchResult = getBoardAfterMatches(gravityBoard);

                if (matchResult) {
                    if (isPlaying) {
                        setScore(s => s + matchResult.scoreIncrease);

                        // Add floating text (passive matches)
                        matchResult.matchCenters.forEach(center => {
                            const newText: FloatingText = {
                                id: nextIdRef.current++,
                                x: center.x,
                                y: center.y,
                                value: matchResult.scoreIncrease
                            };
                            setFloatingTexts(prev => [...prev, newText]);
                            // Cleanup after animation (1s)
                            setTimeout(() => {
                                setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
                            }, 1000);
                        });
                    }

                    return matchResult.newBoard;
                }

                return gravityBoard; // If no matches, just return gravity result (or same board if stable)
            });
        }, 100);

        return () => clearInterval(timer);
    }, [isPlaying, isGameOver, isPaused]);

    // Timer
    useEffect(() => {
        if (!isPlaying || isGameOver || isPaused) return;
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
    }, [isPlaying, isGameOver, isPaused]);


    // Submit score on game over
    // Submit score on game over
    useEffect(() => {
        if (isGameOver && score > 0) {
            const submit = async () => {
                try {
                    await apiRequest('/scores', {
                        method: 'POST',
                        body: JSON.stringify({ amount: score, game: 'neon-match' })
                    });
                } catch (e: any) {
                    console.error("Error submitting score:", e);
                    if (e.message && e.message.includes('congelada')) {
                        alert("⚠️ ALERTA DE SEGURIDAD ⚠️\n\n" + e.message);
                    }
                }
            };
            submit();
        }
    }, [isGameOver, score]);

    // --- Interaction ---

    const handlePieceClick = (index: number) => {
        if (!isPlaying || isGameOver || isPaused) return;

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

                    // Add floating text (user triggered match)
                    matchResult.matchCenters.forEach(center => {
                        const newText: FloatingText = {
                            id: nextIdRef.current++,
                            x: center.x,
                            y: center.y,
                            value: matchResult.scoreIncrease
                        };
                        setFloatingTexts(prev => [...prev, newText]);
                        setTimeout(() => {
                            setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
                        }, 800);
                    });
                } else {
                    // Invalid - Flash error or just do nothing (swap back is automatic because we never set state)
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

            {/* Main Content Wrapper */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 w-full max-w-7xl z-10 relative">

                {/* Left Panel: Leaderboard (Desktop) */}
                <div className="hidden lg:block w-80 h-[600px] sticky top-8">
                    <Leaderboard />
                </div>

                {/* Center: Game Area */}
                <div className="flex flex-col items-center">

                    {/* Header */}
                    <div className="w-full max-w-md flex items-center justify-between mb-8">
                        <button
                            onClick={() => {
                                if (isPlaying && !isGameOver) {
                                    setIsPaused(true);
                                } else {
                                    navigate('/');
                                }
                            }}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">
                            Neon Match
                        </h1>
                        <div className="w-10" />
                    </div>

                    {/* Stats */}
                    <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-8">
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
                    <div className={`relative transition-all duration-300 ${isPaused ? 'blur-xl opacity-50' : ''}`}>
                        <div className="w-[340px] h-[340px] bg-black/60 rounded-2xl border border-white/10 p-2 shadow-2xl flex flex-wrap backdrop-blur-sm relative">
                            {/* Floating Scores Overlay */}
                            {floatingTexts.map((text) => (
                                <div
                                    key={text.id}
                                    className="absolute pointer-events-none z-50 text-xl font-black text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-float-up"
                                    style={{
                                        left: `${text.x}%`,
                                        top: `${text.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                        textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                                    }}
                                >
                                    +{text.value}
                                </div>
                            ))}

                            {currentColorArrangement.map((candyColor, index) => (
                                <div
                                    key={index}
                                    className={`w-[40px] h-[40px] rounded-lg cursor-pointer transition-all duration-150 flex items-center justify-center
                                        ${selectedPiece === index ? 'scale-90 ring-2 ring-white z-20 brightness-110' : 'hover:scale-105 hover:brightness-105'}
                                    `}
                                    style={{
                                        backgroundColor: getBaseColor(candyColor),
                                        boxShadow: getBaseColor(candyColor) ? `0 0 10px ${getBaseColor(candyColor)}40` : 'none',
                                        opacity: candyColor === '' ? 0 : 1,
                                        border: isMultiplier(candyColor) ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)'
                                    }}
                                    onClick={() => handlePieceClick(index)}
                                >
                                    <div className="w-full h-full rounded-md bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center">
                                        {isMultiplier(candyColor) && <span className="text-xl">🌟</span>}
                                    </div>
                                </div>
                            ))}

                            {/* Ready State Overlay (Confined to Board) */}
                            {!isPlaying && !isGameOver && (
                                <div className="absolute inset-0 z-50 bg-[#121214] flex items-center justify-center rounded-2xl animate-in fade-in duration-300">
                                    <div className="flex flex-col items-center p-4 text-center">
                                        <h2 className="text-3xl font-black italic uppercase text-white mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] tracking-tighter">
                                            ¿Listo?
                                        </h2>

                                        <div className="flex flex-col gap-3 w-full">
                                            <button
                                                onClick={() => setIsPlaying(true)}
                                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-black uppercase rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.4)] text-sm"
                                            >
                                                Iniciar
                                            </button>
                                            <button
                                                onClick={() => navigate('/')}
                                                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold uppercase rounded-xl transition-all hover:scale-105 active:scale-95 border border-white/10 text-sm"
                                            >
                                                Volver
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel (For Balance? Or just spacer for now to keep game centered) */}
                <div className="hidden lg:block w-80">
                    {/* Placeholder for future sidebar or just empty to balance layout */}
                </div>
            </div>


            {/* Pause Modal */}
            {isPaused && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#121214] border border-yellow-500/30 w-full max-w-sm rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                        <h2 className="text-4xl font-black italic uppercase text-white mb-2 drop-shadow-md">¡Juego Pausado!</h2>
                        <p className="text-white/60 mb-8">Si sales ahora, se guardará tu puntuación actual.</p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setIsPaused(false)}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-black uppercase py-4 rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                            >
                                Seguir Jugando
                            </button>
                            <button
                                onClick={async () => {
                                    if (score > 0) {
                                        try {
                                            await apiRequest('/scores', { method: 'POST', body: JSON.stringify({ amount: score, game: 'neon-match' }) });
                                        } catch (e: any) {
                                            console.error("Error submitting score:", e);
                                            if (e.message && e.message.includes('congelada')) {
                                                alert("⚠️ ALERTA DE SEGURIDAD ⚠️\n\n" + e.message);
                                            }
                                        }
                                    }
                                    navigate('/');
                                }}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase py-4 rounded-xl transition-all active:scale-95"
                            >
                                Salir y Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}


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
                                <span className="text-xl font-black">+{(score / 100000).toFixed(2)} Zoins</span>
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
