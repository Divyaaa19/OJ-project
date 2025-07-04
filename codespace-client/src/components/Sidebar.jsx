import PieChart from "./PieChart";
import { FaTachometerAlt, FaStar } from "react-icons/fa";
import { HiOutlineMenuAlt3, HiOutlineLogout } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ solved, total, activeTab, setActiveTab, collapsed, toggleCollapse }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className={`h-screen bg-gray-900 text-white ${collapsed ? "w-16" : "w-64"} transition-all duration-300 flex flex-col justify-between p-4 relative`}>

      {/* ☰ Toggle Menu */}
      <button
        onClick={toggleCollapse}
        className="absolute top-4 right-4 bg-gray-800 p-2 rounded hover:bg-gray-700"
      >
        <HiOutlineMenuAlt3 className="text-white text-xl" />
      </button>

      {/* Top Section */}
      <div>
        {/* Title */}
        {!collapsed && <h2 className="text-2xl font-bold mt-12 mb-4 text-center">Dashboard</h2>}

        {/* Pie Chart */}
        {!collapsed && (
          <div className="h-40 ml-4 w-full mb-6">
            <PieChart solved={solved} total={total} />
          </div>
        )}

        {/* Tabs */}
        <nav className="space-y-2 w-full flex mt-6 flex-col items-center">
          <SidebarTab
            label="Problems"
            icon={<FaTachometerAlt />}
            active={activeTab === "Problems"}
            onClick={() => setActiveTab("Problems")}
            collapsed={collapsed}
          />
          <SidebarTab
            label="Favorites"
            icon={<FaStar />}
            active={activeTab === "Favorites"}
            onClick={() => setActiveTab("Favorites")}
            collapsed={collapsed}
          />
        </nav>
      </div>

      {/* 🔒 Logout Button */}
<button
  onClick={handleLogout}
  className={`flex items-center ${collapsed ? "justify-center" : "justify-start"} 
    gap-2 px-3 py-3 rounded mb-2 hover:bg-red-600 transition-all duration-200`}
>
  <HiOutlineLogout className="text-2xl min-w-[24px]" />
  {!collapsed && <span className="text-white text-sm">Logout</span>}
</button>

    </div>
  );
}

function SidebarTab({ label, icon, active, onClick, collapsed }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded ${
        active ? "bg-gray-800 text-blue-400" : "hover:text-blue-300"
      } transition-all duration-200`}
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}
