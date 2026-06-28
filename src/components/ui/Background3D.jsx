import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Background3D() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse coordinates to -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax calculations based on mouse position
  const parallaxX = mousePosition.x * 30;
  const parallaxY = mousePosition.y * 30;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background">
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] opacity-60"
      />

      {/* Abstract Glowing Beams (Vercel/Stripe style) */}
      <div className="absolute inset-0 flex justify-center opacity-30 pointer-events-none">
        <div className="absolute top-0 w-full max-w-4xl h-[600px] bg-gradient-to-b from-primary/30 via-transparent to-transparent blur-[80px] -translate-y-1/2" />
        <div className="absolute bottom-0 w-full max-w-2xl h-[400px] bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent blur-[80px] translate-y-1/2" />
      </div>

      {/* Animated Mesh Gradients (Aurora Effect) */}
      <motion.div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        animate={{
          x: parallaxX * -1,
          y: parallaxY * -1,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 50 }}
      >
        {/* Blob 1: Primary (Blueish) */}
        <motion.div 
          className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]"
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Blob 2: Emerald/Teal */}
        <motion.div 
          className="absolute top-[30%] right-[10%] w-[700px] h-[700px] rounded-full bg-emerald-500/15 blur-[120px]"
          animate={{ 
            x: [0, -100, 0],
            y: [0, 80, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Blob 3: Purple/Indigo */}
        <motion.div 
          className="absolute bottom-[10%] left-[30%] w-[500px] h-[500px] rounded-full bg-purple-500/15 blur-[100px]"
          animate={{ 
            x: [0, 80, 0],
            y: [0, -60, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        {/* Abstract Floating Shards (Optional micro-details) */}
        <motion.div
          className="absolute top-[20%] right-[30%] w-64 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent blur-[1px] rotate-45"
          animate={{ opacity: [0, 1, 0], x: [-100, 100], y: [-100, 100] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 4 }}
        />
        <motion.div
          className="absolute bottom-[30%] left-[20%] w-48 h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent blur-[1px] -rotate-45"
          animate={{ opacity: [0, 1, 0], x: [100, -100], y: [100, -100] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 1 }}
        />
      </motion.div>
    </div>
  );
}
