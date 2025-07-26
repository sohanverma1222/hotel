import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  ResponsiveContainer 
} from 'recharts';
import * as api from '../services/api';
import '../styles/Reports.css';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportType, setReportType] = useState('revenue');

  // Fetch data for different report types
  const { data: revenueData, isLoading: revenueLoading } = useQuery(
    ['revenue-report', selectedPeriod],
    () => api.getRevenueReport(selectedPeriod),
    {
      enabled: reportType === 'revenue',
      onError: (error) => {
        toast.error('Failed to fetch revenue data');
        console.error('Revenue data error:', error);
      }
    }
  );

  const { data: occupancyData, isLoading: occupancyLoading } = useQuery(
    ['occupancy-report', selectedPeriod],
    () => api.getOccupancyReport(selectedPeriod),
    {
      enabled: reportType === 'occupancy',
      onError: (error) => {
        toast.error('Failed to fetch occupancy data');
        console.error('Occupancy data error:', error);
      }
    }
  );

  const { data: guestData, isLoading: guestLoading } = useQuery(
    ['guest-stats'],
    api.getGuestStats,
    {
      enabled: reportType === 'guests',
      onError: (error) => {
        toast.error('Failed to fetch guest statistics');
        console.error('Guest stats error:', error);
      }
    }
  );

  // Mock data for demo purposes
  const mockRevenueData = [
    { month: 'Jan', revenue: 45000, bookings: 120 },
    { month: 'Feb', revenue: 52000, bookings: 140 },
    { month: 'Mar', revenue: 48000, bookings: 130 },
    { month: 'Apr', revenue: 61000, bookings: 165 },
    { month: 'May', revenue: 58000, bookings: 155 },
    { month: 'Jun', revenue: 67000, bookings: 180 }
  ];

  const mockOccupancyData = [
    { name: 'Standard Rooms', value: 65, count: 45 },
    { name: 'Deluxe Rooms', value: 80, count: 32 },
    { name: 'Suites', value: 45, count: 9 },
    { name: 'Premium Suites', value: 70, count: 14 }
  ];

  const mockGuestData = [
    { period: 'Week 1', newGuests: 25, returningGuests: 15 },
    { period: 'Week 2', newGuests: 30, returningGuests: 20 },
    { period: 'Week 3', newGuests: 35, returningGuests: 25 },
    { period: 'Week 4', newGuests: 28, returningGuests: 32 }
  ];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88'];

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleReportTypeChange = (type) => {
    setReportType(type);
  };

  const exportReport = () => {
    toast.success('Report export feature coming soon!');
  };

  const isLoading = revenueLoading || occupancyLoading || guestLoading;

  return (
    <div className=\"reports-page\">
      <div className=\"reports-header\">
        <h1 className=\"page-title\">Reports & Analytics</h1>
        <p className=\"page-description\">
          Comprehensive insights into your hotel's performance
        </p>
      </div>

      {/* Controls */}
      <div className=\"reports-controls\">
        <div className=\"control-group\">
          <label>Report Type:</label>
          <div className=\"report-type-buttons\">
            <button
              className={`control-btn ${reportType === 'revenue' ? 'active' : ''}`}
              onClick={() => handleReportTypeChange('revenue')}
            >
              Revenue
            </button>
            <button
              className={`control-btn ${reportType === 'occupancy' ? 'active' : ''}`}
              onClick={() => handleReportTypeChange('occupancy')}
            >
              Occupancy
            </button>
            <button
              className={`control-btn ${reportType === 'guests' ? 'active' : ''}`}
              onClick={() => handleReportTypeChange('guests')}
            >
              Guest Analytics
            </button>
          </div>
        </div>

        <div className=\"control-group\">
          <label>Period:</label>
          <select 
            value={selectedPeriod} 
            onChange={(e) => handlePeriodChange(e.target.value)}
            className=\"period-select\"
          >
            <option value=\"week\">This Week</option>
            <option value=\"month\">This Month</option>
            <option value=\"quarter\">This Quarter</option>
            <option value=\"year\">This Year</option>
          </select>
        </div>

        <button className=\"export-btn\" onClick={exportReport}>
          Export Report
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className=\"loading-container\">
          <div className=\"loading-spinner\"></div>
          <p>Loading report data...</p>
        </div>
      )}

      {/* Report Content */}
      {!isLoading && (
        <div className=\"reports-content\">
          {reportType === 'revenue' && (
            <div className=\"report-section\">
              <h2>Revenue Analytics</h2>
              <div className=\"chart-container\">
                <ResponsiveContainer width=\"100%\" height={400}>
                  <BarChart data={revenueData || mockRevenueData}>
                    <CartesianGrid strokeDasharray=\"3 3\" />
                    <XAxis dataKey=\"month\" />
                    <YAxis yAxisId=\"left\" orientation=\"left\" />
                    <YAxis yAxisId=\"right\" orientation=\"right\" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? `$${value.toLocaleString()}` : value,
                        name === 'revenue' ? 'Revenue' : 'Bookings'
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId=\"left\" dataKey=\"revenue\" fill=\"#8884d8\" name=\"Revenue ($)\" />
                    <Bar yAxisId=\"right\" dataKey=\"bookings\" fill=\"#82ca9d\" name=\"Bookings\" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className=\"summary-cards\">
                <div className=\"summary-card\">
                  <h3>Total Revenue</h3>
                  <p className=\"amount\">$331,000</p>
                  <span className=\"change positive\">+12.5%</span>
                </div>
                <div className=\"summary-card\">
                  <h3>Average Per Booking</h3>
                  <p className=\"amount\">$285</p>
                  <span className=\"change positive\">+3.2%</span>
                </div>
                <div className=\"summary-card\">
                  <h3>Total Bookings</h3>
                  <p className=\"amount\">1,160</p>
                  <span className=\"change positive\">+8.7%</span>
                </div>
              </div>
            </div>
          )}

          {reportType === 'occupancy' && (
            <div className=\"report-section\">
              <h2>Occupancy Analysis</h2>
              <div className=\"chart-container\">
                <ResponsiveContainer width=\"100%\" height={400}>
                  <PieChart>
                    <Pie
                      data={occupancyData || mockOccupancyData}
                      cx=\"50%\"
                      cy=\"50%\"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={120}
                      fill=\"#8884d8\"
                      dataKey=\"value\"
                    >
                      {(occupancyData || mockOccupancyData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Occupancy Rate']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className=\"occupancy-table\">
                <h3>Room Type Breakdown</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Room Type</th>
                      <th>Occupancy Rate</th>
                      <th>Occupied Rooms</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(occupancyData || mockOccupancyData).map((room, index) => (
                      <tr key={index}>
                        <td>{room.name}</td>
                        <td>
                          <span className=\"occupancy-rate\">{room.value}%</span>
                        </td>
                        <td>{room.count}</td>
                        <td>
                          <span className={`status ${room.value >= 70 ? 'high' : room.value >= 50 ? 'medium' : 'low'}`}>
                            {room.value >= 70 ? 'High' : room.value >= 50 ? 'Medium' : 'Low'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === 'guests' && (
            <div className=\"report-section\">
              <h2>Guest Analytics</h2>
              <div className=\"chart-container\">
                <ResponsiveContainer width=\"100%\" height={400}>
                  <LineChart data={guestData || mockGuestData}>
                    <CartesianGrid strokeDasharray=\"3 3\" />
                    <XAxis dataKey=\"period\" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type=\"monotone\" 
                      dataKey=\"newGuests\" 
                      stroke=\"#8884d8\" 
                      strokeWidth={3}
                      name=\"New Guests\"
                    />
                    <Line 
                      type=\"monotone\" 
                      dataKey=\"returningGuests\" 
                      stroke=\"#82ca9d\" 
                      strokeWidth={3}
                      name=\"Returning Guests\"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className=\"guest-metrics\">
                <div className=\"metric-card\">
                  <h3>Guest Satisfaction</h3>
                  <div className=\"rating\">
                    <span className=\"stars\">★★★★☆</span>
                    <span className=\"score\">4.2/5.0</span>
                  </div>
                </div>
                <div className=\"metric-card\">
                  <h3>Repeat Guest Rate</h3>
                  <p className=\"percentage\">68%</p>
                  <span className=\"change positive\">+5.3%</span>
                </div>
                <div className=\"metric-card\">
                  <h3>Average Stay Duration</h3>
                  <p className=\"duration\">3.2 nights</p>
                  <span className=\"change neutral\">±0.1</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;