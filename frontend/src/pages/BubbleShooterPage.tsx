import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { apiRequest } from '../lib/api';
import Leaderboard from '../components/Leaderboard';

// --- Constants & Types ---

const COLS = 13; // Grid width (Reduced from 15 per user req)
const BUBBLE_RADIUS = 18; // Increased size (was 16)
const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;

// Colors for 3D bubbles (base + highlight + shadow)
// Using CSS radial gradients for 3D effect, so we store base colors here
const BUBBLE_COLORS = [
    { name: 'red', base: '#ef4444', shine: '#fca5a5', dark: '#991b1b' },    // Red
    { name: 'blue', base: '#3b82f6', shine: '#93c5fd', dark: '#1e40af' },    // Blue
    { name: 'green', base: '#22c55e', shine: '#86efac', dark: '#15803d' },  // Green
    { name: 'yellow', base: '#eab308', shine: '#fde047', dark: '#854d0e' }, // Yellow
    { name: 'purple', base: '#a855f7', shine: '#d8b4fe', dark: '#6b21a8' }, // Purple
];

interface Bubble {
    id: number;
    row: number;
    col: number;
    x: number;
    y: number;
    color: typeof BUBBLE_COLORS[number];
    type: 'normal' | 'zoin';
    opacity: number; // For popping animation
    scale: number;   // For popping animation
    exploding?: boolean;
}

interface Projectile {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: typeof BUBBLE_COLORS[number];
    type: 'normal' | 'zoin';
}

interface FloatingText {
    id: number;
    x: number;
    y: number;
    value: string;
    life: number;
}

const BubbleShooterPage = () => {
    const navigate = useNavigate();
    const { refreshUser } = useOutletContext<any>();

    // --- State ---
    const [score, setScore] = useState(0);
    const [collectedZoins, setCollectedZoins] = useState(0);
    const [shotsFired, setShotsFired] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [, setBubbles] = useState<Bubble[]>([]); // Only for triggering re-renders if needed, largely handled by ref/canvas
    const [nextBubbleColor, setNextBubbleColor] = useState(BUBBLE_COLORS[0]);
    const [currentBubbleColor, setCurrentBubbleColor] = useState(BUBBLE_COLORS[0]);
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

    // Grid State
    const [gridPhase, setGridPhase] = useState(0);

    // Canvas Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    const projectilesRef = useRef<Projectile[]>([]); // Array for rapid fire
    const bubblesRef = useRef<Bubble[]>([]); // Ref for synchronous access in game loop
    const scoreRef = useRef(0);
    const gridPhaseRef = useRef(0);
    const shotsFiredRef = useRef(0);
    const currentBubbleColorRef = useRef(BUBBLE_COLORS[0]);
    const nextBubbleColorRef = useRef(BUBBLE_COLORS[0]);
    const mousePosRef = useRef({ x: 0, y: 0 });

    // Initial setup
    useEffect(() => {
        // Pre-calculate bubbles for hexagonal grid
    }, []);

    // Sync ref
    useEffect(() => {
        gridPhaseRef.current = gridPhase;
    }, [gridPhase]);

    // --- Game Logic Helpers ---

    const isRowOffset = (row: number, phase: number) => {
        return (row % 2) === phase;
    };

    const getBubblePos = (row: number, col: number, phase: number) => {
        const offset = isRowOffset(row, phase);
        const xOffset = offset ? BUBBLE_RADIUS : 0;
        const x = col * BUBBLE_DIAMETER + BUBBLE_RADIUS + xOffset;
        const y = row * (BUBBLE_DIAMETER - 4) + BUBBLE_RADIUS;
        return { x, y };
    };

    const getGridPos = (x: number, y: number, phase: number) => {
        const rowHeight = BUBBLE_DIAMETER - 4;
        const row = Math.round((y - BUBBLE_RADIUS) / rowHeight);

        const offset = isRowOffset(row, phase);
        const xOffset = offset ? BUBBLE_RADIUS : 0;
        const col = Math.round((x - BUBBLE_RADIUS - xOffset) / BUBBLE_DIAMETER);

        return { row, col };
    };

    const generateRow = (rowIndex: number, phase: number) => {
        const offset = isRowOffset(rowIndex, phase);
        const colsInRow = offset ? COLS - 1 : COLS;

        const newRowBubbles: Bubble[] = [];
        for (let c = 0; c < colsInRow; c++) {
            const isZoin = Math.random() < 0.01; // 1% chance (User Req)

            // Avoid 3 in a row horizontally
            let color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
            if (c >= 2) {
                const prev1 = newRowBubbles[c - 1];
                const prev2 = newRowBubbles[c - 2];
                if (prev1.color.name === prev2.color.name) {
                    // Pick a different color
                    const forbidden = prev1.color.name;
                    let attempts = 0;
                    while (color.name === forbidden && attempts < 10) {
                        color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
                        attempts++;
                    }
                }
            }

            const pos = getBubblePos(rowIndex, c, phase);

            newRowBubbles.push({
                id: Math.random(),
                row: rowIndex,
                col: c,
                x: pos.x,
                y: pos.y,
                color: color,
                type: isZoin ? 'zoin' : 'normal',
                opacity: 1,
                scale: 1
            });
        }
        return newRowBubbles;
    };

    const initGame = () => {
        setScore(0);
        scoreRef.current = 0;
        setCollectedZoins(0);
        setShotsFired(0);
        shotsFiredRef.current = 0;
        setIsGameOver(false);
        setIsPlaying(true);
        projectilesRef.current = [];
        setFloatingTexts([]);
        setGridPhase(0);
        gridPhaseRef.current = 0;

        // Generate initial 5 rows
        const initialBubbles: Bubble[] = [];
        for (let r = 0; r < 5; r++) {
            initialBubbles.push(...generateRow(r, 0));
        }
        setBubbles(initialBubbles);
        bubblesRef.current = initialBubbles;

        // Init colors - Randomize properly
        const c1 = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
        const c2 = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];

        // Update Refs AND State
        currentBubbleColorRef.current = c1;
        nextBubbleColorRef.current = c2;
        setCurrentBubbleColor(c1);
        setNextBubbleColor(c2);
    };

    const gameOver = () => {
        setIsPlaying(false);
        setIsGameOver(true);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        submitScore();
    };

    const submitScore = async () => {
        if (scoreRef.current === 0 && collectedZoins === 0) return;
        // API Call placeholder
        try {
            await apiRequest('/scores', {
                method: 'POST',
                body: JSON.stringify({ amount: scoreRef.current, game: 'bubble-shooter', zoins: collectedZoins })
            });
            if (refreshUser) await refreshUser();
        } catch (e) {
            console.error("Score submit failed", e);
        }
    };

    // --- Core Loop ---

    const update = () => {
        if (!isPlaying || isPaused) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Update Projectiles
        if (projectilesRef.current.length > 0) {
            // Filter out projectiles that have snapped or gone out of bounds (though walls handle bounds)
            // returning false from filter removes them.
            // But snapProjectile needs to modifying the array or signal removal.

            // We'll iterate backwards to safe remove
            for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
                const p = projectilesRef.current[i];
                p.x += p.vx;
                p.y += p.vy;

                let snapped = false;

                // Wall Collisions
                if ((p.x - BUBBLE_RADIUS <= 0) || (p.x + BUBBLE_RADIUS >= canvas.width)) {
                    p.vx *= -1;
                    p.x = Math.max(BUBBLE_RADIUS, Math.min(canvas.width - BUBBLE_RADIUS, p.x));
                }

                // Ceiling Collision
                if (p.y - BUBBLE_RADIUS <= 0) {
                    snapProjectile(p);
                    snapped = true;
                }

                // Bubble Collisions
                if (!snapped) {
                    for (const b of bubblesRef.current) {
                        const dx = p.x - b.x;
                        const dy = p.y - b.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < BUBBLE_DIAMETER * 0.85) {
                            snapProjectile(p);
                            snapped = true;
                            break;
                        }
                    }
                }

                if (snapped) {
                    projectilesRef.current.splice(i, 1);
                }
            }
        }

        // Render
        draw();

        requestRef.current = requestAnimationFrame(update);
    };

    const snapProjectile = (p: Projectile) => {
        const phase = gridPhaseRef.current;
        let gridPos = getGridPos(p.x, p.y, phase);

        // Fix: Clamp column to valid range for the specific row type (Normal vs Offset)
        // to prevent snapping into the "void" on the right of offset rows.
        const isOffset = isRowOffset(gridPos.row, phase);
        const maxCols = isOffset ? COLS - 1 : COLS;
        if (gridPos.col >= maxCols) gridPos.col = maxCols - 1;
        if (gridPos.col < 0) gridPos.col = 0;

        // --- Collision Refinement: Find valid empty slot ---
        const isOccupied = (r: number, c: number) => bubblesRef.current.some(b => b.row === r && b.col === c);

        // Strict Collision: If aimed directly at occupied, find nearest free neighbor
        if (isOccupied(gridPos.row, gridPos.col)) {
            // Find closest EMPTY neighbor using the SAME hex layout logic as matching
            const neighbors = getGeometricNeighbors(gridPos.row, gridPos.col, phase);

            let bestDist = Infinity;
            let bestSpot = gridPos;
            let found = false;

            for (const n of neighbors) {
                const rowOffset = isRowOffset(n.r, phase);
                const nMaxCols = rowOffset ? COLS - 1 : COLS;

                if (!isOccupied(n.r, n.c) && n.c >= 0 && n.c < nMaxCols && n.r >= 0) {
                    const pos = getBubblePos(n.r, n.c, phase);
                    const dx = p.x - pos.x;
                    const dy = p.y - pos.y;
                    const dist = dx * dx + dy * dy;
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestSpot = { row: n.r, col: n.c }; // fixed property names
                        found = true;
                    }
                }
            }
            if (found) gridPos = bestSpot;
            else {
                // Projectile overlaps and no neighbors? Remove it.
                return;
            }
        }

        // Double Check overwrites
        if (isOccupied(gridPos.row, gridPos.col)) {
            return;
        }

        // Create new bubble
        const pos = getBubblePos(gridPos.row, gridPos.col, phase);
        const newBubble: Bubble = {
            id: Math.random(),
            row: gridPos.row,
            col: gridPos.col,
            x: pos.x,
            y: pos.y,
            color: p.color,
            type: p.type,
            opacity: 1,
            scale: 1
        };

        // Add to grid
        const newBubbles = [...bubblesRef.current, newBubble];
        bubblesRef.current = newBubbles;
        setBubbles(newBubbles);

        // Check for matches
        handleMatches(newBubble);

        // Descent Logic with Ref & Difficulty Scaling
        shotsFiredRef.current += 1;
        setShotsFired(shotsFiredRef.current);

        // Difficulty: After 2500 points, faster descent (every 4 shots)
        const descentThreshold = scoreRef.current >= 2500 ? 4 : 5;

        if (shotsFiredRef.current % descentThreshold === 0) {
            addCeilingRow();
        }
        checkGameOver();
    };

    const getGeometricNeighbors = (r: number, c: number, phase: number) => {
        // Returns conceptual neighbor coordinates for a grid position
        const offset = isRowOffset(r, phase);
        const neighbors = [
            { r: r, c: c - 1 }, // Left
            { r: r, c: c + 1 }  // Right
        ];
        if (offset) {
            // Offset Row (Right shifted)
            neighbors.push(
                { r: r - 1, c: c },     // Top Left-ish (Above)
                { r: r - 1, c: c + 1 }, // Top Right-ish
                { r: r + 1, c: c },     // Bottom Left-ish
                { r: r + 1, c: c + 1 }  // Bottom Right-ish
            );
        } else {
            // Normal Row (Left aligned)
            neighbors.push(
                { r: r - 1, c: c - 1 }, // Top Left
                { r: r - 1, c: c },     // Top Right
                { r: r + 1, c: c - 1 }, // Bottom Left
                { r: r + 1, c: c }      // Bottom Right
            );
        }
        return neighbors;
    };

    const handleMatches = (startBubble: Bubble) => {
        const phase = gridPhaseRef.current;

        // Flood fill to find matches
        const visited = new Set<number>();
        const matches: Bubble[] = [];
        const queue = [startBubble];
        const colorName = startBubble.color.name;

        visited.add(startBubble.id);
        matches.push(startBubble);

        let head = 0;
        while (head < queue.length) {
            const current = queue[head++];
            const neighbors = getBubbleNeighbors(current, bubblesRef.current, phase);

            for (const n of neighbors) {
                if (!visited.has(n.id) && n.color.name === colorName) {
                    visited.add(n.id);
                    matches.push(n);
                    queue.push(n);
                }
            }
        }

        if (matches.length >= 3) {
            // Remove matches
            let points = matches.length * 10;
            let zoinBonus = 0;

            // Check Zoins in match
            matches.forEach(b => {
                if (b.type === 'zoin') {
                    zoinBonus += 0.01;
                }
            });

            // Update Score
            scoreRef.current += points;
            setScore(scoreRef.current);
            if (zoinBonus > 0) setCollectedZoins(z => z + zoinBonus);

            // Create floating text
            setFloatingTexts(prev => [
                ...prev,
                { id: Math.random(), x: startBubble.x, y: startBubble.y, value: `+${points}`, life: 1.0 },
                ...(zoinBonus > 0 ? [{ id: Math.random(), x: startBubble.x, y: startBubble.y - 20, value: `+${zoinBonus.toFixed(2)} Zoins`, life: 1.5 }] : [])
            ]);

            // VISUAL POP DELAY:
            // 1. Mark as exploding
            const matchIds = new Set(matches.map(m => m.id));
            bubblesRef.current = bubblesRef.current.map(b => matchIds.has(b.id) ? { ...b, exploding: true } : b);
            setBubbles([...bubblesRef.current]); // Trigger render

            // 2. Schedule removal
            setTimeout(() => {
                let remainingBubbles = bubblesRef.current.filter(b => !matchIds.has(b.id));

                // Handle Floating Clusters (Disconnected from ceiling)
                const grounded = new Set<number>();
                const topRowBubbles = remainingBubbles.filter(b => b.row === 0);

                // BFS from top row to find all grounded bubbles
                const groundQueue = [...topRowBubbles];
                groundQueue.forEach(b => grounded.add(b.id));

                let gHead = 0;
                while (gHead < groundQueue.length) {
                    const curr = groundQueue[gHead++];
                    const neighbors = getBubbleNeighbors(curr, remainingBubbles, phase);
                    for (const n of neighbors) {
                        if (!grounded.has(n.id)) {
                            grounded.add(n.id);
                            groundQueue.push(n);
                        }
                    }
                }

                // Remove ungrounded (floating) bubbles
                const fallen = remainingBubbles.filter(b => !grounded.has(b.id));
                if (fallen.length > 0) {
                    // Add bonus for dropping bubbles
                    const dropBonus = fallen.length * 20;
                    scoreRef.current += dropBonus;
                    setScore(scoreRef.current);
                    setFloatingTexts(prev => [...prev, { id: Math.random(), x: canvasRef.current!.width / 2, y: canvasRef.current!.height / 2, value: `BONUS! +${dropBonus}`, life: 1.5 }]);

                    // Check fallen zoins
                    fallen.forEach(b => {
                        if (b.type === 'zoin') setCollectedZoins(z => z + 0.01);
                    });
                }

                remainingBubbles = remainingBubbles.filter(b => grounded.has(b.id));
                bubblesRef.current = remainingBubbles;
                setBubbles(remainingBubbles);
            }, 100);

        }
    };



    const getBubbleNeighbors = (node: Bubble, allBubbles: Bubble[], phase: number) => {
        const potential = getGeometricNeighbors(node.row, node.col, phase);
        return allBubbles.filter(b =>
            potential.some(pc => pc.r === b.row && pc.c === b.col)
        );
    };

    const addCeilingRow = () => {
        // To shift down:
        // 1. All existing bubbles: row++
        // 2. TOGGLE Phase (0->1, 1->0). 
        //    Why? Old Row 0 (Offset=True, Phase=0) becomes Row 1.
        //    We want bubble at "Old R0" to stay visually at x_offset position.
        //    New Phase=1. New Row 1 check: (1 % 2 === 1) -> True (Offset). 
        //    So it stays Offset! Correct.

        const currentPhase = gridPhaseRef.current;
        const newPhase = currentPhase === 0 ? 1 : 0;

        const shifted = bubblesRef.current.map(b => ({
            ...b,
            row: b.row + 1,
            y: getBubblePos(b.row + 1, b.col, newPhase).y
            // Note: X coord calc with newPhase should yield same X as oldPhase with oldRow.
        }));

        // Generate NEW Row 0 with newPhase
        const newRow = generateRow(0, newPhase);

        const combined = [...newRow, ...shifted];
        bubblesRef.current = combined;
        setBubbles(combined);
        setGridPhase(newPhase);
        gridPhaseRef.current = newPhase; // Sync immediately for next logic step
    };

    const checkGameOver = () => {
        // Line limit: canvas height - 100px roughly
        const limitY = canvasRef.current!.height - 100;

        if (bubblesRef.current.some(b => b.y + BUBBLE_RADIUS > limitY)) {
            gameOver();
        }
    };


    // --- Drawing ---

    // --- Drawing ---

    const draw = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Limit Line
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 100);
        ctx.lineTo(canvas.width, canvas.height - 100);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Aiming Guide (Always active unless game over)
        if (!isGameOver) {
            const startX = canvas.width / 2;
            const startY = canvas.height - 40;
            const mouseX = mousePosRef.current.x;
            const mouseY = mousePosRef.current.y;

            const dx = mouseX - startX;
            const dy = mouseY - startY;
            const angle = Math.atan2(dy, dx);

            if (angle < 0 && angle > -Math.PI) {
                ctx.save();
                ctx.translate(startX, startY);
                ctx.rotate(angle);

                ctx.beginPath();
                ctx.moveTo(20, 0);
                ctx.lineTo(100, 0);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(100, 0);
                ctx.lineTo(90, -5);
                ctx.lineTo(90, 5);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fill();

                ctx.restore();
            }
        }

        // Draw Bubbles
        bubblesRef.current.forEach(b => drawBubble(ctx, b));

        // Draw Projectiles
        projectilesRef.current.forEach(p => {
            drawBubble(ctx, {
                ...p as any,
                opacity: 1,
                scale: 1,
                id: Math.random(), row: -1, col: -1 // Dummy values
            });
        });

        // Draw "Launcher" bubbles
        drawBubble(ctx, {
            x: canvas.width / 2,
            y: canvas.height - 40,
            color: currentBubbleColorRef.current,
            type: 'normal',
            opacity: 1,
            scale: 1,
            id: -2, row: -1, col: -1
        });

        drawBubble(ctx, {
            x: canvas.width / 2 + 50,
            y: canvas.height - 30,
            color: nextBubbleColorRef.current,
            type: 'normal',
            opacity: 0.6,
            scale: 0.7,
            id: -3, row: -1, col: -1
        });

        // Floating Texts
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "yellow";
        ctx.textAlign = "center";
        floatingTexts.forEach(ft => {
            ctx.fillText(ft.value, ft.x, ft.y);
            ft.y -= 1;
            ft.life -= 0.02;
        });
        setFloatingTexts(prev => prev.filter(ft => ft.life > 0));
    };

    const drawBubble = (ctx: CanvasRenderingContext2D, b: Bubble) => {
        ctx.save();
        ctx.translate(b.x, b.y);
        const scale = b.exploding ? b.scale * 1.1 : b.scale;
        ctx.scale(scale, scale);

        const gradient = ctx.createRadialGradient(-BUBBLE_RADIUS / 3, -BUBBLE_RADIUS / 3, BUBBLE_RADIUS / 4, 0, 0, BUBBLE_RADIUS);
        gradient.addColorStop(0, b.color.shine);
        gradient.addColorStop(0.5, b.color.base);
        gradient.addColorStop(1, b.color.dark);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Flash effect for exploding
        if (b.exploding) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        }

        ctx.shadowBlur = 5;
        ctx.shadowColor = b.color.base;

        if (b.type === 'zoin') {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(0, 0, BUBBLE_RADIUS * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#92400e';
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("$", 0, 1);
        }

        ctx.restore();
    };

    // --- Interaction ---

    const handleMouseMove = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mousePosRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const shoot = (clientX: number, clientY: number) => {
        if (!isPlaying || isPaused || isGameOver) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const startX = canvas.width / 2;
        const startY = canvas.height - 40;

        const rect = canvas.getBoundingClientRect();
        const clickX = clientX - rect.left;
        const clickY = clientY - rect.top;

        const dx = clickX - startX;
        const dy = clickY - startY;
        const angle = Math.atan2(dy, dx);

        const speed = 12;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const newProjectile: Projectile = {
            x: startX,
            y: startY,
            vx,
            vy,
            color: currentBubbleColorRef.current,
            type: 'normal'
        };

        projectilesRef.current.push(newProjectile);

        // Immediate reload
        const newCurrent = nextBubbleColorRef.current;
        const newNext = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
        currentBubbleColorRef.current = newCurrent;
        nextBubbleColorRef.current = newNext;
        setCurrentBubbleColor(newCurrent);
        setNextBubbleColor(newNext);
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        shoot(e.clientX, e.clientY);
    };

    const handleCanvasTouch = (e: React.TouchEvent) => {
        e.preventDefault(); // Prevent scrolling
        const touch = e.changedTouches[0];
        shoot(touch.clientX, touch.clientY);
    };

    useEffect(() => {
        if (isPlaying) {
            requestRef.current = requestAnimationFrame(update);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isPlaying, isPaused]);


    return (
        <div className="min-h-screen bg-[var(--bg-deep)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#3b82f633_0%,_transparent_70%)] opacity-30 blur-3xl mix-blend-overlay" />

            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 w-full max-w-7xl z-10 relative">

                {/* Left Panel: Leaderboard */}
                <div className="hidden lg:block w-80 h-[600px] sticky top-8">
                    <Leaderboard game="bubble-shooter" />
                </div>

                {/* Center: Game Area */}
                <div className="flex flex-col items-center">

                    {/* Header */}
                    <div className="w-full max-w-md flex items-center justify-center gap-4 mb-4 relative">
                        <button
                            onClick={() => {
                                if (isPlaying && !isGameOver) {
                                    setIsPaused(true);
                                } else {
                                    navigate('/');
                                }
                            }}
                            className="absolute left-0 p-2 rounded-full hover:bg-white/10 text-[#92400e] transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">
                            Bubble <span className="text-[var(--blaze-neon)]">Shooter</span>
                        </h1>
                    </div>

                    {/* Stats */}
                    <div className="w-full max-w-lg grid grid-cols-2 gap-4 mb-4">
                        <div className="glass-panel p-3 rounded-xl flex flex-col items-center border border-white/10">
                            <span className="text-[10px] font-bold uppercase text-white/60 tracking-wider">Puntuación</span>
                            <span className="text-2xl font-black text-white font-mono">{score}</span>
                        </div>
                        <div className="glass-panel p-3 rounded-xl flex flex-col items-center border border-yellow-500/30">
                            <span className="text-[10px] font-bold uppercase text-yellow-400/80 tracking-wider">Zoins</span>
                            <span className="text-2xl font-black text-yellow-400 font-mono">{collectedZoins.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Game Container */}
                    <div className="relative bg-black/40 rounded-2xl p-2 border-2 border-white/10 shadow-2xl backdrop-blur-sm">
                        <canvas
                            ref={canvasRef}
                            width={480}
                            height={600}
                            className="bg-[#0f172a] rounded-xl cursor-crosshair touch-none"
                            onClick={handleCanvasClick}
                            onMouseMove={handleMouseMove}
                            onTouchStart={handleCanvasTouch}
                        />

                        {/* Ready Overlay */}
                        {!isPlaying && !isGameOver && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-xl backdrop-blur-sm z-50 gap-4">
                                <button
                                    onClick={initGame}
                                    className="btn-wood px-8 py-4 text-xl font-black uppercase rounded-xl hover:scale-105 transition-transform"
                                >
                                    ¡Jugar!
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold uppercase tracking-widest transition-colors"
                                >
                                    Volver al Menú
                                </button>
                            </div>
                        )}

                        {/* Game Over Overlay */}
                        {isGameOver && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 rounded-xl backdrop-blur-md z-50 p-6 text-center">
                                <h2 className="text-4xl font-black text-white uppercase italic mb-2">Game Over</h2>
                                <p className="text-white/60 mb-6">¡Las burbujas llegaron al límite!</p>

                                <div className="bg-white/10 p-4 rounded-xl w-full mb-6">
                                    <div className="text-xs uppercase font-bold text-white/50 mb-1">Puntuación Final</div>
                                    <div className="text-4xl font-mono font-black text-white">{score}</div>
                                    {collectedZoins > 0 && <div className="text-yellow-400 font-bold mt-2">+ {collectedZoins.toFixed(2)} Zoins</div>}
                                </div>

                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => navigate('/')}
                                        className="flex-1 py-3 rounded-xl font-bold uppercase bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    >
                                        Salir
                                    </button>
                                    <button
                                        onClick={initGame}
                                        className="flex-1 py-3 rounded-xl font-bold uppercase btn-wood hover:scale-105 transition-transform"
                                    >
                                        Reintentar
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                    <div className="mt-2 text-xs text-white/30 font-mono uppercase tracking-widest">
                        Disparos: {shotsFired} | Falta para bajar: {(score >= 2500 ? 4 : 5) - (shotsFired % (score >= 2500 ? 4 : 5))}
                    </div>
                </div>

                {/* Spacer for Right Side */}
                <div className="hidden lg:block w-80"></div>
            </div>

            {/* Pause Modal */}
            {isPaused && (
                <div className="absolute inset-0 z-50 bg-[var(--bg-deep)]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="glass-panel w-full max-w-sm rounded-2xl p-8 text-center shadow-2xl border border-white/20">
                        <h2 className="text-3xl font-black italic uppercase text-white mb-2 drop-shadow-sm">¡Juego Pausado!</h2>
                        <p className="text-white/80 mb-8 text-sm">Si sales ahora, se guardará tu puntuación actual.</p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setIsPaused(false)}
                                className="btn-wood w-full py-4 text-xl font-black uppercase rounded-xl hover:scale-105 transition-transform"
                            >
                                Seguir Jugando
                            </button>
                            <button
                                onClick={() => {
                                    submitScore();
                                    navigate('/');
                                }}
                                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold uppercase py-4 rounded-xl transition-all active:scale-95 text-sm"
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

export default BubbleShooterPage;
