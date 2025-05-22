import { useRef, useEffect, useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimulationCanvasProps {
  isRunning: boolean;
  simSpeed: number;
  radarRange: number;
  aiMode: string;
  onDebrisCountChange: (count: number) => void;
  onCollisionRiskChange: (risk: 'Low' | 'Medium' | 'High', nearbyCount: number) => void;
  navigationControls: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
}

const SimulationCanvas = ({ 
  isRunning, 
  simSpeed, 
  radarRange, 
  aiMode, 
  onDebrisCountChange, 
  onCollisionRiskChange,
  navigationControls 
}: SimulationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spacecraftRef = useRef<{ x: number, y: number, vx: number, vy: number }>({ 
    x: 0, y: 0, vx: 0, vy: 0 
  });
  const debrisRef = useRef<Array<{ x: number, y: number, vx: number, vy: number, size: number }>>([]);
  const frameIdRef = useRef<number>(0);
  const lastNotificationTimeRef = useRef<number>(0);
  const lastYellowNotificationTimeRef = useRef<number>(0);
  
  // View controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{x: number, y: number}>({x: 0, y: 0});
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{x: number, y: number}>({x: 0, y: 0});
  
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
  
  // Mouse event handlers for pan and zoom
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;
        
        setPanOffset(prev => ({
          x: prev.x + dx / zoomLevel,
          y: prev.y + dy / zoomLevel
        }));
        
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      canvas.style.cursor = 'grab';
    };
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const delta = -Math.sign(e.deltaY) * 0.1;
      const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta));
      
      // Calculate cursor position relative to canvas
      const rect = canvas.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      
      // Calculate where the cursor is in the scene before zooming
      const sceneX = cursorX / zoomLevel - panOffset.x;
      const sceneY = cursorY / zoomLevel - panOffset.y;
      
      // Calculate new offsets to zoom towards cursor position
      const newPanOffsetX = -sceneX + cursorX / newZoom;
      const newPanOffsetY = -sceneY + cursorY / newZoom;
      
      setPanOffset({
        x: newPanOffsetX,
        y: newPanOffsetY
      });
      
      setZoomLevel(newZoom);
    };
    
    // Enable grab cursor by default
    canvas.style.cursor = 'grab';
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [zoomLevel]);
  
  // Update visible debris count and collision risk based on radar range
  useEffect(() => {
    if (!isRunning) return;
    
    const updateDebrisAndRisk = () => {
      const { x: sx, y: sy } = spacecraftRef.current;
      const radarRangePixels = radarRange * 10;
      
      // Calculate distances to all debris
      const debrisDistances = debrisRef.current.map(debris => {
        const dx = debris.x - sx;
        const dy = debris.y - sy;
        return Math.sqrt(dx * dx + dy * dy);
      });
      
      // Count debris within radar range
      const debrisInRange = debrisDistances.filter(distance => distance <= radarRangePixels).length;
      
      // Count very close debris (within different ranges)
      // Use percentages of radar range to determine critical and close ranges
      const criticalRangePixels = Math.min(50, radarRangePixels * 0.3); // Either 50px or 30% of radar range
      const closeRangePixels = Math.min(100, radarRangePixels * 0.6); // Either 100px or 60% of radar range
      
      const criticalDebris = debrisDistances.filter(distance => distance <= criticalRangePixels).length;
      const closeDebris = debrisDistances.filter(distance => distance > criticalRangePixels && distance <= closeRangePixels).length;
      const mediumDebris = debrisDistances.filter(distance => distance > closeRangePixels && distance <= radarRangePixels).length;
      
      // Determine risk level
      let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
      if (criticalDebris > 0) {
        riskLevel = 'High';
      } else if (closeDebris > 0) {
        riskLevel = 'Medium';
      } else if (mediumDebris > 1) {
        riskLevel = 'Medium';
      }
      
      // Check for critical proximity
      const currentTime = Date.now();
      if (criticalDebris > 0 && currentTime - lastNotificationTimeRef.current > 5000) {
        // Show danger notification if debris is within critical range
        toast("CRITICAL PROXIMITY ALERT", {
          description: `Space debris detected at dangerous distance (within ${Math.round(criticalRangePixels/10)}km)!`,
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          duration: 10000,
          position: "top-left", // Changed from default to top-left
          style: { 
            backgroundColor: '#222', 
            border: '1px solid #ea384c',
            color: 'white' 
          },
          action: {
            label: <X className="h-4 w-4" />,
            onClick: () => console.log("Alert dismissed")
          }
        });
        lastNotificationTimeRef.current = currentTime;
      }
      
      // Check for medium proximity
      if (closeDebris > 0 && currentTime - lastYellowNotificationTimeRef.current > 8000) {
        // Show warning notification if debris is within close range
        toast("PROXIMITY WARNING", {
          description: `Space debris approaching within ${Math.round(closeRangePixels/10)}km - maintain vigilance`,
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          duration: 8000,
          position: "top-left", // Changed from default to top-left
          style: { 
            backgroundColor: '#222', 
            border: '1px solid #F97316',
            color: 'white' 
          },
          action: {
            label: <X className="h-4 w-4" />,
            onClick: () => console.log("Warning dismissed")
          }
        });
        lastYellowNotificationTimeRef.current = currentTime;
      }
      
      // Update parent component
      onDebrisCountChange(debrisInRange);
      onCollisionRiskChange(riskLevel, criticalDebris + closeDebris);
    };
    
    // Set up interval for updates
    const intervalId = setInterval(updateDebrisAndRisk, 500);
    
    return () => clearInterval(intervalId);
  }, [isRunning, radarRange, onDebrisCountChange, onCollisionRiskChange]);
  
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save the current state before applying transformations
      ctx.save();
      
      // Apply zoom and pan transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-canvas.width / 2 + panOffset.x, -canvas.height / 2 + panOffset.y);
      
      // Translate to keep spacecraft centered (adjusted for zoom and pan)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const spacecraft = spacecraftRef.current;
      
      // Fill background before translation
      ctx.fillStyle = 'rgba(10, 15, 30, 0.2)';
      ctx.fillRect(
        -panOffset.x - centerX / zoomLevel, 
        -panOffset.y - centerY / zoomLevel, 
        canvas.width / zoomLevel, 
        canvas.height / zoomLevel
      );
      
      // Translate the entire canvas so the spacecraft stays centered
      ctx.translate(
        centerX - spacecraft.x,
        centerY - spacecraft.y
      );
      
      // Draw grid (the grid now moves relative to spacecraft)
      drawGrid(ctx, canvas, spacecraft.x, spacecraft.y);
      
      // Apply navigation controls and AI logic
      applyNavigationAndAI(deltaTime);
      
      // Update spacecraft velocity and position
      updateSpacecraft(deltaTime);
      
      // Draw spacecraft at center
      drawSpacecraft(ctx);
      
      // Draw radar range
      drawRadarRange(ctx, currentTime);
      
      // Update and draw debris
      updateDebris(deltaTime);
      drawDebris(ctx);
      
      // Check for collisions or close calls
      checkCollisions();
      
      // Restore the canvas state
      ctx.restore();
      
      // Draw zoom level indicator
      ctx.font = '12px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(`Zoom: ${zoomLevel.toFixed(1)}x`, 10, 20);
      
      // Continue animation loop
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, spacecraftX: number, spacecraftY: number) => {
      // Draw grid lines
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(30, 58, 95, 0.3)';
      ctx.lineWidth = 1;
      
      const gridSize = 50;
      const viewportWidth = canvas.width / zoomLevel;
      const viewportHeight = canvas.height / zoomLevel;
      
      // Calculate grid boundaries based on the visible area, adjusted for zoom
      const startX = Math.floor((spacecraftX - viewportWidth) / gridSize) * gridSize;
      const endX = Math.ceil((spacecraftX + viewportWidth) / gridSize) * gridSize;
      const startY = Math.floor((spacecraftY - viewportHeight) / gridSize) * gridSize;
      const endY = Math.ceil((spacecraftY + viewportHeight) / gridSize) * gridSize;
      
      // Vertical lines
      for (let x = startX; x <= endX; x += gridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      
      // Horizontal lines
      for (let y = startY; y <= endY; y += gridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      
      ctx.stroke();
      
      // Draw center reference circles at the origin (0,0)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(30, 58, 95, 0.5)';
      ctx.lineWidth = 1;
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(0, 0, 100, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(0, 0, 200, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(0, 0, 300, 0, Math.PI * 2);
      ctx.stroke();
    };
    
    const applyNavigationAndAI = (deltaTime: number) => {
      const spacecraft = spacecraftRef.current;
      const thrustPower = 0.01 * deltaTime;
      
      // Manual navigation controls - CHANGED: reversed up control to blow down
      if (navigationControls.up) spacecraft.vy += thrustPower; // Changed from -= to +=
      if (navigationControls.down) spacecraft.vy -= thrustPower; // Changed from += to -=
      if (navigationControls.left) spacecraft.vx -= thrustPower;
      if (navigationControls.right) spacecraft.vx += thrustPower;
      
      // AI modes - Enhanced to work better with radar
      if (aiMode !== 'off') {
        // Get closest debris within radar range
        let closestDebris = null;
        let closestDistance = Infinity;
        
        for (const debris of debrisRef.current) {
          const dx = debris.x - spacecraft.x;
          const dy = debris.y - spacecraft.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Only consider debris within radar range
          if (distance <= radarRange * 10 && distance < closestDistance) {
            closestDistance = distance;
            closestDebris = debris;
          }
        }
        
        if (closestDebris) {
          if (aiMode === 'avoid') {
            // Avoid mode: move away from closest debris
            // Stronger response for closer debris
            const dx = spacecraft.x - closestDebris.x;
            const dy = spacecraft.y - closestDebris.y;
            const angle = Math.atan2(dy, dx);
            
            // Stronger avoidance when closer
            const avoidStrength = 0.015 * deltaTime * (1 / (closestDistance / 100 + 0.1));
            spacecraft.vx += Math.cos(angle) * avoidStrength;
            spacecraft.vy += Math.sin(angle) * avoidStrength;
          } 
          else if (aiMode === 'follow') {
            // Follow mode: chase the closest debris
            const dx = closestDebris.x - spacecraft.x;
            const dy = closestDebris.y - spacecraft.y;
            const angle = Math.atan2(dy, dx);
            
            // More responsive following
            const followStrength = 0.01 * deltaTime;
            spacecraft.vx += Math.cos(angle) * followStrength;
            spacecraft.vy += Math.sin(angle) * followStrength;
            
            // Slow down when getting too close
            if (closestDistance < 50) { // 5km
              spacecraft.vx *= 0.98;
              spacecraft.vy *= 0.98;
            }
          }
        }
      }
    };
    
    const updateSpacecraft = (deltaTime: number) => {
      const spacecraft = spacecraftRef.current;
      
      // Apply some drag
      spacecraft.vx *= 0.99;
      spacecraft.vy *= 0.99;
      
      // Random small perturbations to make it look alive (only if AI is off and no manual controls)
      if (aiMode === 'off' && !navigationControls.up && !navigationControls.down && 
          !navigationControls.left && !navigationControls.right && Math.random() < 0.05) {
        spacecraft.vx += (Math.random() - 0.5) * 0.01;
        spacecraft.vy += (Math.random() - 0.5) * 0.01;
      }
      
      // Update position
      spacecraft.x += spacecraft.vx * deltaTime;
      spacecraft.y += spacecraft.vy * deltaTime;
      
      // No need to keep spacecraft in bounds anymore since the view follows it
    };
    
  // Check for collisions function modified to use toast position on left
  const checkCollisions = () => {
    const { x, y } = spacecraftRef.current;
    // Use a percentage of radar range for collision detection, with a minimum value
    const collisionThreshold = Math.min(15, radarRange * 10 * 0.1);
    
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
        
        // Show collision notification
        const currentTime = Date.now();
        if (currentTime - lastNotificationTimeRef.current > 1000) {
          toast("COLLISION DETECTED", {
            description: "Impact with space debris!",
            icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
            duration: 3000,
            position: "top-left", // Changed from default to top-left
            style: { 
              backgroundColor: '#222', 
              border: '2px solid #ea384c',
              color: 'white' 
            },
          });
          lastNotificationTimeRef.current = currentTime;
        }
      }
    });
  };
    
    const drawSpacecraft = (ctx: CanvasRenderingContext2D) => {
      const { x, y } = spacecraftRef.current;
      
      // Draw spacecraft at its position
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
    
    const drawRadarRange = (ctx: CanvasRenderingContext2D, currentTime: number) => {
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
      
      // Draw critical zones - now tied to radar range
      const criticalRange = Math.min(50, radius * 0.3); // 30% of radar range or 50px
      const warningRange = Math.min(100, radius * 0.6); // 60% of radar range or 100px
      
      ctx.beginPath();
      ctx.arc(x, y, criticalRange, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(234, 56, 76, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(x, y, warningRange, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(247, 115, 22, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    };
    
    const updateDebris = (deltaTime: number) => {
      debrisRef.current.forEach(debris => {
        // Update position
        debris.x += debris.vx * deltaTime;
        debris.y += debris.vy * deltaTime;
      });
    };
    
    const drawDebris = (ctx: CanvasRenderingContext2D) => {
      const { x: sx, y: sy } = spacecraftRef.current;
      const radarRangePixels = radarRange * 10;
      const criticalRange = Math.min(50, radarRangePixels * 0.3); // 30% of radar range or 50px
      const warningRange = Math.min(100, radarRangePixels * 0.6); // 60% of radar range or 100px
      
      debrisRef.current.forEach(debris => {
        // Calculate distance to spacecraft
        const dx = debris.x - sx;
        const dy = debris.y - sy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Determine if within radar range
        const inRange = distance <= radarRangePixels;
        const inCriticalRange = distance <= criticalRange;
        const inWarningRange = distance <= warningRange;
        
        // Draw debris
        ctx.beginPath();
        ctx.arc(debris.x, debris.y, debris.size, 0, Math.PI * 2);
        
        if (inRange) {
          // Color based on distance
          if (inCriticalRange) {
            // Critical range - red
            ctx.fillStyle = 'rgba(234, 56, 76, 0.8)';
          } else if (inWarningRange) {
            // Warning range - orange
            ctx.fillStyle = 'rgba(247, 115, 22, 0.8)';
          } else {
            // Normal detection - yellow
            ctx.fillStyle = 'rgba(255, 191, 36, 0.8)';
          }
          
          ctx.fill();
          
          // Draw glow for detected debris
          ctx.beginPath();
          ctx.arc(debris.x, debris.y, debris.size + 3, 0, Math.PI * 2);
          
          if (inCriticalRange) {
            ctx.fillStyle = 'rgba(234, 56, 76, 0.3)';
          } else if (inWarningRange) {
            ctx.fillStyle = 'rgba(247, 115, 22, 0.3)';
          } else {
            ctx.fillStyle = 'rgba(255, 191, 36, 0.3)';
          }
          
          ctx.fill();
          
          // Draw line to spacecraft for close debris
          if (inWarningRange) {
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(debris.x, debris.y);
            
            if (inCriticalRange) {
              ctx.strokeStyle = 'rgba(234, 56, 76, 0.3)';
            } else {
              ctx.strokeStyle = 'rgba(247, 115, 22, 0.3)';
            }
            
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
    
    // Start animation loop
    frameIdRef.current = requestAnimationFrame(animate);
    
    // Cleanup on unmount or when dependencies change
    return () => cancelAnimationFrame(frameIdRef.current);
  }, [isRunning, simSpeed, radarRange, navigationControls, aiMode, zoomLevel, panOffset]);
  
  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
};

export default SimulationCanvas;
