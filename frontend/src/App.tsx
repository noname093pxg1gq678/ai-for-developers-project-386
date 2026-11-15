import "@mantine/core/styles.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import BookingPage from "./pages/BookingPage";
import PublicPage from "./pages/PublicPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicPage />} />
      <Route path="/book/:typeId" element={<BookingPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <MantineProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MantineProvider>
  );
}
