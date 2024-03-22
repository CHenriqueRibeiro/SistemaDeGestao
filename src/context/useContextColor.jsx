import { createContext, useContext, useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

const ColorContext = createContext();

// eslint-disable-next-line react/prop-types
export const ColorProvider = ({ children }) => {
  const [color, setColor] = useState(null);
  const [isColorLoaded, setColorLoaded] = useState(false);
  useEffect(() => {
    const database = getDatabase();
    const databaseRef = ref(database, "corsecundaria");

    const unsubscribe = onValue(databaseRef, (snapshot) => {
      const colorFromDB = snapshot.val();
      if (colorFromDB) {
        setColor(colorFromDB);
        setColorLoaded(true);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isColorLoaded) {
    return null;
  }

  return (
    <ColorContext.Provider value={{ color, setColor }}>
      {children}
    </ColorContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useColor = () => useContext(ColorContext);
