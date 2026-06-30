import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

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
    } else {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      toast.error("Access Denied", {
        description: "Please login with your university mail (@student.edu.pk or @teacher.uol.edu.pk) to get access to uni data and generate your timetables.",
        duration: 8000
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
    </AuthContext.Provider>
  );
};
