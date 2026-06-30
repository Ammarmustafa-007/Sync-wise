import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const isValidEmail = (email) => {
    if (!email) return false;
    return email.endsWith('@student.edu.pk') || email.endsWith('@teacher.uol.edu.pk');
  };

  const handleSession = async (currentSession) => {
    if (!currentSession) {
      setSession(null);
      setUser(null);
      return;
    }

    if (isValidEmail(currentSession.user.email)) {
      setSession(currentSession);
      setUser(currentSession.user);
      setAuthError(null);
    } else {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      // Set the error state instead of using toast
      setAuthError({
        title: "Access Denied",
        message: "Please login with your university mail (@student.edu.pk or @teacher.uol.edu.pk) to get access to uni data and generate your timetables."
      });
    }
  };

  useEffect(() => {
    const devRole = localStorage.getItem('dev_role');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (devRole) {
        setSession({ access_token: 'dev-token' });
        setUser({ id: 'dev', email: `dev@${devRole}.com`, user_metadata: { role: devRole, full_name: `Dev ${devRole}` } });
      } else {
        handleSession(session);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!localStorage.getItem('dev_role')) {
        await handleSession(session);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    loading,
    devLogin: (role) => {
      localStorage.setItem('dev_role', role);
      setSession({ access_token: 'dev-token' });
      setUser({ id: 'dev', email: `dev@${role}.com`, user_metadata: { role, full_name: `Dev ${role}` } });
    },
    signOut: () => {
      localStorage.removeItem('dev_role');
      return supabase.auth.signOut();
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      
      {/* Full Screen Red Error Modal */}
      {authError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-destructive text-destructive-foreground rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{authError.title}</h2>
              <p className="text-destructive-foreground/90 text-sm mb-6 leading-relaxed">
                {authError.message}
              </p>
              <Button 
                variant="secondary" 
                className="w-full font-semibold"
                onClick={() => setAuthError(null)}
              >
                Understood, take me back
              </Button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
