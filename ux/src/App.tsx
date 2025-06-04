import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from 'notistack';
import { Dashboard, Home, Orders } from "./pages";
import { MenuItemProvider } from "./stores/menuItemStore";
import { OrderProvider } from "./stores/orderStore";
import './App.css';
import Menu from "./pages/Menu";

export default function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <MenuItemProvider>
        <OrderProvider>
          <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
          </Router>
        </OrderProvider>
      </MenuItemProvider>
    </SnackbarProvider>
  );
}
