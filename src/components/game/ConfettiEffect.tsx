"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

const COLORS = ["#00e676", "#69f0ae", "#00c853", "#b9f6ca", "#ffffff"];

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: -(Math.random() * 200 + 100),
    rotation: Math.random() * 720 - 360,
    scale: Math.random() * 0.8 + 0.4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.15,
  }));
}

interface ConfettiEffectProps {
  trigger: number; // increment to trigger
}

export function ConfettiEffect({ trigger }: ConfettiEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger <= 0) return;
    setParticles(createParticles(24));
    setShow(true);
    const timer = setTimeout(() => setShow(false), 1200);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
              animate={{
                x: p.x,
                y: p.y,
                opacity: 0,
                scale: p.scale,
                rotate: p.rotation,
              }}
              transition={{
                duration: 0.8,
                delay: p.delay,
                ease: "easeOut",
              }}
              className="absolute"
            >
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: p.color }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
