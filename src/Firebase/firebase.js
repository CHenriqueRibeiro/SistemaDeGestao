import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyCtUEJucj4FgNrJgwLhcpzZ7OJVCqjM8ls",
  authDomain: "testeapp-666bc.firebaseapp.com",
  projectId: "testeapp-666bc",
  storageBucket: "testeapp-666bc.appspot.com",
  messagingSenderId: "273940847816",
  appId: "1:273940847816:web:7d5c1f136cb8cac3c159fd",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);
export { app, database, storage };
