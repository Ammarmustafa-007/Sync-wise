import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GoDownload } from "react-icons/go";

import {
  LayoutDashboard,
  Upload,
  FileOutput,
  History,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import DownloadSuccess from "../components/DownloadSuccess";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Upload, label: "Upload PDF", active: false },
  { icon: FileOutput, label: "Parsed Results", active: false },
  { icon: History, label: "History", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const recentFiles = [
  { name: "Generation1.pdf", status: "Completed", date: "2 min ago" },
  { name: "Generation2.pdf", status: "Processing", date: "15 min ago" },
  { name: "Generation3.pdf", status: "Completed", date: "1 hour ago" },
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [showSuccess, setShowSuccess] = useState(false);
  const handleDownload = () => {
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SyncWise</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeNav === item.label
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SyncWise</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setActiveNav(item.label);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeNav === item.label
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center px-6 gap-4">
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{activeNav}</h1>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Drop your PDF here
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                or click to browse from your computer
              </p>
              <Button variant="default" size="lg" className="mt-6">
                Select PDF
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { label: "PDFs Processed", value: "247" },
              { label: "Pages Extracted", value: "1,832" },
              { label: "Data Points", value: "12,459" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-xl bg-card border border-border"
              >
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Recent Files */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Files
              </h2>
              <button className="text-sm text-primary hover:underline flex items-center gap-1">
                View all
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {recentFiles.map((file, index) => (
                <div
                  key={file.name}
                  className={`flex items-center justify-between p-4 ${
                    index !== recentFiles.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {file.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {file.date}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      file.status === "Completed"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {file.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Parsed Output Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex justify-between items-center flex-1">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Parsed Output Preview
              </h2>
              <Button className="mb-6" onClick={handleDownload}>
                Download <GoDownload />
              </Button>
            </div>
            <DownloadSuccess
              isVisible={showSuccess}
              onClose={() => setShowSuccess(false)}
            />
            ;
            <div className="rounded-xl border border-border bg-card p-6">
              <pre className="text-sm text-muted-foreground font-mono overflow-x-auto">
                {`{
  "document": "invoice_2024_001.pdf",
  "extracted_data": {
    "invoice_number": "INV-2024-001",
    "date": "2024-01-15",
    "vendor": "TechCorp Solutions",
    "total": "$1,250.00",
    "line_items": [
      {
        "description": "Software License",
        "quantity": 5,
        "price": "$250.00"
      }
    ]
  }
}`}
              </pre>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
