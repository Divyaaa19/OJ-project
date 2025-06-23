import { Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-dashboard" element={<AdminDashboard/>}/>
      <Route path="/user-dashboard" element={<UserDashboard/>}/>
    </Routes>
  );
}

export default App;
