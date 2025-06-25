import PieChart from "./PieChart";
export default function Sidebar({ solved, total, activeTab, setActiveTab }) {
  return (
    <div className="w-64 bg-gray-900 text-white p-4 space-y-6 h-screen fixed">
      <h2 className="text-xl font-bold">📊 Dashboard</h2>
      <div className="h-40">
        <PieChart solved={solved} total={total} />
      </div>
      <nav className="mt-6 space-y-2">
        {["Problems", "Favorites"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`block w-full text-left px-2 py-1 rounded ${
              activeTab === tab ? "bg-gray-800 text-blue-400" : "hover:text-blue-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
}
