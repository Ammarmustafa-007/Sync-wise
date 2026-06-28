import { motion } from "framer-motion";
import { Upload, Cpu, Download, Database } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Raw PDF Timetables",
    description:
      "Admins securely upload the raw, unstructured PDF timetables provided by the university into the Campus Flow portal.",
  },
  {
    step: "02",
    icon: Cpu,
    title: "SyncWise Parsing Engine",
    description:
      "Our proprietary engine scans the visual grid, extracts text, tables, and constraints, and converts it all into a high-fidelity structured JSON dataset.",
  },
  {
    step: "03",
    icon: Database,
    title: "Automated Clash Resolution",
    description:
      "The intelligent conflict engine scans every slot, flags overlaps, and resolves them instantly based on teacher and room availability.",
  },
  {
    step: "04",
    icon: Download,
    title: "Generate Personal Schedules",
    description:
      "Students log in, select their specific courses and sections, and instantly receive a perfectly curated, clash-free personal timetable.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Sticky Left Column */}
          <div className="lg:sticky lg:top-40 h-fit">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
                From chaotic PDFs <br className="hidden lg:block" />
                <span className="text-muted-foreground">to perfect harmony.</span>
              </h2>
              <p className="mt-6 text-xl text-muted-foreground max-w-md">
                SyncWise automates the entire lifecycle of university scheduling in four simple phases.
              </p>
            </motion.div>
          </div>

          {/* Scrolling Right Column */}
          <div className="relative border-l border-border/50 pl-8 md:pl-12 space-y-24 pb-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                {/* Node on the line */}
                <div className="absolute -left-[49px] md:-left-[65px] top-2 w-4 h-4 rounded-full border-2 border-primary bg-background ring-4 ring-background" />
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-6xl font-black text-foreground/5 tracking-tighter">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
