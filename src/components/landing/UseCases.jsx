import { motion } from "framer-motion";
import { Receipt, FileText, BookOpen, BarChart3 } from "lucide-react";

const useCases = [
  {
    icon: Receipt,
    title: "Invoices & Receipts",
    description:
      "Automatically extract line items, amounts, dates, and vendor details from invoices and receipts.",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: FileText,
    title: "Contracts",
    description:
      "Parse legal documents to identify key clauses, parties, dates, and obligations quickly.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: BookOpen,
    title: "Research Papers",
    description:
      "Extract citations, abstracts, and key findings from academic papers automatically.",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description:
      "Transform financial reports and analytics into structured, actionable data.",
    color: "bg-orange-500/10 text-orange-600",
  },
];

const UseCases = () => {
  return (
    <section id="use-cases" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Use Cases
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground">
            Built for every document type
          </h2>
          <p className="mt-4 text-muted-foreground">
            From invoices to contracts, SyncWise handles it all
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex gap-5 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all duration-300"
            >
              <div
                className={`flex-shrink-0 w-14 h-14 rounded-xl ${useCase.color} flex items-center justify-center`}
              >
                <useCase.icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {useCase.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
