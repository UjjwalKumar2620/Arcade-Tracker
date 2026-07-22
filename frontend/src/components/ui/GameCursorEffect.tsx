// ============================================================
// Arcade Tracker — Game-themed Cursor Trail Effect
// Creates glowing arcade-style particles that trail the mouse.
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
}

const COLORS = ['#8B5CF6', '#A855F7', '#3B82F6', '#60A5FA', '#FBBC04', '#34A853', '#EC4899'];

export function GameCursorEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mousePos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef<number>(0);
  const lastSpawn = useRef(0);

  const spawnParticle = useCallback((x: number, y: number) => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 1.2;
    const maxLife = 30 + Math.random() * 25;
    particles.current.push({
      x,
      y,
      size: 2 + Math.random() * 4,
      alpha: 0.8 + Math.random() * 0.2,
      color,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.5,
      life: 0,
      maxLife,
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

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();
      // Spawn new particles at mouse position (~every 30ms)
      if (now - lastSpawn.current > 30 && mousePos.current.x > 0) {
        spawnParticle(mousePos.current.x, mousePos.current.y);
        if (Math.random() > 0.5) {
          spawnParticle(
            mousePos.current.x + (Math.random() - 0.5) * 8,
            mousePos.current.y + (Math.random() - 0.5) * 8,
          );
        }
        lastSpawn.current = now;
      }

      // Update & draw particles
      const alive: Particle[] = [];
      for (const p of particles.current) {
        p.life++;
        if (p.life >= p.maxLife) continue;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // gentle gravity

        const progress = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - progress);
        const currentSize = p.size * (1 - progress * 0.6);

        // Glow
        ctx.save();
        ctx.globalAlpha = currentAlpha * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Core
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Star sparkle on some particles
        if (p.size > 4 && progress < 0.4) {
          ctx.globalAlpha = currentAlpha * 0.6;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.8;
          const armLen = currentSize * 1.8;
          for (let a = 0; a < 4; a++) {
            const angle = (a * Math.PI) / 4 + progress * Math.PI;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(
              p.x + Math.cos(angle) * armLen,
              p.y + Math.sin(angle) * armLen,
            );
            ctx.stroke();
          }
        }

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
