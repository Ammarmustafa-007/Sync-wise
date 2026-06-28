import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const devRole = localStorage.getItem('dev_role');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (devRole) {
        setSession({ access_token: 'dev-token' });
        setUser({ id: 'dev', email: `dev@${devRole}.com`, user_metadata: { role: devRole, full_name: `Dev ${devRole}` } });
      } else {
        setSession(session);
        setUser(session?.user || null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem('dev_role')) {
        setSession(session);
        setUser(session?.user || null);
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
