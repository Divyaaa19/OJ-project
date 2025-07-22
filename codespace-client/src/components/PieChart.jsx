import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import React from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ solved, total }) => {
  const unsolved = Math.max(0, total - solved);
  const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

  const data = {
    labels: ['Solved', 'Unsolved'],
    datasets: [
      {
        data: [solved, unsolved],
        backgroundColor: [
          'rgba(16, 185, 129, 0.85)', // emerald-500
          'rgba(239, 68, 68, 0.65)',  // red-500
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 3,
        hoverOffset: 8,
        cutout: '70%',
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#232946',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        xAlign: 'right', // show tooltip outward to the right
        yAlign: 'center',
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}`;
          }
        },
      },
    },
    animation: {
      animateRotate: true,
      duration: 1200,
      easing: 'easeOutQuart',
    },
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Pie data={data} options={options} width={140} height={140} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-base font-bold text-emerald-400 drop-shadow-glow">
          {percent}%
        </span>
        <span className="text-[10px] text-gray-300 font-semibold mt-0.5 tracking-wide">
          Solved
        </span>
        <span className="text-[10px] text-blue-200 mt-0.5">
          {solved} / {total}
        </span>
      </div>
    </div>
  );
};

export default PieChart;

