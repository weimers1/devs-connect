import React, { createContext, useContext, useState, useEffect } from "react";



const ThemeContext = createContext({ 
  theme: "light", 
  toggleTheme: () => {}, 
  setTheme: (theme: string) => {}, 
  loadUserTheme: async () => {},
  resetTheme: () => {}
});


export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const loadThemeFromAPI = async () => {
      try {
        console.log('Attempting to load theme from API...');
        const response = await fetch('http://localhost:6969/api/settings/display', {
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API response data:', data);
          const savedTheme = data.theme || 'light';
          console.log('Setting theme from API:', savedTheme);
          setTheme(savedTheme);
          localStorage.setItem("theme", savedTheme);
        } else {
          throw new Error(`API returned ${response.status}`);
        }
      } catch (error) {
        console.log('API failed, using localStorage:', error);
        // Fallback to localStorage or default to light
        const storedTheme = localStorage.getItem("theme") || "light";
        console.log('Using stored theme:', storedTheme);
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
    console.log('Theme changed to:', theme);
    // Clean all elements first
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    document.getElementById('root')?.classList.remove('dark');
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    console.log('Document classes:', document.documentElement.className);
  }, [theme]);

  const updateTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const loadUserTheme = async () => {
    try {
      console.log('Loading user theme after authentication...');
      const sessionToken = localStorage.getItem('session_token');
      
      if (!sessionToken) {
        console.log('No session token found');
        return;
      }
      
      const response = await fetch('http://localhost:6969/api/settings/display', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      
      console.log('Theme API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
      const savedTheme = data.theme || 'light';
        setTheme(savedTheme);
        localStorage.setItem("theme", savedTheme);
      } else {
        console.log('Theme API failed with status:', response.status);
      }
    } catch (error) {
      console.log('Failed to load user theme:', error);
    }
  };

  const resetTheme = () => {
    console.log('Resetting theme to default (light)');
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

