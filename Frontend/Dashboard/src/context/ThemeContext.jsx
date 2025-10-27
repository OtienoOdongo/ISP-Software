






// import React, { createContext, useContext, useState, useEffect } from "react";

// const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [theme, setTheme] = useState(() => {
//     // Check for saved theme preference or use system preference
//     const savedTheme = localStorage.getItem("theme");
//     if (savedTheme) return savedTheme;
    
//     // Check system preference
//     if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
//       return "dark";
//     }
    
//     return "light"; // Default theme
//   });

//   useEffect(() => {
//     // Save theme preference
//     localStorage.setItem("theme", theme);
    
//     // Apply theme to document
//     if (theme === "dark") {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error("useTheme must be used within a ThemeProvider");
//   }
//   return context;
// };




import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return "dark";
    }
    
    return "light";
  });

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    
    // Add transition class for smooth theme change
    document.documentElement.classList.add('theme-transition');
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Remove transition class after animation completes
    const timeout = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 500);

    return () => clearTimeout(timeout);
  }, [theme]);

  const toggleTheme = () => {
    setIsAnimating(true);
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    
    // Reset animation state
    setTimeout(() => setIsAnimating(false), 500);
  };

  const value = {
    theme,
    toggleTheme,
    isAnimating,
    setTheme: (newTheme) => {
      setIsAnimating(true);
      setTheme(newTheme);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};