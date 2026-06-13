"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 bg-[#0c0a08] flex flex-col items-center justify-center z-[9999] overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
              style={{ background: "rgba(224, 120, 80, 0.06)", top: "40%", left: "50%", transform: "translate(-50%, -50%)" }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Concentric spinning rings */}
            <div className="relative w-24 h-24 mb-10">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "1px solid transparent", borderTopColor: "#e07850", borderRightColor: "rgba(245, 220, 200, 0.15)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2.5 rounded-full"
                style={{ border: "1px solid transparent", borderBottomColor: "#c8a070", borderLeftColor: "rgba(224, 120, 80, 0.1)" }}
                animate={{ rotate: -360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-5 rounded-full"
                style={{ border: "1px solid transparent", borderTopColor: "rgba(245, 220, 200, 0.2)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ background: "#e07850", boxShadow: "0 0 20px rgba(224, 120, 80, 0.5)" }} />
              </motion.div>
            </div>

            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-sora)" }}>
                <span className="gradient-text">CafePromo AI</span>
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-[9px] uppercase tracking-[0.4em] mt-3"
                style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#8a847c" }}
              >
                Intelligence in motion
              </motion.p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10 w-28 h-[2px] rounded-full overflow-hidden"
              style={{ background: "rgba(224, 120, 80, 0.08)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #e07850, #f5dcc8)" }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
