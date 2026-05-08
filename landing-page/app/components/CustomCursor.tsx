"use client";

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 250 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleHoverStart = () => setIsHovered(true);
    const handleHoverEnd = () => setIsHovered(false);

    window.addEventListener('mousemove', moveCursor);
    
    // Add listeners to all interactive elements
    const updateListeners = () => {
      const interactives = document.querySelectorAll('button, a, input, select, textarea, .cursor-pointer');
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', handleHoverStart);
        el.addEventListener('mouseleave', handleHoverEnd);
      });
    };

    updateListeners();
    // Re-run whenever DOM might change (simple approach)
    const observer = new MutationObserver(updateListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      observer.disconnect();
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <style jsx global>{`
        @media (pointer: fine) {
          body {
            cursor: none !important;
          }
          a, button, input, select, textarea, .cursor-pointer {
            cursor: none !important;
          }
        }
      `}</style>
      
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-purple-500 pointer-events-none z-[9999] hidden md:block"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
        animate={{
          scale: isHovered ? 2 : 1,
          backgroundColor: isHovered ? "rgba(168, 85, 247, 0.2)" : "rgba(168, 85, 247, 0)",
          borderColor: isHovered ? "rgba(168, 85, 247, 1)" : "rgba(168, 85, 247, 0.5)",
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.5 }}
      />
      
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[10000] hidden md:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: 12,
          translateY: 12
        }}
        animate={{
          scale: isHovered ? 0 : 1,
        }}
      />
    </>
  );
}
