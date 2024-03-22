import { createContext, useContext, useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

const ColorContext = createContext();

// eslint-disable-next-line react/prop-types
export const BusinessProvider = ({ children }) => {
  const [color, setColor] = useState(null);
  const [businessHours, setBusinessHours] = useState([]);
  const [payment, setPayment] = useState([]);
  const [isDataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const database = getDatabase();
    const colorRef = ref(database, "corsecundaria");
    const businessHoursRef = ref(database, "horario_de_funcionamento");
    const formPayment = ref(database, "formaDePagamentos");
    const colorListener = onValue(colorRef, (snapshot) => {
      const colorFromDB = snapshot.val();
      setColor(colorFromDB || "#F76D25");
    });

    const businessHoursListener = onValue(businessHoursRef, (snapshot) => {
      const businessHoursFromDB = snapshot.val();
      const businessHoursArray = Object.keys(businessHoursFromDB).map(
        (key) => ({
          day: key,
          ...businessHoursFromDB[key],
        })
      );
      console.log(businessHours);
      setBusinessHours(businessHoursArray);
      setDataLoaded(true);
    });
    const formOfPayment = onValue(formPayment, (snapshot) => {
      const formPaymentFromDB = snapshot.val();
      const formPaymentArray = formPaymentFromDB.map((payment) => ({
        forma: payment,
      }));
      console.log("teste", payment);
      setPayment(formPaymentArray);
      setDataLoaded(true);
    });

    return () => {
      colorListener();
      businessHoursListener();
      formOfPayment();
    };
  }, []);

  if (!isDataLoaded) {
    return null;
  }

  return (
    <ColorContext.Provider value={{ color, setColor, businessHours, payment }}>
      {children}
    </ColorContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBusinessData = () => useContext(ColorContext);
