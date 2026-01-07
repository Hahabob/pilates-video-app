import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiClient, type User } from "../lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  refreshUser: () => Promise<void>;
  getAccessLevelLabel: (role: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const currentUser = await apiClient.getProfile();
          setUser(currentUser);
        } catch (error) {
          apiClient.logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    setUser(response.user);
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const getAccessLevelLabel = (role: string): string => {
    const labels: Record<string, string> = {
      admin: "מנהל",
      mat: "מזרן",
      machine: "מכשירים",
      combined: "משולב",
    };
    return labels[role] || role;
  };

  const refreshUser = async () => {
    if (apiClient.isAuthenticated()) {
      try {
        const currentUser = await apiClient.getProfile();
        setUser(currentUser);
      } catch (error) {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        refreshUser,
        getAccessLevelLabel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
