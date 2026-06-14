import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export interface AuthContextType {
  user: any | null;
  userData: any | null;
  loading: boolean;
  isImpersonating: boolean;
  isSystemAdmin: boolean;
  realUser: User | null;
  realUserData: any | null;
  hasActiveMembership: boolean;
  startImpersonation: (memberData: any) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userData: null, 
  loading: true,
  isImpersonating: false,
  isSystemAdmin: false,
  realUser: null,
  realUserData: null,
  hasActiveMembership: false,
  startImpersonation: () => {},
  stopImpersonation: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [impersonatedUserData, setImpersonatedUserData] = useState<any | null>(() => {
    const saved = sessionStorage.getItem('tvr_impersonated_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (user) {
        unsubscribeDoc = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            setUserData({ id: docSnap.id, ...docSnap.data() });
          } else {
            setUserData(null);
          }
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const startImpersonation = (memberData: any) => {
    sessionStorage.setItem('tvr_impersonated_user', JSON.stringify(memberData));
    setImpersonatedUserData(memberData);
  };

  const stopImpersonation = () => {
    sessionStorage.removeItem('tvr_impersonated_user');
    setImpersonatedUserData(null);
  };

  const mockUserObj = impersonatedUserData ? {
    uid: impersonatedUserData.id || impersonatedUserData.uid || `demo_${impersonatedUserData.email?.split('@')[0]}`,
    email: impersonatedUserData.email,
    displayName: impersonatedUserData.fullName || impersonatedUserData.name || impersonatedUserData.displayName || 'Member',
    isAnonymous: false,
    emailVerified: true
  } : null;

  const activeUserData = impersonatedUserData ? impersonatedUserData : userData;
  
  // Bootstrap admin status for specific email if userData isn't loaded yet
  const isBootstrappedAdmin = user?.email === 'branafrikana@gmail.com';
  const isSystemAdmin = activeUserData?.role === 'admin' || activeUserData?.isAdmin === true || isBootstrappedAdmin;
  
  const hasActiveMembership = activeUserData?.isMember || 
                             activeUserData?.isFreeMemberForLife || 
                             isSystemAdmin;

  const value: AuthContextType = {
    user: impersonatedUserData ? mockUserObj : user,
    userData: activeUserData,
    loading,
    isImpersonating: !!impersonatedUserData,
    isSystemAdmin,
    realUser: user,
    realUserData: userData,
    hasActiveMembership,
    startImpersonation,
    stopImpersonation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
