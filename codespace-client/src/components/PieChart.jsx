import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ solved, total }) => {
  const data = {
    labels: ['Solved', 'Unsolved'],
    datasets: [{
      data: [solved, total - solved],
      backgroundColor: ['#10B981', '#EF4444'],
      borderWidth: 0,
    }]
  };

  return <Pie data={data} options={{ plugins: { legend: { display: false } } }} />;
};

export default PieChart;

