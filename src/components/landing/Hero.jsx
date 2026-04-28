import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const { user } = useAuth();
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, filter: "blur(12px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="container mx-auto px-4 mt-6 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          ></motion.div>

          {/* Headline */}
          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.3,
            }}
            className="mt-8 text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-tight"
          >
            Turn PDFs into <span className="text-gradient">Structured </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.2,
            }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
           SyncWise intelligently parses university timetable PDFs and converts
           them into clean, structured schedules. Generate clash-free,
           personalized timetables instantly
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.3,
            }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <Button variant="hero" size="xl" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            )}
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/dashboard">
                <Upload className="w-5 h-5 mr-2" />
                Upload PDF
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.4,
            }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              {
                value: "99.9%",
                label: "Accuracy",
              },
              {
                value: "10x",
                label: "Faster",
              },
              {
                value: "500K+",
                label: "PDFs Parsed",
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating Preview */}
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.5,
          }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="relative rounded-3xl border border-border bg-card p-2 shadow-lifted mb-5">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl" />
            <div className="relative rounded-xl bg-muted/50 aspect-[16/9] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce">
                  <Upload className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="text-muted-foreground">
                  Drag and drop your PDF here
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
export default Hero;
