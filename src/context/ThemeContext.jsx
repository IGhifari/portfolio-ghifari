import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const getInitialDark = () => {
    try {
        const stored = localStorage.getItem('nb-theme');
        if (stored === 'dark' || stored === 'light') return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
        return false;
    }
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(getInitialDark);

    useEffect(() => {
        const theme = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('nb-theme', theme);
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
