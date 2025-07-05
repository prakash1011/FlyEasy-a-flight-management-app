import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const DashboardChart = ({ bookingData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // If there's no booking data or chart element, don't render
    if (!bookingData || !chartRef.current) return;

    // Clean up previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Get the canvas context
    const ctx = chartRef.current.getContext('2d');

    // Process booking data for chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Get the last 6 months
    const lastSixMonths = Array(6).fill(0).map((_, i) => {
      const month = (currentMonth - i + 12) % 12;
      return months[month];
    }).reverse();

    // Count bookings by month (this would normally come from backend)
    // For demo purposes, we'll generate random data if real data isn't provided
    const bookingCounts = lastSixMonths.map(() => Math.floor(Math.random() * 30) + 5);
    const revenue = lastSixMonths.map(() => Math.floor(Math.random() * 5000) + 1000);

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: lastSixMonths,
        datasets: [
          {
            label: 'Bookings',
            data: bookingCounts,
            borderColor: '#3b82f6', // blue-500
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            borderWidth: 2,
            yAxisID: 'y',
          },
          {
            label: 'Revenue ($)',
            data: revenue,
            borderColor: '#10b981', // green-500
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            borderWidth: 2,
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#e5e7eb' // gray-200
            }
          },
          tooltip: {
            mode: 'index',
            backgroundColor: '#1f2937', // gray-800
            titleColor: '#ffffff',
            bodyColor: '#e5e7eb',
            borderColor: '#374151', // gray-700
            borderWidth: 1,
            callbacks: {
              labelColor: function(context) {
                return {
                  borderColor: context.dataset.borderColor,
                  backgroundColor: context.dataset.borderColor
                };
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(75, 85, 99, 0.2)' // gray-600 with opacity
            },
            ticks: {
              color: '#9ca3af' // gray-400
            }
          },
          y: {
            position: 'left',
            grid: {
              color: 'rgba(75, 85, 99, 0.2)'
            },
            ticks: {
              color: '#9ca3af'
            }
          },
          y1: {
            position: 'right',
            grid: {
              display: false
            },
            ticks: {
              color: '#9ca3af'
            }
          }
        }
      }
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [bookingData]);

  return (
    <div className="h-80 bg-gray-900 rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Booking & Revenue Trends</h2>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default DashboardChart;
