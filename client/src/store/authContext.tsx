'use client'
import React, { createContext, useContext, useState, ReactNode,useEffect } from 'react';

interface UserData {
  user: any; 
  token: string;
}

// Define the context type
interface AuthContextType {
  auth: UserData;
  setAuth: React.Dispatch<React.SetStateAction<UserData>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<UserData>({
    user: null,
    token: '',
  });
   useEffect(() => {
     const data = localStorage.getItem('user');
     if (data) {
       const parseData = JSON.parse(data) as UserData;
       setAuth({
         ...auth,
         user: parseData.user,
         token: parseData.token,
       });
     }
     // eslint-disable-next-line
   }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { useAuth, AuthProvider };
