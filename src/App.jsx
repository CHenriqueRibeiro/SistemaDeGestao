import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./app.css";
import Container from "@mui/material/Container";
import { Outlet } from "react-router-dom";
import { CarrinhoProvider } from "./context/useCarrinho";
import { CartProvider } from "./context/useContextMesas";
import { BusinessProvider } from "./context/useBusinessData";

export default function App() {
  return (
    <Container id="app" maxWidth="sm">
      <CartProvider>
        <CarrinhoProvider>
          <BusinessProvider>
            <Outlet />
          </BusinessProvider>
        </CarrinhoProvider>
      </CartProvider>
    </Container>
  );
}
