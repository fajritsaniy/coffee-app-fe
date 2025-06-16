// app/components/SplashScreen.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({
  children,
  splashContent,
}: {
  children: React.ReactNode;
  splashContent: React.ReactNode;
}) {
  const [visible, setVisible] = useState(true);

  const handleTap = () => {
    setVisible(false);
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      <AnimatePresence>
        {visible && (
          <motion.div
            onClick={handleTap}
            className="absolute inset-0 flex items-center justify-center bg-black text-white z-10"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: 0 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {splashContent}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={visible ? "hidden" : "block"}>{children}</div>
    </div>
  );
}
