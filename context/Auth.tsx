import nookies from 'nookies';
import { User, getAuth } from 'firebase/auth';
import { useEffect, useState, createContext } from 'react';

export const AuthContext = createContext<{ user: User | null }>({
  user: null,
});

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return getAuth().onIdTokenChanged(async (user) => {
      if (!user) {
        setUser(null);
        /* NB: Cookie must be called `__session` to pass through
          Firebase Functions */
        nookies.set(undefined, '__session', '', { path: '/' });
      } else {
        const token = await user.getIdToken();
        setUser(user);
        /* NB: Cookie must be called `__session` to pass through
          Firebase Functions */
        nookies.set(undefined, '__session', token, { path: '/' });
      }
    });
  }, []);

  // force refresh the token every 10 minutes
  useEffect(() => {
    const handle = setInterval(async () => {
      const user = getAuth().currentUser;
      if (user) await user.getIdToken(true);
    }, 10 * 60 * 1000);

    // clean up setInterval
    return () => clearInterval(handle);
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}