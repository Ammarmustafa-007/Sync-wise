import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthContext = createContext({});
const DEV_TEACHER_NAME = 'Ms Nimra shafiq';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const isValidEmail = (email) => {
    if (!email) return false;
    return email.endsWith('@student.uol.edu.pk') || email.endsWith('@teacher.uol.edu.pk');
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
        message: "This is a university specific platform. Please login with your official university email to get access to your university timetable database and create your hassle-free schedules."
      });
    }
  };

  useEffect(() => {
    const devRole = localStorage.getItem('dev_role');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (devRole) {
        const fullName = devRole === 'teacher' ? DEV_TEACHER_NAME : `Dev ${devRole}`;
        const email = devRole === 'teacher' ? 'nimra.shafiq@teacher.uol.edu.pk' : `dev@${devRole}.com`;
        setSession({ access_token: 'dev-token' });
        setUser({ id: 'dev', email, user_metadata: { role: devRole, full_name: fullName } });
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
      const fullName = role === 'teacher' ? DEV_TEACHER_NAME : `Dev ${role}`;
      const email = role === 'teacher' ? 'nimra.shafiq@teacher.uol.edu.pk' : `dev@${role}.com`;
      setSession({ access_token: 'dev-token' });
      setUser({ id: 'dev', email, user_metadata: { role, full_name: fullName } });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-red-600 text-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-red-500">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3">{authError.title}</h2>
              <p className="text-red-50 text-base mb-8 leading-relaxed font-medium">
                {authError.message}
              </p>
              <Button 
                variant="outline" 
                className="w-full font-bold text-red-600 bg-white hover:bg-red-50 border-white h-12 text-lg"
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
