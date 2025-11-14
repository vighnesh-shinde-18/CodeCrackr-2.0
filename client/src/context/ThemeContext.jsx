import React, { createContext, useState, useEffect, useContext } from "react";

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext);

export const ThemeContextProvider = ({ children }) => {
    const [theme, setTheme] = useState("light")

    function toggleTheme() {
        setTheme((prevTheme)=> (prevTheme==="light"?"dark":"light"))
    }

    useEffect(()=>{
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark'); 
        root.classList.add(theme);
    },[theme])

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }} >
            {children}
        </ThemeContext.Provider>
    )
}

export default ThemeContextProvider;