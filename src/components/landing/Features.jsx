import { motion } from "framer-motion";
import { FileSearch, Brain, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Smart PDF Parsing",
    description:
      "Advanced algorithms detect and extract text, tables, and images from any PDF format with remarkable precision.",
  },
  {
    icon: Brain,
    title: "AI-Powered Data Extraction",
    description:
      "Our AI understands context and semantics, ensuring accurate data extraction even from complex documents.",
  },
  {
    icon: Zap,
    title: "Fast & Accurate Results",
    description:
      "Process hundreds of documents in minutes with 99.9% accuracy. Save hours of manual data entry.",
  },
  {
    icon: Shield,
    title: "Secure Document Processing",
    description:
      "Enterprise-grade security with end-to-end encryption. Your documents are processed and deleted automatically.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Features
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground">
            Everything you need for document intelligence
          </h2>
          <p className="mt-4 text-muted-foreground">
            Powerful features designed to transform how you work with documents
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
