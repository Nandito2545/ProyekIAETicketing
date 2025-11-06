import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import Login from "./pages/Login";
import MyTickets from "./pages/MyTickets";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-tickets" element={<MyTickets />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
