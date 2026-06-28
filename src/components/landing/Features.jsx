import { motion } from "framer-motion";
import { FileSearch, Brain, Zap, Shield, Sparkles, LayoutDashboard } from "lucide-react";

const Features = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            Next-Gen Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
            Built for scale. <br /> Designed for speed.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Say goodbye to endless Excel sheets and manual data entry. Our engine does the heavy lifting instantly.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Bento Box 1: Large Span */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2 relative overflow-hidden rounded-3xl bg-card border border-border p-8 hover:border-primary/40 transition-colors group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <FileSearch className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Smart PDF Parsing</h3>
                <p className="mt-3 text-muted-foreground max-w-md text-lg">
                  Advanced algorithms detect and extract text, tables, and constraints from raw university PDFs with remarkable precision, translating visual grids into structured data.
                </p>
              </div>
              <div className="mt-8 h-40 bg-white/5 border border-white/10 rounded-xl overflow-hidden relative">
                {/* Abstract mockup */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/10 to-transparent flex items-end justify-around px-4 pb-4">
                  {[40, 70, 50, 90, 60, 80].map((h, i) => (
                    <div key={i} className="w-8 bg-primary/20 rounded-t-sm" style={{ height: h + '%' }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento Box 2: Tall Span */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-1 relative overflow-hidden rounded-3xl bg-card border border-border p-8 hover:border-emerald-500/40 transition-colors group flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Lightning Fast</h3>
              <p className="mt-3 text-muted-foreground text-lg">
                Process entire semester catalogs and thousands of slots in mere seconds. 
              </p>
            </div>
            <div className="mt-8 flex justify-center">
              <div className="w-32 h-32 rounded-full border-[8px] border-emerald-500/20 border-t-emerald-500 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </motion.div>

          {/* Bento Box 3: Normal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-1 relative overflow-hidden rounded-3xl bg-card border border-border p-8 hover:border-purple-500/40 transition-colors group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Intelligent Clash Resolution</h3>
              <p className="mt-3 text-muted-foreground">
                Our conflict engine automatically flags overlaps and suggests optimal room or teacher reassignments.
              </p>
            </div>
          </motion.div>

          {/* Bento Box 4: Large Span */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-2 relative overflow-hidden rounded-3xl bg-card border border-border p-8 hover:border-primary/40 transition-colors group flex items-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 w-full flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <LayoutDashboard className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Student & Admin Portals</h3>
                <p className="mt-3 text-muted-foreground text-lg">
                  Isolated environments ensure admins can build and tweak the master schedule while students securely view their perfectly curated personal timetables.
                </p>
              </div>
              <div className="w-full md:w-1/2 h-40 bg-white/5 border border-white/10 rounded-xl overflow-hidden relative p-4 flex flex-col gap-2">
                 <div className="w-full h-8 bg-white/10 rounded-md" />
                 <div className="w-3/4 h-8 bg-white/5 rounded-md" />
                 <div className="w-1/2 h-8 bg-white/5 rounded-md" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Features;
