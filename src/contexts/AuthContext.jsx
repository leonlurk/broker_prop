import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, getCurrentUser } from '../firebase/auth';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState('es');

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data().preferredLanguage) {
            setLanguageState(userDocSnap.data().preferredLanguage);
          } else {
            setLanguageState('es');
            await updateDoc(userDocRef, { preferredLanguage: 'es' }).catch(async (error) => {
              if (error.code === 'not-found') {
                await setDoc(userDocRef, { preferredLanguage: 'es' }, { merge: true });
              } else {
                console.error("Error updating preferredLanguage on load:", error);
              }
            });
          }
        } catch (error) {
          console.error("Error fetching user's preferred language:", error);
          setLanguageState('es');
        }
      } else {
        setCurrentUser(null);
        setLanguageState('es');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const setLanguage = async (lang) => {
    console.log('[AuthContext] Attempting to set language to:', lang);
    setLanguageState(lang);
    console.log('[AuthContext] Called setLanguageState, language should now be (pending re-render):', lang);
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      try {
        await updateDoc(userDocRef, { preferredLanguage: lang });
      } catch (error) {
        console.error("Error updating preferredLanguage in Firestore:", error);
      }
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    language,
    setLanguage,
  };

  console.log('[AuthContext] Provider value being created. Language:', language);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};