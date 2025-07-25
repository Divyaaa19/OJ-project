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
import ProblemsPage from "./pages/ProblemsPage";
import ContestsComingSoon from "./pages/ContestsComingSoon";
import LeaderboardPlaceholder from "./pages/LeaderboardPlaceholder";

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
      <Route path="/problems" element={<ProblemsPage />} />
      <Route path="/contests" element={<ContestsComingSoon />} />
      <Route path="/leaderboard" element={<LeaderboardPlaceholder />} />
    </Routes>
  );
}

export default App;
