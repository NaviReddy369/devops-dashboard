import React, { useEffect, useRef } from 'react';
import { Brain, Network, Zap, Sparkles } from 'lucide-react';

const FuturisticAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 50;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      opacity: number;
      pulse: number;

      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        const colors = ['#a855f7', '#6366f1', '#ec4899', '#8b5cf6'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.3;
        this.pulse = Math.random() * Math.PI * 2;
      }

      update(width: number, height: number) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        this.pulse += 0.02;
        this.opacity = 0.3 + Math.sin(this.pulse) * 0.2;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const resizeCanvas = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.globalAlpha = (150 - distance) / 150 * 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Central Icon Cluster */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-purple-400/30 rounded-full animate-spin-slow">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-400 rounded-full blur-sm"></div>
            </div>
          </div>

          {/* Middle pulsing ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 border border-indigo-400/40 rounded-full animate-pulse">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-400 rounded-full"></div>
            </div>
          </div>

          {/* Central icon */}
          <div className="relative w-20 h-20 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full backdrop-blur-xl border border-purple-400/30 shadow-2xl">
            <div className="relative">
              <Brain className="w-10 h-10 text-purple-300 animate-pulse" />
              <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl animate-ping"></div>
            </div>
          </div>

          {/* Orbiting icons */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-16 animate-orbit-slow">
              <div className="w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded-full border border-purple-400/40 backdrop-blur-sm">
                <Network className="w-4 h-4 text-purple-300" />
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-16 animate-orbit-slow-reverse">
              <div className="w-8 h-8 flex items-center justify-center bg-indigo-500/20 rounded-full border border-indigo-400/40 backdrop-blur-sm">
                <Zap className="w-4 h-4 text-indigo-300" />
              </div>
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 animate-orbit">
              <div className="w-8 h-8 flex items-center justify-center bg-pink-500/20 rounded-full border border-pink-400/40 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-pink-300" />
              </div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 animate-orbit-reverse">
              <div className="w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded-full border border-purple-400/40 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-purple-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glow effects */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
};

export default FuturisticAnimation;

