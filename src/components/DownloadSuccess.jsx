import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Download, X, FileText, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const DownloadSuccess = ({ isVisible, onClose, fileName = "document.pdf" }) => {
  const [step, setStep] = useState("loading"); // loading | success

  useEffect(() => {
    if (isVisible) {
      setStep("loading");
      // Simulate a small delay for the "processing" feel
      const timer = setTimeout(() => setStep("success"), 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-card/80 p-6 shadow-2xl backdrop-blur-2xl"
          >
            {/* Background Ambient Glow */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon Animation Container */}
              <div className="relative h-20 w-20 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {step === "loading" ? (
                    <motion.div
                      key="loading"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="rounded-full border-t-2 border-primary h-full w-full absolute"
                    />
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="bg-brand-gradient p-4 rounded-full shadow-glow"
                    >
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {step === "loading" && (
                  <Download className="w-8 h-8 text-primary animate-bounce" />
                )}
              </div>

              {/* Text Content */}
              <div className="space-y-2">
                <motion.h3
                  layout
                  className="text-2xl font-bold text-foreground"
                >
                  {step === "loading" ? "Syncing Data..." : "Download Ready!"}
                </motion.h3>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" /> {fileName}
                </p>
              </div>

              {/* Animated Progress Bar (Only show during loading) */}
              {step === "loading" && (
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 2 }}
                    className="h-full bg-brand-gradient w-full"
                  />
                </div>
              )}

              {/* Action Buttons (Only show after success) */}
              {step === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full grid grid-cols-2 gap-3"
                >
                  <Button
                    variant="outline"
                    className="rounded-xl h-12"
                    onClick={onClose}
                  >
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                  <Button className="rounded-xl h-12 bg-brand-gradient hover:opacity-90 transition-opacity">
                    Open File
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DownloadSuccess;
