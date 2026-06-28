import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, LayoutDashboard, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
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

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setTheme(isDark ? "dark" : "light");
  };

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Testimonials", href: "#testimonials" },
  ];

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-5xl rounded-full border border-white/10 bg-background/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-4 py-2.5 transition-all"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group ml-2">
            <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg bg-primary/10 transition-all duration-300 group-hover:bg-primary/20">
              <img
                className="w-6 h-6 object-center transition-transform duration-500"
                src="/third.png"
                alt="SyncWise Logo Icon"
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary hidden sm:block">
              SyncWise
            </span>
          </Link>

          {/* Desktop Navigation Links (Center) */}
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
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

          {/* Desktop Auth & Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors mr-2"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {user ? (
              <>
                <Button variant="ghost" className="rounded-full h-9 px-4 text-sm" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="default" className="rounded-full h-9 px-4 text-sm" onClick={handleSignOut}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="rounded-full h-9 px-4 text-sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" className="rounded-full h-9 px-4 text-sm shadow-brand" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              className="p-2 text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pb-4 space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-2 border-t border-border flex flex-col gap-2">
                  {user ? (
                    <>
                      <Button variant="ghost" asChild className="w-full justify-start rounded-xl">
                        <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button variant="default" onClick={() => { setIsOpen(false); handleSignOut(); }} className="w-full justify-start rounded-xl">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" asChild className="w-full justify-center rounded-xl">
                        <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                      </Button>
                      <Button variant="default" asChild className="w-full justify-center rounded-xl shadow-brand">
                        <Link to="/signup" onClick={() => setIsOpen(false)}>Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

export default Navbar;
