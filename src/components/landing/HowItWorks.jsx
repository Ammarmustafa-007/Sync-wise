import { motion } from "framer-motion";
import { Upload, Cpu, Download } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload your PDF",
    description:
      "Simply drag and drop your PDF files or click to browse. We support all PDF formats.",
  },
  {
    step: "02",
    icon: Cpu,
    title: "SyncWise parses & analyzes",
    description:
      "Our AI engine processes your document, extracting text, tables, and structured data automatically.",
  },
  {
    step: "03",
    icon: Download,
    title: "Export structured data",
    description:
      "Download your data in JSON, CSV, or Excel format. Integrate directly with your workflows.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground">
            Three simple steps to transform your documents
          </h2>
        </motion.div>

        <div className="mt-16 relative">
          {/* Connection Line */}
          <div className="hidden  lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative text-center lg:text-left"
              >
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl  bg-card border border-border flex items-center justify-center shadow-soft relative z-10">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="absolute z-10 -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
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
