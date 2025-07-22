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
  userData,
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Helper to get time-based greeting
  function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  }

  return (
    <div
      className={`h-screen fixed top-0 left-0 z-30 bg-gray-900 shadow-2xl ${
        collapsed ? "w-16" : "w-64"
      } transition-all duration-300 flex flex-col justify-between py-6 px-2 relative overflow-hidden`}
    >
      {/* Toggle Menu Row */}
      <div
        className={`flex items-center w-full ${
          collapsed ? "justify-center" : "justify-between"
        } relative`}
        style={{ minHeight: "56px" }}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          className={`${
            collapsed ? "ml-0" : "ml-auto"
          } bg-gray-800/80 p-2 rounded-lg shadow-lg hover:bg-gray-700/80 transition-all duration-200 border border-gray-700 hover:border-gray-600`}
          aria-label="Toggle sidebar"
          style={{
            zIndex: 10,
            position: "relative",
          }}
        >
          <HiOutlineMenuAlt3 className="text-gray-300 text-xl" />
        </button>
      </div>

      {/* Top Section */}
      <div className="flex-1 flex flex-col">
        {/* Greeting */}
        {!collapsed && userData && userData.name && (
          <div className="mt-6 mb-2 flex flex-col items-center">
            <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 drop-shadow tracking-tight">
              {getTimeGreeting()}, {userData.name}!
            </span>
          </div>
        )}
        {/* Title */}
        {!collapsed && (
          <div className="mt-2 mb-6 flex flex-col items-center">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 drop-shadow-[0_2px_24px_rgba(56,189,248,0.25)] tracking-tight text-center transition-all duration-500">
              Dashboard
            </h2>
            <div className="w-2/3 h-1 bg-gradient-to-r from-blue-400/40 via-cyan-300/30 to-purple-400/40 blur-sm rounded-full mt-2"></div>
          </div>
        )}

        {/* Pie Chart (expanded only) */}
        {!collapsed && (
          <div className="w-full flex justify-center items-center mb-8">
            <div className="w-32 h-32 flex items-center justify-center">
              <PieChart solved={solved} total={total} />
            </div>
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
        } gap-2 px-3 py-3 rounded-lg mb-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 hover:border-gray-600 shadow transition-all duration-200`}
      >
        <HiOutlineLogout className="text-xl min-w-[20px] text-gray-300" />
        {!collapsed && (
          <span className="text-gray-300 text-sm font-medium">
            Logout
          </span>
        )}
      </button>
    </div>
  );
}

function SidebarTab({ label, icon, active, onClick, collapsed }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl font-semibold transition-all duration-200
        ${
          active
            ? "bg-gradient-to-r from-blue-900/60 via-gray-900/60 to-purple-900/60 text-blue-300 shadow-lg"
            : "hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 hover:text-blue-200 text-gray-200"
        }
        ${collapsed ? "justify-center" : ""}
      `}
      style={{
        minHeight: "44px",
      }}
    >
      <span
        className={`text-lg ${
          active ? "text-blue-300" : "text-blue-200"
        } transition-all duration-200`}
      >
        {icon}
      </span>
      {!collapsed && (
        <span
          className={`${
            active ? "text-blue-200" : "text-gray-200"
          } text-base transition-all duration-200`}
        >
          {label}
        </span>
      )}
    </button>
  );
}
