import { useEffect, useRef } from 'react';

export const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star configuration
    const stars: Array<{
      x: number;
      y: number;
      z: number;
      size: number;
      opacity: number;
      speed: number;
    }> = [];

    const numStars = 200;
    const maxDepth = 1000;

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * maxDepth,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.5 + 0.1
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      stars.forEach(star => {
        // Move star towards camera
        star.z -= star.speed;

        // Reset star if it's too close
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
          star.z = maxDepth;
        }

        // Calculate screen position
        const x = centerX + (star.x / star.z) * 300;
        const y = centerY + (star.y / star.z) * 300;

        // Calculate size and opacity based on distance
        const size = star.size * (1 - star.z / maxDepth) * 3;
        const opacity = star.opacity * (1 - star.z / maxDepth);

        // Only draw if star is on screen
        if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
          ctx.globalAlpha = opacity;
          ctx.fillStyle = `hsl(${200 + Math.random() * 60}, 70%, 80%)`;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(size, 0.5), 0, Math.PI * 2);
          ctx.fill();

          // Add slight glow for larger stars
          if (size > 1) {
            ctx.globalAlpha = opacity * 0.3;
            ctx.beginPath();
            ctx.arc(x, y, size * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 bg-gradient-to-b from-gray-900 via-blue-900 to-indigo-900"
      style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b, #334155)' }}
    />
  );
};