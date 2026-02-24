import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Timer, Trophy } from 'lucide-react';
import { apiRequest } from '../lib/api';
import Leaderboard from '../components/Leaderboard';

// ... (constants and types remain same)
const width = 8;
const candyColors = [
    '#FFD700', // Gold (Zoins)
    '#00FFFF', // Aqua (Tropical)
    '#76FF03', // Lime (Kai)
    '#D500F9', // Purple (Deep)
    '#8D6E63', // Brown (Lighter - Wood tone)
    '#FFE0B2', // Sand (Darker - Warm Sand)
];

type FloatingText = {
    id: number;
    x: number;
    y: number;
    value: number;
};

interface Piece {
    id: number;
    val: string;
    isMatched?: boolean;
}

const NeonMatchPage = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useOutletContext<any>();

    // Game State
    const [currentColorArrangement, setCurrentColorArrangement] = useState<Piece[]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const [collectedZoins, setCollectedZoins] = useState(0);
    const [isSwapping, setIsSwapping] = useState(false);

    const nextIdRef = useRef(0);
    const nextPieceIdRef = useRef(0);

    // Derived State from Context
    const membership = user?.membership || 'FREE';

    const getLimit = (mem: string) => {
        switch (mem) {
            case 'FREE': return 3;
            case 'PALMERA': return 8;
            case 'CORAL': return 15;
            case 'PERLA': return 25;
            default: return 3;
        }
    };

    const limit = getLimit(membership);
    const dailyGamesLeft = typeof user?.dailyGamesLeft === 'number' ? user.dailyGamesLeft : 0;
    const extraGames = typeof user?.extraGames === 'number' ? user.extraGames : 0;
    const canPlay = dailyGamesLeft > 0 || extraGames > 0;


    // --- Helper Logic (Immutable) ---

    // zValue parsing: color|mul|z0.01
    const getBaseColor = (cell: string) => cell.split('|')[0];
    const isMultiplier = (cell: string) => cell.includes('|mul');
    const getZoinValue = (cell: string): number => {
        const match = cell.match(/\|z([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
    };

    // Updated to work with Piece[]
    const getBoardAfterMatches = (board: Piece[]): { newBoard: Piece[], scoreIncrease: number, zoinIncrease: number, matchCenters: { x: number, y: number }[] } | null => {
        let matchedIndices = new Set<number>();

        // Check Rows
        for (let i = 0; i < 64; i++) {
            // Optimization: If we are at col 6 or 7, a match-3 is impossible starting here.
            // But we must also ensure we don't check across rows.
            const currentRow = Math.floor(i / width);

            // Check potential match-3
            if (i + 2 < 64 && Math.floor((i + 2) / width) === currentRow) {
                const row = [i, i + 1, i + 2];
                const color = getBaseColor(board[i].val);

                if (color && row.every(idx => getBaseColor(board[idx].val) === color)) {
                    let matchLength = 3;
                    // Extend match
                    while (
                        i + matchLength < 64 &&
                        Math.floor((i + matchLength) / width) === currentRow &&
                        getBaseColor(board[i + matchLength].val) === color
                    ) {
                        row.push(i + matchLength);
                        matchLength++;
                    }
                    row.forEach(idx => matchedIndices.add(idx));
                }
            }
        }

        // Check Columns
        for (let i = 0; i < width; i++) {
            for (let j = 0; j <= width - 3; j++) { // Only go up to row 5
                const startIdx = j * width + i;
                const col = [startIdx, startIdx + width, startIdx + width * 2];
                const color = getBaseColor(board[startIdx].val);

                if (color && col.every(idx => getBaseColor(board[idx].val) === color)) {
                    let matchLength = 3;
                    while (
                        j + matchLength < width &&
                        getBaseColor(board[startIdx + width * matchLength].val) === color
                    ) {
                        col.push(startIdx + width * matchLength);
                        matchLength++;
                    }
                    col.forEach(idx => matchedIndices.add(idx));
                }
            }
        }

        if (matchedIndices.size > 0) {
            const newBoard = [...board];
            let zoinIncrease = 0;

            matchedIndices.forEach(idx => {
                const zVal = getZoinValue(board[idx].val);
                if (zVal > 0) {
                    zoinIncrease += zVal;
                }
                newBoard[idx] = { id: nextPieceIdRef.current++, val: '' };
            });

            let scoreIncrease = matchedIndices.size * 10;
            let hasMultiplier = false;
            matchedIndices.forEach(idx => {
                if (isMultiplier(board[idx].val)) hasMultiplier = true;
            });
            if (hasMultiplier) scoreIncrease *= 10;

            let totalX = 0;
            let totalY = 0;
            matchedIndices.forEach(idx => {
                totalX += (idx % width);
                totalY += Math.floor(idx / width);
            });

            const centerX = (totalX / matchedIndices.size) * (100 / width) + (50 / width);
            const centerY = (totalY / matchedIndices.size) * (100 / width) + (50 / width);

            return { newBoard, scoreIncrease, zoinIncrease, matchCenters: [{ x: centerX, y: centerY }] };
        }

        return null;
    };

    // Modified Gravity: Step-by-Step for animation logic
    const getBoardAfterGravity = (board: Piece[]): { newBoard: Piece[], moved: boolean } => { // Return moved status
        const newBoard = [...board];
        let moved = false;

        // 1. Move Blocks Down (Single Step)
        // Iterate bottom-up (Row 6 down to 0)
        for (let i = 55; i >= 0; i--) {
            // If current has block, and below is empty
            if (newBoard[i].val !== '' && newBoard[i + width].val === '') {
                newBoard[i + width] = newBoard[i]; // Move object
                newBoard[i] = { id: nextPieceIdRef.current++, val: '' }; // Leave empty placeholder
                moved = true;
                // Important: In a single pass, we don't "teleport" this block further down.
                // The next tick will handle the next step if needed.
            }
        }

        // 2. Spawn New Blocks at Top Row
        for (let col = 0; col < width; col++) {
            if (newBoard[col].val === '') { // If top row is empty
                // Generate ONE new block
                const baseColor = candyColors[Math.floor(Math.random() * candyColors.length)];
                let suffixes = "";
                if (Math.random() < 0.01) suffixes += "|mul";
                if (Math.random() < 0.0035) suffixes += "|z0.01"; // 0.35% chance (was 1%)

                newBoard[col] = {
                    id: nextPieceIdRef.current++,
                    val: `${baseColor}${suffixes}` // No spawn-in flag needed for layout?
                };
                moved = true; // Spawning counts as movement
            }
        }

        // If nothing moved and no matches pending, we are stable.
        return { newBoard, moved };
    };

    // --- Life Cycle ---

    const createBoard = () => {
        // 1. Generate Base Board with NO Initial Matches
        const boardStrings: string[] = new Array(width * width).fill('');

        for (let i = 0; i < width * width; i++) {
            const col = i % width;
            const row = Math.floor(i / width);

            let validColors = [...candyColors];

            // Prevent horizontal match (check left 2)
            if (col >= 2) {
                const c1 = getBaseColor(boardStrings[i - 1]);
                const c2 = getBaseColor(boardStrings[i - 2]);
                if (c1 === c2 && c1) {
                    validColors = validColors.filter(c => c !== c1);
                }
            }

            // Prevent vertical match (check top 2)
            if (row >= 2) {
                const c1 = getBaseColor(boardStrings[i - width]);
                const c2 = getBaseColor(boardStrings[i - width * 2]);
                if (c1 === c2 && c1) {
                    validColors = validColors.filter(c => c !== c1);
                }
            }

            // Fallback if filtering removed all (unlikely with 6 colors)
            const baseColor = validColors.length > 0
                ? validColors[Math.floor(Math.random() * validColors.length)]
                : candyColors[Math.floor(Math.random() * candyColors.length)];

            // Small chance for multiplier on start
            const isLucky = Math.random() < 0.01;
            boardStrings[i] = isLucky ? `${baseColor}|mul` : baseColor;
        }

        // 2. Determine Zoin Pool (The "Loot Table")
        // Adjusted for an average of ~0.011 Zoins per game
        const zoinValues: number[] = [];

        // 20% chance of a single 0.01 Zoin at the start (Average: 0.002)
        if (Math.random() < 0.20) {
            zoinValues.push(0.01);
        }

        // Extremely rare high-value Zoins (kept for excitement, but minimal impact on average)
        if (Math.random() < 0.02) zoinValues.push(0.02); // 2% chance
        if (Math.random() < 0.005) zoinValues.push(0.05); // 0.5% chance

        // 3. Inject Zoins into random positions
        const takenIndices = new Set<number>();

        zoinValues.forEach(zValue => {
            let idx;
            let attempts = 0;
            do {
                idx = Math.floor(Math.random() * (width * width));
                attempts++;
            } while (takenIndices.has(idx) && attempts < 100);

            if (!takenIndices.has(idx)) {
                takenIndices.add(idx);
                boardStrings[idx] = `${boardStrings[idx]}|z${zValue}`;
            }
        });

        // 4. Convert to Pieces with IDs
        const board: Piece[] = boardStrings.map(val => ({
            id: nextPieceIdRef.current++,
            val
        }));

        setCurrentColorArrangement(board);
    };

    useEffect(() => {
        createBoard();
    }, []);

    // Ref to access latest board state inside setInterval without dependency cycles
    const boardRef = useRef(currentColorArrangement);
    useEffect(() => {
        boardRef.current = currentColorArrangement;
    }, [currentColorArrangement]);

    // Game Loop (Gravity & Passive Matching)
    useEffect(() => {
        if (isGameOver || isPaused) return;

        const timer = setInterval(() => {
            const currentBoard = boardRef.current;

            // 1. Gravity Phase
            const { newBoard: gravityBoard, moved } = getBoardAfterGravity(currentBoard);

            if (moved) {
                // If blocks are falling, just update board. No matches yet.
                setCurrentColorArrangement(gravityBoard);
                return;
            }

            // 2. Match Phase (Only if stable)
            const matchResult = getBoardAfterMatches(gravityBoard);

            if (matchResult) {
                if (isPlaying) {
                    // Update Board
                    setCurrentColorArrangement(matchResult.newBoard);

                    // Side Effects (Score, Zoins, Floating Text) - Safe here (runs once per tick)
                    setScore(s => s + matchResult.scoreIncrease);
                    if (matchResult.zoinIncrease > 0) {
                        setCollectedZoins(z => z + matchResult.zoinIncrease);
                    }

                    // Add floating text
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
                        }, 1000);
                    });
                }
            } else if (gravityBoard !== currentBoard) {
                // If gravity happened but no matches (rare edge case where gravity didn't flag 'moved' but array changed? unlikely given logic, but safe)
                // Actually getBoardAfterGravity retuns moved=true if any change. 
                // But if we are here, moved=false. So logic is stable.
            }
        }, 120); // 120ms tick for faster gameplay
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
    const submitScore = async () => {
        if (score === 0 && collectedZoins === 0) return;
        try {
            await apiRequest('/scores', {
                method: 'POST',
                body: JSON.stringify({ amount: score, game: 'neon-match', zoins: collectedZoins })
            });
            // Update global limits immediately
            if (refreshUser) await refreshUser();
        } catch (e: any) {
            console.error("Error submitting score:", e);
            if (e.message && e.message.includes('congelada')) {
                alert("⚠️ ALERTA DE SEGURIDAD ⚠️\n\n" + e.message);
            }
        }
    };

    // Submit score on game over
    useEffect(() => {
        if (isGameOver) {
            submitScore();
        }
    }, [isGameOver]);

    // --- Interaction ---

    const handlePieceClick = (index: number) => {
        if (!isPlaying || isGameOver || isPaused || isSwapping) return;

        if (selectedPiece === null) {
            setSelectedPiece(index);
        } else {
            // Strict Adjacency Check (Prevent Wrapping)
            const currentRow = Math.floor(selectedPiece / width);
            const targetRow = Math.floor(index / width);
            const currentCol = selectedPiece % width;
            const targetCol = index % width;

            const isHorizontal = currentRow === targetRow && Math.abs(currentCol - targetCol) === 1;
            const isVertical = currentCol === targetCol && Math.abs(currentRow - targetRow) === 1;

            if (isHorizontal || isVertical) {
                // 1. Create swapped board (Visual Swap)
                const tempBoard = [...currentColorArrangement]; // Copy array
                const temp = tempBoard[index];
                tempBoard[index] = tempBoard[selectedPiece];
                tempBoard[selectedPiece] = temp;

                setIsSwapping(true);
                setCurrentColorArrangement(tempBoard);

                // 2. Check Valid
                // We verify if this new board HAS matches.
                const matchResult = getBoardAfterMatches(tempBoard);

                if (matchResult) {
                    // Valid Move: Keep the swap.
                    // The game loop will pick up the match.
                    setTimeout(() => {
                        setIsSwapping(false);
                    }, 300);
                } else {
                    // Invalid Move: Revert after delay
                    setTimeout(() => {
                        setCurrentColorArrangement(currentColorArrangement); // Revert to original
                        setIsSwapping(false);
                    }, 300);
                }
            }
            setSelectedPiece(null);
        }
    };

    const handleFinish = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-deep)] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
            {/* Background Ambience - Tropical Water */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--bg-panel)_0%,_transparent_70%)] opacity-20 blur-3xl mix-blend-overlay" />

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
                            className="p-2 rounded-full border border-[var(--text-main)]/20 hover:bg-white/20 text-[var(--text-main)] transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-main)] drop-shadow-md">
                            Neon Match
                        </h1>
                        <div className="w-10" />
                    </div>

                    {/* Stats */}
                    <div className="w-full max-w-md grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"> {/* Responsive Grid */}
                        {/* Puntos */}
                        <div className="glass-panel rounded-xl p-3 flex flex-col items-center shadow-lg transform hover:scale-105 transition-transform">
                            <div className="flex items-center gap-1 text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">
                                <Trophy className="w-3 h-3 text-[var(--blaze-neon)]" />
                                Puntos
                            </div>
                            <span className="text-xl font-black text-white font-mono">{score}</span>
                        </div>

                        {/* Zoins */}
                        <div className="glass-panel rounded-xl p-3 flex flex-col items-center shadow-lg transform hover:scale-105 transition-transform">
                            <div className="flex items-center gap-1 text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">
                                <img src="/zoins_icon.jpg" className="w-3 h-3 rounded-full" />
                                Zoins
                            </div>
                            <span className="text-xl font-black text-[var(--zoin-gold)] font-mono">{collectedZoins.toFixed(2)}</span>
                        </div>

                        {/* Tiempo */}
                        <div className={`glass-panel border rounded-xl p-3 flex flex-col items-center shadow-lg transform hover:scale-105 transition-transform ${timeLeft < 10 ? 'border-red-500/50 animate-pulse' : 'border-white/20'}`}>
                            <div className="flex items-center gap-1 text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">
                                <Timer className="w-3 h-3 text-white" />
                                Tiempo
                            </div>
                            <span className={`text-xl font-black font-mono ${timeLeft < 10 ? 'text-red-300' : 'text-white'}`}>
                                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                            </span>
                        </div>
                    </div>

                    {/* Board */}
                    <div className={`relative transition-all duration-300 ${isPaused ? 'blur-xl opacity-50' : ''}`}>
                        {/* Blue Glass Board Container */}
                        {/* 400x400 -> 8 cols of 48px + 16px total padding (8px each side) */}
                        <div className="w-[400px] h-[400px] bg-[var(--bg-panel)]/40 rounded-2xl border-2 border-white/20 shadow-2xl backdrop-blur-sm relative overflow-hidden">
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

                            {currentColorArrangement.map((piece, index) => {
                                // Calculate Grid Position (Abs)
                                const col = index % width;
                                const row = Math.floor(index / width);
                                const leftPos = 8 + col * 48; // 48px blocks, 8px padding
                                const topPos = 8 + row * 48;

                                // Render empty slots as invisible layout placeholders to maintain VDOM stability
                                if (piece.val === '') {
                                    return <div key={`empty-${index}`} className="absolute" style={{ display: 'none' }} />;
                                }

                                return (
                                    <div
                                        key={piece.id}
                                        className={`absolute w-[48px] h-[48px] rounded-lg cursor-pointer flex items-center justify-center transition-all duration-[120ms] ease-linear hover:brightness-110`}
                                        style={{
                                            left: leftPos,
                                            top: topPos,
                                            zIndex: selectedPiece === index ? 50 : 10,
                                            backgroundColor: getBaseColor(piece.val),
                                            boxShadow: getBaseColor(piece.val) ? `0 4px 6px rgba(0,0,0,0.5), inset 0 4px 4px rgba(255,255,255,0.6), inset 0 -4px 6px rgba(0,0,0,0.4), 0 0 10px ${getBaseColor(piece.val)}60` : 'none',
                                            border: isMultiplier(piece.val) ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.2)',
                                            transform: selectedPiece === index ? 'scale(0.9) translateY(2px)' : 'scale(1)'
                                        }}
                                        onClick={() => handlePieceClick(index)}
                                    >
                                        <div className="w-full h-full rounded-md bg-gradient-to-br from-white/40 to-black/30 flex items-center justify-center relative">
                                            {isMultiplier(piece.val) && <span className="text-xl">🌟</span>}
                                            {getZoinValue(piece.val) > 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-[12px] font-black text-white bg-black/50 px-1 rounded-full backdrop-blur-sm border border-yellow-400/50">
                                                        z{getZoinValue(piece.val)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Ready State Overlay (Confined to Board) */}
                            {!isPlaying && !isGameOver && (
                                <div className="absolute inset-0 z-50 bg-[var(--bg-panel)]/95 flex items-center justify-center animate-in fade-in duration-300">
                                    <div className="flex flex-col items-center p-4 text-center">
                                        <h2 className="text-3xl font-black italic uppercase text-white mb-6 drop-shadow-sm tracking-tighter">
                                            ¿Listo?
                                        </h2>

                                        <div className="flex flex-col gap-3 w-full">
                                            <button
                                                onClick={() => {
                                                    // Prevent start if limit reached
                                                    if (!canPlay) {
                                                        alert("Límite diario alcanzado y no tienes partidas extra.");
                                                        return;
                                                    }
                                                    setIsPlaying(true);
                                                }}
                                                className="btn-wood px-6 py-3 text-lg font-black uppercase rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
                                            >
                                                Iniciar
                                            </button>
                                            <button
                                                onClick={() => navigate('/')}
                                                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold uppercase rounded-xl transition-all hover:scale-105 active:scale-95 border border-white/20 text-sm"
                                            >
                                                Volver
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Game Over Overlay (Inside Board) */}
                            {isGameOver && (
                                <div className="absolute inset-0 z-50 bg-[var(--bg-panel)]/95 flex items-center justify-center animate-in fade-in duration-300">
                                    <div className="flex flex-col items-center p-4 text-center w-full">
                                        <h2 className="text-3xl font-black italic uppercase text-white mb-2 drop-shadow-sm tracking-tighter">
                                            ¡Fin!
                                        </h2>

                                        <div className="bg-white/10 rounded-xl p-4 mb-4 border border-white/20 w-full">
                                            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Puntuación</p>
                                            <p className="text-4xl font-black text-white mb-2">{score}</p>
                                            <div className="h-px w-full bg-white/10 mb-2" />
                                            <div className="flex items-center justify-center gap-2 text-[var(--zoin-gold)]">
                                                <img src="/zoins_icon.jpg" className="w-5 h-5 rounded-full" />
                                                <span className="text-lg font-black">+{collectedZoins.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 w-full">
                                            <button
                                                onClick={async () => {
                                                    // Check limit locally first
                                                    if (!canPlay) {
                                                        return;
                                                    }

                                                    setIsGameOver(false);
                                                    setScore(0);
                                                    setCollectedZoins(0);
                                                    setTimeLeft(60);
                                                    setTimeLeft(60);
                                                    createBoard();
                                                    setIsPlaying(true);
                                                }}
                                                disabled={!canPlay}
                                                className={`px-6 py-3 text-white font-black uppercase rounded-xl transition-all shadow-lg text-sm ${!canPlay
                                                    ? 'bg-gray-500 cursor-not-allowed opacity-50 hidden'
                                                    : 'btn-wood hover:scale-105 active:scale-95'
                                                    }`}
                                            >
                                                Jugar de Nuevo
                                            </button>

                                            {/* Limit Reached Message */}
                                            {!canPlay && (
                                                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center animate-pulse">
                                                    <p className="text-red-200 font-bold text-sm uppercase mb-1">
                                                        Límite Diario Alcanzado ({membership})
                                                    </p>
                                                    <p className="text-white/80 text-xs">
                                                        Vuelve mañana, mejora tu plan o compra un <span className="text-[var(--blaze-neon)] font-black">Pack de Partidas</span> en el Mercado.
                                                    </p>
                                                </div>
                                            )}
                                            <button
                                                onClick={handleFinish}
                                                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold uppercase rounded-xl transition-all hover:scale-105 active:scale-95 border border-white/20 text-sm"
                                            >
                                                Volver al Menu
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
                <div className="absolute inset-0 z-50 bg-[var(--bg-deep)]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="glass-panel w-full max-w-sm rounded-2xl p-8 text-center shadow-2xl">
                        <h2 className="text-4xl font-black italic uppercase text-white mb-2 drop-shadow-sm">¡Juego Pausado!</h2>
                        <p className="text-white/80 mb-8">Si sales ahora, se guardará tu puntuación actual.</p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setIsPaused(false)}
                                className="btn-wood w-full py-4 text-xl"
                            >
                                Seguir Jugando
                            </button>
                            <button
                                onClick={() => {
                                    submitScore();
                                    navigate('/');
                                }}
                                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold uppercase py-4 rounded-xl transition-all active:scale-95"
                            >
                                Salir y Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NeonMatchPage;
