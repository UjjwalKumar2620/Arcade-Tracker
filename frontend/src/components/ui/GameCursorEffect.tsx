// ============================================================
// Arcade Tracker — Retro Game Cursor Effect
// Pixel-style particles with retro shapes (squares, crosses, dots)
// ============================================================
import React, { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  shape: 'pixel' | 'cross' | 'diamond' | 'dot';
  rotation: number;
  rotSpeed: number;
}

// Bold dark gaming colors — no pink
const COLORS = ['#0066FF', '#00FFE5', '#39FF14', '#FFB800', '#00BFFF', '#7C3AED', '#4D9AFF'];

export function GameCursorEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mousePos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef<number>(0);
  const lastSpawn = useRef(0);

  const SHAPES: Particle['shape'][] = ['pixel', 'cross', 'diamond', 'dot'];

  const spawnParticle = useCallback((x: number, y: number) => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.5;
    const maxLife = 25 + Math.random() * 20;
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    particles.current.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      size: 2 + Math.random() * 5,
      alpha: 0.9,
      color,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.8,
      life: 0,
      maxLife,
      shape,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const drawPixel = (ctx: CanvasRenderingContext2D, p: Particle, size: number) => {
      // Crisp pixel square
      ctx.fillRect(-size / 2, -size / 2, size, size);
    };

    const drawCross = (ctx: CanvasRenderingContext2D, _p: Particle, size: number) => {
      const t = size * 0.3;
      ctx.fillRect(-size / 2, -t / 2, size, t);
      ctx.fillRect(-t / 2, -size / 2, t, size);
    };

    const drawDiamond = (ctx: CanvasRenderingContext2D, _p: Particle, size: number) => {
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, 0);
      ctx.lineTo(0, size / 2);
      ctx.lineTo(-size / 2, 0);
      ctx.closePath();
      ctx.fill();
    };

    const drawDot = (ctx: CanvasRenderingContext2D, _p: Particle, size: number) => {
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();
      if (now - lastSpawn.current > 25 && mousePos.current.x > 0) {
        spawnParticle(mousePos.current.x, mousePos.current.y);
        if (Math.random() > 0.4) {
          spawnParticle(mousePos.current.x, mousePos.current.y);
        }
        lastSpawn.current = now;
      }

      const alive: Particle[] = [];
      for (const p of particles.current) {
        p.life++;
        if (p.life >= p.maxLife) continue;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.rotation += p.rotSpeed;

        const progress = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - progress);
        const currentSize = p.size * (1 - progress * 0.5);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // Outer glow
        ctx.globalAlpha = currentAlpha * 0.2;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        const drawFn =
          p.shape === 'pixel' ? drawPixel :
          p.shape === 'cross' ? drawCross :
          p.shape === 'diamond' ? drawDiamond :
          drawDot;

        drawFn(ctx, p, currentSize * 2.5);

        // Core particle
        ctx.shadowBlur = 4;
        ctx.globalAlpha = currentAlpha;
        drawFn(ctx, p, currentSize);

        ctx.restore();
        alive.push(p);
      }
      particles.current = alive;

      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameId.current);
    };
  }, [spawnParticle]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
