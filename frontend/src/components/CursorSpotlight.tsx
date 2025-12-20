import React, { useEffect, useRef } from 'react';

const finePointerMediaQuery = '(pointer: fine)';
const reducedMotionMediaQuery = '(prefers-reduced-motion: reduce)';
const maxGlyphs = 100;
const maxNodes = 40;
const maxClickPulses = 6;
const emitIntervalMs = 150;
const minEmitDistance = 24;

// Rainbow colors for vibrant trail effect
const rainbowColors = [
    'rgba(255, 0, 0,',      // Red
    'rgba(255, 127, 0,',    // Orange
    'rgba(255, 255, 0,',    // Yellow
    'rgba(0, 255, 0,',      // Green
    'rgba(0, 255, 255,',    // Cyan
    'rgba(0, 127, 255,',    // Light Blue
    'rgba(139, 0, 255,',    // Purple
    'rgba(255, 0, 255,',    // Magenta
    'rgba(255, 105, 180,',  // Hot Pink
    'rgba(50, 205, 50,',    // Lime Green
];

// Fun colorful emojis for extra flair
const trailEmojis = ['✨', '🌟', '💫', '⭐', '🔥', '💖', '🌈', '🎉', '🎊', '💜', '💙', '💚', '💛', '🧡', '❤️', '🦋', '🌸', '🍀'];

type BinaryGlyph = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    age: number;
    maxAge: number;
    value: string;
    sway: number;
    turbulence: number;
    phase: number;
    colorIndex: number;
    isEmoji: boolean;
};

type RiverNode = {
    x: number;
    y: number;
    age: number;
    maxAge: number;
    width: number;
    jitterX: number;
    jitterY: number;
};

type ClickPulse = {
    x: number;
    y: number;
    age: number;
    maxAge: number;
    radius: number;
    lineWidth: number;
};

const CursorSpotlight: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || typeof window === 'undefined') {
            return;
        }

        if (typeof window.matchMedia !== 'function') {
            return;
        }

        const finePointer = window.matchMedia(finePointerMediaQuery);
        const reducedMotion = window.matchMedia(reducedMotionMediaQuery);

        if (!finePointer.matches || reducedMotion.matches) {
            return;
        }

        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        const glyphs: BinaryGlyph[] = [];
        const riverNodes: RiverNode[] = [];
        const clickPulses: ClickPulse[] = [];

        let viewportWidth = window.innerWidth;
        let viewportHeight = window.innerHeight;
        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        let animationFrameId: number | null = null;
        let lastFrameTs = performance.now();

        let previousX = viewportWidth * 0.5;
        let previousY = viewportHeight * 0.5;
        let lastPointerTs = 0;
        let lastEmissionTs = 0;

        const pickColorIndex = (): number => Math.floor(Math.random() * rainbowColors.length);
        const pickGlyphValue = (): { value: string; isEmoji: boolean } => {
            // Always spawn emojis
            return { value: trailEmojis[Math.floor(Math.random() * trailEmojis.length)], isEmoji: true };
        };

        const setupCanvas = () => {
            viewportWidth = window.innerWidth;
            viewportHeight = window.innerHeight;
            dpr = Math.min(window.devicePixelRatio || 1, 2);

            canvas.width = Math.floor(viewportWidth * dpr);
            canvas.height = Math.floor(viewportHeight * dpr);
            canvas.style.width = `${viewportWidth}px`;
            canvas.style.height = `${viewportHeight}px`;
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            context.textAlign = 'center';
            context.textBaseline = 'middle';
        };

        const startAnimationLoop = () => {
            if (animationFrameId !== null) {
                return;
            }
            lastFrameTs = performance.now();
            animationFrameId = window.requestAnimationFrame(animate);
        };

        const emitFromPath = (fromX: number, fromY: number, toX: number, toY: number, energy: number) => {
            const deltaX = toX - fromX;
            const deltaY = toY - fromY;
            const distance = Math.hypot(deltaX, deltaY);
            if (distance < minEmitDistance) {
                return;
            }

            const directionX = deltaX / distance;
            const directionY = deltaY / distance;
            const normalX = -directionY;
            const normalY = directionX;

            const glyphCount = Math.min(4, Math.max(1, Math.floor(distance * 0.02 + energy * 0.8)));
            for (let i = 0; i < glyphCount; i++) {
                const progress = (i + Math.random()) / glyphCount;
                const spread = (Math.random() - 0.5) * (5 + energy * 7);
                const spawnX = fromX + deltaX * progress + normalX * spread;
                const spawnY = fromY + deltaY * progress + normalY * spread;
                const speed = 0.6 + Math.random() * 1 + energy * 1.2;
                const lateral = (Math.random() - 0.5) * 0.9;

                const { value, isEmoji } = pickGlyphValue();
                glyphs.push({
                    x: spawnX,
                    y: spawnY,
                    vx: directionX * speed + normalX * lateral,
                    vy: directionY * speed + normalY * lateral,
                    size: isEmoji ? 12 + Math.random() * 6 : 7 + Math.random() * 4,
                    age: 0,
                    maxAge: 22 + Math.random() * 22 + energy * 10,
                    value,
                    sway: (Math.random() - 0.5) * 0.22,
                    turbulence: 0.2 + Math.random() * 0.4,
                    phase: Math.random() * Math.PI * 2,
                    colorIndex: pickColorIndex(),
                    isEmoji,
                });
            }


        };

        const emitClickBurst = (x: number, y: number) => {
            const burstGlyphCount = 5 + Math.floor(Math.random() * 4);
            for (let i = 0; i < burstGlyphCount; i++) {
                const angle = (i / burstGlyphCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
                const speed = 1 + Math.random() * 1.8;

                const { value, isEmoji } = pickGlyphValue();
                glyphs.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed * 0.85,
                    size: isEmoji ? 14 + Math.random() * 6 : 7 + Math.random() * 4,
                    age: 0,
                    maxAge: 26 + Math.random() * 18,
                    value,
                    sway: (Math.random() - 0.5) * 0.28,
                    turbulence: 0.25 + Math.random() * 0.45,
                    phase: Math.random() * Math.PI * 2,
                    colorIndex: pickColorIndex(),
                    isEmoji,
                });
            }

            clickPulses.push({
                x,
                y,
                age: 0,
                maxAge: 34,
                radius: 12 + Math.random() * 4,
                lineWidth: 2 + Math.random() * 0.8,
            });

            if (glyphs.length > maxGlyphs) {
                glyphs.splice(0, glyphs.length - maxGlyphs);
            }
            if (clickPulses.length > maxClickPulses) {
                clickPulses.splice(0, clickPulses.length - maxClickPulses);
            }
        };

        const drawRiverNodes = () => {
            if (riverNodes.length < 2) {
                return;
            }

            context.save();
            context.lineCap = 'round';
            context.lineJoin = 'round';

            for (let i = 1; i < riverNodes.length; i++) {
                const previousNode = riverNodes[i - 1];
                const currentNode = riverNodes[i];
                const previousLife = 1 - previousNode.age / previousNode.maxAge;
                const currentLife = 1 - currentNode.age / currentNode.maxAge;
                if (previousLife <= 0 || currentLife <= 0) {
                    continue;
                }

                const life = Math.min(previousLife, currentLife);
                const startX = previousNode.x + previousNode.jitterX * (1 - life * 0.35);
                const startY = previousNode.y + previousNode.jitterY * (1 - life * 0.35);
                const endX = currentNode.x + currentNode.jitterX * (1 - life * 0.35);
                const endY = currentNode.y + currentNode.jitterY * (1 - life * 0.35);
                const controlX = (startX + endX) * 0.5 + (currentNode.jitterY - previousNode.jitterX) * 0.6;
                const controlY = (startY + endY) * 0.5 + (currentNode.jitterX - previousNode.jitterY) * 0.6;

                // Use rainbow colors for the trail lines
                const colorIndex = i % rainbowColors.length;
                context.strokeStyle = `${rainbowColors[colorIndex]} ${0.15 + life * 0.25})`;
                context.lineWidth = currentNode.width * life;
                context.beginPath();
                context.moveTo(startX, startY);
                context.quadraticCurveTo(controlX, controlY, endX, endY);
                context.stroke();
            }

            context.restore();
        };

        const drawClickPulses = (deltaMultiplier: number) => {
            for (let i = clickPulses.length - 1; i >= 0; i--) {
                const pulse = clickPulses[i];
                pulse.age += deltaMultiplier;
                if (pulse.age >= pulse.maxAge) {
                    clickPulses.splice(i, 1);
                    continue;
                }

                const life = 1 - pulse.age / pulse.maxAge;
                const radius = pulse.radius + pulse.age * 1.9;
                const colorIndex = i % rainbowColors.length;
                context.strokeStyle = `${rainbowColors[colorIndex]} ${life * 0.5})`;
                context.lineWidth = pulse.lineWidth * (0.8 + life * 0.3);
                context.beginPath();
                context.arc(pulse.x, pulse.y, radius, 0, Math.PI * 2);
                context.stroke();
            }
        };

        const drawGlyphs = (deltaMultiplier: number) => {
            for (let i = glyphs.length - 1; i >= 0; i--) {
                const glyph = glyphs[i];
                glyph.age += deltaMultiplier;
                if (glyph.age >= glyph.maxAge) {
                    glyphs.splice(i, 1);
                    continue;
                }

                const driftOscillation = Math.sin(glyph.phase + glyph.age * 0.22) * glyph.turbulence;
                const liftOscillation = Math.cos(glyph.phase * 0.7 + glyph.age * 0.18) * glyph.turbulence;

                glyph.vx += (glyph.sway * 0.015 + driftOscillation * 0.02) * deltaMultiplier;
                glyph.vy += (0.008 + liftOscillation * 0.01) * deltaMultiplier;
                glyph.x += glyph.vx * 1.5 * deltaMultiplier;
                glyph.y += glyph.vy * 1.5 * deltaMultiplier;
                glyph.vx *= 0.986;
                glyph.vy *= 0.988;

                if (glyph.x < -40 || glyph.y < -40 || glyph.x > viewportWidth + 40 || glyph.y > viewportHeight + 40) {
                    glyphs.splice(i, 1);
                    continue;
                }

                const life = 1 - glyph.age / glyph.maxAge;
                const alpha = life * life * 0.82;
                const size = glyph.size * (0.88 + life * 0.18);
                if (glyph.isEmoji) {
                    context.font = `${size}px sans-serif`;
                    context.fillText(glyph.value, glyph.x, glyph.y);
                } else {
                    context.font = `${size}px "JetBrains Mono", monospace`;
                    context.fillStyle = `${rainbowColors[glyph.colorIndex]} ${alpha})`;
                    context.fillText(glyph.value, glyph.x, glyph.y);
                }
            }
        };

        const animate = (timestamp: number) => {
            const elapsedMs = timestamp - lastFrameTs;
            lastFrameTs = timestamp;
            const deltaMultiplier = Math.min(2.4, Math.max(0.7, elapsedMs / 16.67));

            context.clearRect(0, 0, viewportWidth, viewportHeight);

            for (let i = riverNodes.length - 1; i >= 0; i--) {
                riverNodes[i].age += deltaMultiplier;
                if (riverNodes[i].age >= riverNodes[i].maxAge) {
                    riverNodes.splice(i, 1);
                }
            }

            drawClickPulses(deltaMultiplier);
            drawGlyphs(deltaMultiplier);

            const isActive = timestamp - lastPointerTs < 170;
            if (glyphs.length > 0 || riverNodes.length > 0 || clickPulses.length > 0 || isActive) {
                animationFrameId = window.requestAnimationFrame(animate);
                return;
            }

            animationFrameId = null;
        };

        const onPointerMove = (event: PointerEvent) => {
            const nextX = event.clientX;
            const nextY = event.clientY;
            const now = performance.now();

            if (lastPointerTs === 0) {
                previousX = nextX;
                previousY = nextY;
                lastPointerTs = now;
                startAnimationLoop();
                return;
            }

            const elapsed = Math.max(8, now - lastPointerTs);
            const distance = Math.hypot(nextX - previousX, nextY - previousY);
            const velocity = distance / elapsed;
            const energy = Math.min(1.6, velocity * 2.2);

            const shouldEmit = now - lastEmissionTs >= emitIntervalMs || distance >= 30;
            if (shouldEmit) {
                emitFromPath(previousX, previousY, nextX, nextY, energy);
                lastEmissionTs = now;
                startAnimationLoop();
            }

            previousX = nextX;
            previousY = nextY;
            lastPointerTs = now;
        };

        const onPointerDown = (event: PointerEvent) => {
            emitClickBurst(event.clientX, event.clientY);
            lastPointerTs = performance.now();
            startAnimationLoop();
        };

        const onMouseOut = (event: MouseEvent) => {
            if (event.relatedTarget === null) {
                lastPointerTs = 0;
            }
        };

        const onBlur = () => {
            lastPointerTs = 0;
        };

        const onResize = () => {
            setupCanvas();
            startAnimationLoop();
        };

        setupCanvas();
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerdown', onPointerDown, { passive: true });
        window.addEventListener('mouseout', onMouseOut);
        window.addEventListener('blur', onBlur);
        window.addEventListener('resize', onResize);

        return () => {
            if (animationFrameId !== null) {
                window.cancelAnimationFrame(animationFrameId);
            }
            context.clearRect(0, 0, viewportWidth, viewportHeight);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('mouseout', onMouseOut);
            window.removeEventListener('blur', onBlur);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return <canvas ref={canvasRef} aria-hidden className="cursor-spotlight" />;
};

export default CursorSpotlight;
