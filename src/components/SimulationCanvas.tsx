
import { useRef, useEffect } from 'react';

interface SimulationCanvasProps {
  isRunning: boolean;
  simSpeed: number;
  radarRange: number;
}

const SimulationCanvas = ({ isRunning, simSpeed, radarRange }: SimulationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spacecraftRef = useRef<{ x: number, y: number, vx: number, vy: number }>({ 
    x: 0, y: 0, vx: 0, vy: 0 
  });
  const debrisRef = useRef<Array<{ x: number, y: number, vx: number, vy: number, size: number }>>([]);
  const frameIdRef = useRef<number>(0);
  
  // Initialize simulation
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match parent
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    
    // Call once and add listener
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Reset spacecraft to center
    const resetSpacecraft = () => {
      spacecraftRef.current = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: 0,
        vy: 0
      };
    };
    
    // Generate initial debris
    const generateDebris = () => {
      const count = 25; // Number of debris
      debrisRef.current = [];
      
      for (let i = 0; i < count; i++) {
        // Generate debris in a circle around the spacecraft
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 500; // Between 100 and 600 pixels from center
        
        debrisRef.current.push({
          x: canvas.width / 2 + Math.cos(angle) * distance,
          y: canvas.height / 2 + Math.sin(angle) * distance,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1 // Size between 1-3 pixels
        });
      }
    };
    
    resetSpacecraft();
    generateDebris();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(frameIdRef.current);
    };
  }, []);
  
  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !isRunning) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let lastTime = 0;
    
    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = (currentTime - lastTime) * simSpeed * 0.06;
      lastTime = currentTime;
      
      // Clear canvas
      ctx.fillStyle = 'rgba(10, 15, 30, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      drawGrid(ctx, canvas);
      
      // Update and draw spacecraft
      updateSpacecraft(deltaTime);
      drawSpacecraft(ctx);
      
      // Draw radar range
      drawRadarRange(ctx);
      
      // Update and draw debris
      updateDebris(deltaTime);
      drawDebris(ctx);
      
      // Check for collisions or close calls
      checkCollisions();
      
      // Continue animation loop
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      // Draw grid lines
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(30, 58, 95, 0.3)';
      ctx.lineWidth = 1;
      
      const gridSize = 50;
      const offsetX = spacecraftRef.current.x % gridSize;
      const offsetY = spacecraftRef.current.y % gridSize;
      
      // Vertical lines
      for (let x = offsetX; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      
      // Horizontal lines
      for (let y = offsetY; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      
      ctx.stroke();
      
      // Draw center reference
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(30, 58, 95, 0.5)';
      ctx.lineWidth = 1;
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 300, 0, Math.PI * 2);
      ctx.stroke();
    };
    
    const updateSpacecraft = (deltaTime: number) => {
      const spacecraft = spacecraftRef.current;
      
      // Apply some drag
      spacecraft.vx *= 0.99;
      spacecraft.vy *= 0.99;
      
      // Random small perturbations to make it look alive
      if (Math.random() < 0.05) {
        spacecraft.vx += (Math.random() - 0.5) * 0.01;
        spacecraft.vy += (Math.random() - 0.5) * 0.01;
      }
      
      // Update position
      spacecraft.x += spacecraft.vx * deltaTime;
      spacecraft.y += spacecraft.vy * deltaTime;
    };
    
    const drawSpacecraft = (ctx: CanvasRenderingContext2D) => {
      const { x, y } = spacecraftRef.current;
      
      // Draw spacecraft
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#05e9d1'; // Cyan spacecraft
      ctx.fill();
      
      // Draw glow
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(5, 233, 209, 0.3)';
      ctx.fill();
    };
    
    const drawRadarRange = (ctx: CanvasRenderingContext2D) => {
      const { x, y } = spacecraftRef.current;
      const radius = radarRange * 10; // Scale radar range
      
      // Draw radar circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(5, 233, 209, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw radar sweep
      const sweepAngle = (currentTime / 1000) % (Math.PI * 2);
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, radius, sweepAngle, sweepAngle + Math.PI / 8);
      ctx.closePath();
      ctx.fillStyle = 'rgba(5, 233, 209, 0.1)';
      ctx.fill();
    };
    
    const updateDebris = (deltaTime: number) => {
      debrisRef.current.forEach(debris => {
        // Update position
        debris.x += debris.vx * deltaTime;
        debris.y += debris.vy * deltaTime;
        
        // Wrap around screen edges
        const buffer = 100;
        if (debris.x < -buffer) debris.x = canvas.width + buffer;
        if (debris.x > canvas.width + buffer) debris.x = -buffer;
        if (debris.y < -buffer) debris.y = canvas.height + buffer;
        if (debris.y > canvas.height + buffer) debris.y = -buffer;
      });
    };
    
    const drawDebris = (ctx: CanvasRenderingContext2D) => {
      const { x: sx, y: sy } = spacecraftRef.current;
      const radarRangePixels = radarRange * 10;
      
      debrisRef.current.forEach(debris => {
        // Calculate distance to spacecraft
        const dx = debris.x - sx;
        const dy = debris.y - sy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Determine if within radar range
        const inRange = distance <= radarRangePixels;
        
        // Draw debris
        ctx.beginPath();
        ctx.arc(debris.x, debris.y, debris.size, 0, Math.PI * 2);
        
        if (inRange) {
          // Within radar range - more visible
          ctx.fillStyle = 'rgba(255, 191, 36, 0.8)';
          ctx.fill();
          
          // Draw glow for detected debris
          ctx.beginPath();
          ctx.arc(debris.x, debris.y, debris.size + 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 191, 36, 0.3)';
          ctx.fill();
          
          // Draw line to spacecraft for close debris
          if (distance < radarRangePixels * 0.5) {
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(debris.x, debris.y);
            ctx.strokeStyle = 'rgba(255, 191, 36, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Draw distance text
            const distanceKm = Math.floor(distance / 10); // Scale to km for display
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '10px monospace';
            ctx.fillText(`${distanceKm} km`, (sx + debris.x) / 2, (sy + debris.y) / 2 - 5);
          }
        } else {
          // Outside radar range - dimmer
          ctx.fillStyle = 'rgba(150, 150, 150, 0.3)';
          ctx.fill();
        }
      });
    };
    
    const checkCollisions = () => {
      const { x, y } = spacecraftRef.current;
      const collisionThreshold = 15;
      
      debrisRef.current.forEach(debris => {
        const dx = debris.x - x;
        const dy = debris.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < collisionThreshold) {
          // Collision detected - in a real app you'd handle this with more sophisticated logic
          console.log('Collision detected!');
          
          // Visual feedback - flash red
          if (ctx) {
            ctx.fillStyle = 'rgba(234, 56, 76, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }
      });
    };
    
    // Start animation loop
    frameIdRef.current = requestAnimationFrame(animate);
    
    // Cleanup on unmount or when dependencies change
    return () => cancelAnimationFrame(frameIdRef.current);
  }, [isRunning, simSpeed, radarRange]);
  
  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
};

export default SimulationCanvas;
