import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Icon, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Use Cases", href: "#use-cases" },
    { name: "Testimonials", href: "#testimonials" },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0, filter: "blur(10px)" }}
      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl bg-primary/5 transition-all duration-300 group-hover:bg-primary/10 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <img
                className="w-full h-full object-center transition-transform duration-500 "
                src="/third.png"
                alt="SyncWise Logo Icon"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
              SyncWise
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="default" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
            <Button
              variant="default"
              onClick={() => {
                document.documentElement.classList.toggle("dark");
                setTheme(!theme);
              }}
              className="p-2 rounded-full  text-foreground hover:text-primary transition"
            >
              {theme ? "🌙" : "☀️"}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-4 flex flex-col gap-2">
                  {user ? (
                    <>
                      <Button variant="ghost" asChild className="w-full">
                        <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                      </Button>
                      <Button variant="default" onClick={() => { setIsOpen(false); handleSignOut(); }} className="w-full">
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" asChild className="w-full">
                        <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                      </Button>
                      <Button variant="default" asChild className="w-full">
                        <Link to="/signup" onClick={() => setIsOpen(false)}>Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
