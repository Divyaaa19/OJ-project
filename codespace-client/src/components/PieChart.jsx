import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ solved, total }) => {
  const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
  const data = {
    labels: ['Solved', 'Unsolved'],
    datasets: [{
      data: [solved, total - solved],
      backgroundColor: [
        '#10B981', // green-500
        '#EF4444', // red-500
      ],
      borderWidth: 0,
      hoverOffset: 8,
      borderRadius: 8,
    }]
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#10B981',
        bodyColor: '#fff',
        borderColor: '#10B981',
        borderWidth: 1,
      },
    },
    animation: {
      animateRotate: true,
      duration: 1200,
      easing: 'easeInOutQuart',
    },
    cutout: '65%',
    layout: { padding: 0 },
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <Pie data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-extrabold text-green-400 drop-shadow-lg">{percent}%</span>
      </div>
    </div>
  );
};

export default PieChart;

