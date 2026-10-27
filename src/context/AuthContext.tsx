import { createContext, useContext, useState, type ReactNode } from 'react';

// ========================================================
// 1. DATA TYPES
// ========================================================

/** Details of the currently logged-in user */
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
}

/** Everything the AuthContext provides to the rest of the application */
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

// ========================================================
// 2. HELPER FUNCTIONS FOR LOCAL STORAGE
// ========================================================

// Read the saved JWT token from localStorage (if any)
function getInitialToken(): string | null {
  return localStorage.getItem('eh_token');
}

// Read and parse the saved user details from localStorage (if any)
function getInitialUser(): User | null {
  const savedData = localStorage.getItem('eh_user');
  if (!savedData) {
    return null;
  }
  try {
    return JSON.parse(savedData) as User;
  } catch {
    return null;
  }
}

// ========================================================
// 3. CREATE CONTEXT
// ========================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========================================================
// 4. AUTH PROVIDER COMPONENT
// ========================================================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Store authentication state
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [user, setUser] = useState<User | null>(getInitialUser);

  // Helper booleans
  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === 'ADMIN';

  // Function called when the user successfully signs in
  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('eh_token', newToken);
    localStorage.setItem('eh_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // Function called when the user logs out
  const logout = () => {
    localStorage.removeItem('eh_token');
    localStorage.removeItem('eh_user');
    setToken(null);
    setUser(null);
  };

  // Function called when profile details are updated
  const updateUser = (updatedUser: User) => {
    localStorage.setItem('eh_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ========================================================
// 5. CUSTOM HOOK
// ========================================================

/** Convenient hook for components to access authentication data */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
};
