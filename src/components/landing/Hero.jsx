import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex flex-col items-center pt-32 lg:pt-40 overflow-hidden pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          
          {/* Introducing Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Sparkles className="w-4 h-4" />
              <span>Introducing SyncWise 2.0</span>
            </div>
          </motion.div>

          {/* Massive Typography */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground leading-[1.1]"
          >
            Schedules built for the <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-primary animate-gradient-x">
              Modern Campus.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium"
          >
            Instantly convert raw PDF timetables into intelligent, clash-free schedules tailored for your success.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            {user ? (
              <Button size="xl" className="rounded-full px-8 text-base shadow-brand w-full sm:w-auto" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button size="xl" className="rounded-full px-8 text-base shadow-brand w-full sm:w-auto hover:scale-105 transition-transform" asChild>
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            )}
          </motion.div>
        </div>

        {/* 3D Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: "1000px" }}
          className="mt-20 w-full max-w-6xl mx-auto relative group"
        >
          {/* Glow Behind Mockup */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-emerald-500/10 blur-[100px] -z-10 rounded-full scale-y-50 translate-y-1/4 group-hover:from-primary/40 transition-colors duration-700" />
          
          <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[16/9] lg:aspect-[21/9] flex items-center justify-center">
            {/* Faux Browser Header */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            
            {/* Abstract UI Representation */}
            <div className="w-full h-full pt-10 px-6 pb-6 flex gap-6">
              {/* Sidebar */}
              <div className="w-48 h-full bg-white/5 rounded-lg border border-white/10 hidden md:flex flex-col gap-3 p-4">
                <div className="w-full h-8 bg-white/10 rounded-md" />
                <div className="w-3/4 h-4 bg-white/5 rounded mt-4" />
                <div className="w-full h-4 bg-white/5 rounded" />
                <div className="w-5/6 h-4 bg-white/5 rounded" />
              </div>
              {/* Main Content */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="w-1/3 h-8 bg-white/10 rounded-lg" />
                  <div className="w-1/4 h-8 bg-primary/20 rounded-lg" />
                </div>
                <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-4 grid grid-cols-5 gap-2">
                   {/* Faux Calendar Grid */}
                   {Array.from({ length: 25 }).map((_, i) => (
                     <div key={i} className={`rounded-md ${i % 7 === 2 ? 'bg-primary/20' : i % 5 === 1 ? 'bg-emerald-500/20' : 'bg-white/5'}`} />
                   ))}
                </div>
              </div>
            </div>

            {/* Bottom Fade Mask */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
          </div>
        </motion.div>

        {/* Stats Strip */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-border pt-10"
          >
            {[
              { value: "99.9%", label: "Parsing Accuracy" },
              { value: "Seconds", label: "To Generate" },
              { value: "0", label: "Clashes" },
              { value: "24/7", label: "Availability" },
            ].map((stat) => (
              <div key={stat.label} className="text-center space-y-1">
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
