import { createContext, useContext, useState } from 'react';
import * as store from './store.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(store.getSession());
  const value = {
    user,
    login: async (d) => setUser(await store.login(d)),
    signup: async (d) => setUser(await store.signup(d)),
    logout: () => {
      store.logout();
      setUser(null);
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
