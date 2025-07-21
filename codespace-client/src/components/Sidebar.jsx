import PieChart from "./PieChart";
import { FaTachometerAlt, FaStar, FaChartLine } from "react-icons/fa";
import { HiOutlineMenuAlt3, HiOutlineLogout } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function Sidebar({
  solved,
  total,
  activeTab,
  setActiveTab,
  collapsed,
  toggleCollapse,
  userName,
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div
      className={`h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-black text-white ${
        collapsed ? "w-16" : "w-64"
      } transition-all duration-300 flex flex-col justify-between p-4 relative shadow-2xl`}
    >
      {/* Top Section */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar: Greeting + Toggle */}
        <div
          className={`flex items-center justify-between mb-4 ${
            collapsed ? "flex-col gap-2" : ""
          }`}
        >
          {!collapsed && (
            <div className="text-sm font-medium text-blue-300 whitespace-nowrap">
              {getTimeGreeting()}, {userName}!
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="bg-gray-800 p-2 rounded hover:bg-gray-700"
          >
            <HiOutlineMenuAlt3 className="text-white text-xl" />
          </button>
        </div>

        {/* Dashboard Title */}
        {!collapsed && (
          <h2 className="text-2xl font-bold mb-4 text-center tracking-wide text-blue-300 drop-shadow">
            Dashboard
          </h2>
        )}

        {/* Pie Chart */}
        {!collapsed && (
          <div className="h-44 flex items-center justify-center w-full mb-8">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/30 via-blue-400/10 to-fuchsia-400/10 blur-2xl animate-pulse z-0" />
              <PieChart solved={solved} total={total} />
              <div className="absolute inset-0 rounded-full border-4 border-blue-400/60 animate-glow pointer-events-none" />
            </div>
          </div>
        )}

        {/* Tabs */}
        <nav
          className={`space-y-2 w-full flex flex-col items-center ${
            collapsed ? "mt-2" : "mt-6"
          }`}
        >
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
          <SidebarTab
            label="Activity"
            icon={<FaChartLine />}
            active={activeTab === "Activity"}
            onClick={() => setActiveTab("Activity")}
            collapsed={collapsed}
          />
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className={`flex items-center ${
          collapsed ? "justify-center" : "justify-start"
        } gap-2 px-3 py-3 rounded-2xl mt-4 bg-gradient-to-br from-red-900/30 to-red-700/10 border border-red-600/40 hover:bg-red-600/40 hover:border-red-600 transition-all duration-200`}
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
