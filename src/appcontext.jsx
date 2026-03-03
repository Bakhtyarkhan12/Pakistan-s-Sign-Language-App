import React, { createContext, useState } from 'react';

// Create Context
export const AppContext = createContext();

// Create Provider
export const AppProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [fontSize, setFontSize] = useState('Medium'); // Options: Small, Medium, Large
  const [notifications, setNotifications] = useState(true);

  return (
    <AppContext.Provider
      value={{
        darkMode, setDarkMode,
        language, setLanguage,
        fontSize, setFontSize,
        notifications, setNotifications
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
