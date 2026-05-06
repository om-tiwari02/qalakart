import React, { useEffect, useRef } from 'react';

const StarField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let meteors = [];
    let mouse = { x: 0, y: 0 };
    let isMouseActive = false;
    let animationFrameId;

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      mouse = { x: width / 2, y: height / 2 };

      meteors = [];
      const numMeteors = Math.floor((width * height) / 10000); // adjust density

      for (let i = 0; i < numMeteors; i++) {
        createMeteor(true);
      }
    };

    const createMeteor = (randomPos = false) => {
      // Start meteors outside the screen or randomly inside if initial
      const x = randomPos ? Math.random() * width : Math.random() * width * 2 - width / 2;
      const y = randomPos ? Math.random() * height : -Math.random() * height - 50;
      
      meteors.push({
        x,
        y,
        length: Math.random() * 80 + 20,
        speed: Math.random() * 15 + 8,
        thickness: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.4,
      });
    };

    const updateMouse = (x, y) => {
      mouse.x = x;
      mouse.y = y;
      isMouseActive = true;
    };

    const handleMouseMove = (e) => updateMouse(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        updateMouse(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleMouseLeave = () => { isMouseActive = false; };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Nebula effect background
      const gradient = ctx.createRadialGradient(width * 0.8, height * 0.2, 0, width * 0.8, height * 0.2, width * 0.6);
      gradient.addColorStop(0, 'rgba(212, 175, 55, 0.08)'); // Gold glow
      gradient.addColorStop(0.5, 'rgba(180, 134, 8, 0.03)'); // Deep gold glow
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Determine meteor direction based on mouse
      let targetDirX = -0.3; // Default drift left
      let targetDirY = 1;    // Default drift down
      
      if (isMouseActive) {
        // Calculate direction vector from center to mouse
        const dx = mouse.x - width / 2;
        const dy = mouse.y - height / 2;
        
        // Map mouse position to a direction change
        targetDirX = (dx / width) * 2; // -1 to 1 range approx
        targetDirY = Math.max(0.3, (dy / height) * 2 + 1); // always falling down
      }
      
      // Normalize direction vector
      const mag = Math.sqrt(targetDirX * targetDirX + targetDirY * targetDirY);
      const dirX = targetDirX / mag;
      const dirY = targetDirY / mag;

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        
        // Move meteor
        m.x += dirX * m.speed;
        m.y += dirY * m.speed;

        // Draw meteor streak
        const endX = m.x - dirX * m.length;
        const endY = m.y - dirY * m.length;

        const streakGradient = ctx.createLinearGradient(m.x, m.y, endX, endY);
        streakGradient.addColorStop(0, `rgba(252, 211, 77, ${m.alpha})`); // Head (gold)
        streakGradient.addColorStop(1, `rgba(252, 211, 77, 0)`); // Tail (transparent)

        ctx.beginPath();
        ctx.strokeStyle = streakGradient;
        ctx.lineWidth = m.thickness;
        ctx.lineCap = 'round';
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Reset if it goes off screen
        if (
          m.y > height + m.length || 
          m.x < -m.length - width || 
          m.x > width + m.length + width
        ) {
          meteors.splice(i, 1);
          createMeteor(false);
        }
      }
      
      // Ensure we maintain meteor density
      while (meteors.length < Math.floor((width * height) / 10000)) {
        createMeteor(false);
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };

    init();
    draw();

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchend', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchend', handleMouseLeave);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-1] pointer-events-none opacity-80"
    />
  );
};

export default StarField;
