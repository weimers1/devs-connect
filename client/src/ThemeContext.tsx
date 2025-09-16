import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
  setTheme: (theme: string) => void;
  loadUserTheme: () => Promise<void>;
  resetTheme: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const loadThemeFromAPI = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:6969';
        const response = await fetch(`${baseUrl}/api/settings/display`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const savedTheme = data.theme || 'light';
          setTheme(savedTheme);
          localStorage.setItem("theme", savedTheme);
        } else {
          throw new Error(`API returned ${response.status}`);
        }
      } catch (error) {
        const storedTheme = localStorage.getItem("theme") || "light";
        setTheme(storedTheme);
        localStorage.setItem("theme", storedTheme);
      }
    };
    
    loadThemeFromAPI();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const updateTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const loadUserTheme = async () => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      if (!sessionToken) return;
      
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:6969';
      const response = await fetch(`${baseUrl}/api/settings/display`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const savedTheme = data.theme || 'light';
        setTheme(savedTheme);
        localStorage.setItem("theme", savedTheme);
      }
    } catch (error) {
      // Silent fail - theme loading is not critical
    }
  };

  const resetTheme = () => {
    setTheme('light');
    localStorage.setItem('theme', 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: updateTheme, loadUserTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};  

