import { Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import AddProblem from "./admin/addProblem";
import EditProblem from "./admin/editProblem";
import ProblemDetail from "./admin/problemDetail";
import UserProblemPage from "./pages/UserProblemPage"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-dashboard" element={<AdminDashboard/>}/>
      <Route path="/user-dashboard" element={<UserDashboard/>}/>
      <Route path="/admin/add-problem" element={<AddProblem />} />
      <Route path="/admin/edit-problem/:id" element={<EditProblem />} />
      <Route path="/problems/:id" element={<ProblemDetail />} />
      <Route path="/user-problems/:id" element={<UserProblemPage />} />
    </Routes>
  );
}

export default App;
