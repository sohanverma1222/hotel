import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { 
  FaUsers, 
  FaBed, 
  FaCalendarCheck, 
  FaDollarSign,
  FaTrendUp,
  FaTrendDown,
  FaClock,
  FaChartLine
} from 'react-icons/fa';
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
import guestService from '../services/guestService';
import roomService from '../services/roomService';
import reservationService from '../services/reservationService';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch statistics
  const { data: guestStats, isLoading: guestLoading } = useQuery(
    'guestStats',
    guestService.getGuestStats,
    { refetchInterval: 30000 }
  );

  const { data: roomStats, isLoading: roomLoading } = useQuery(
    'roomStats',
    roomService.getRoomStats,
    { refetchInterval: 30000 }
  );

  const { data: reservationStats, isLoading: reservationLoading } = useQuery(
    'reservationStats',
    reservationService.getReservationStats,
    { refetchInterval: 30000 }
  );

  // Sample data for charts (in real app, this would come from API)
  const monthlyRevenue = [
    { month: 'Jan', revenue: 45000, bookings: 120 },
    { month: 'Feb', revenue: 52000, bookings: 135 },
    { month: 'Mar', revenue: 48000, bookings: 128 },
    { month: 'Apr', revenue: 61000, bookings: 155 },
    { month: 'May', revenue: 55000, bookings: 142 },
    { month: 'Jun', revenue: 67000, bookings: 168 }
  ];

  const roomTypeDistribution = roomStats?.roomTypes?.map(type => ({
    name: type._id,
    value: type.count
  })) || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue', loading = false }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className=\"stat-card-content\">
        <div className=\"stat-header\">
          <div className=\"stat-icon-container\">
            <Icon className=\"stat-icon\" />
          </div>
          <div className=\"stat-info\">
            <h3 className=\"stat-title\">{title}</h3>
            <div className=\"stat-value\">
              {loading ? (
                <div className=\"loading-spinner\" />
              ) : (
                value
              )}
            </div>
          </div>
        </div>
        {trend && (
          <div className=\"stat-trend\">
            {trend === 'up' ? (
              <FaTrendUp className=\"trend-icon trend-up\" />
            ) : (
              <FaTrendDown className=\"trend-icon trend-down\" />
            )}
            <span className={`trend-value ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
              {trendValue}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className=\"dashboard\">
      <div className=\"dashboard-header\">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening at your hotel today.</p>
        </div>
        <div className=\"dashboard-time\">
          <FaClock className=\"clock-icon\" />
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className=\"stats-grid\">
        <StatCard
          title=\"Total Guests\"
          value={guestStats?.totalGuests || 0}
          icon={FaUsers}
          trend=\"up\"
          trendValue={12}
          color=\"blue\"
          loading={guestLoading}
        />
        <StatCard
          title=\"Available Rooms\"
          value={roomStats?.availableRooms || 0}
          icon={FaBed}
          trend=\"down\"
          trendValue={5}
          color=\"green\"
          loading={roomLoading}
        />
        <StatCard
          title=\"Check-ins Today\"
          value={reservationStats?.checkInsToday || 0}
          icon={FaCalendarCheck}
          trend=\"up\"
          trendValue={8}
          color=\"orange\"
          loading={reservationLoading}
        />
        <StatCard
          title=\"Monthly Revenue\"
          value={formatCurrency(reservationStats?.monthlyRevenue || 0)}
          icon={FaDollarSign}
          trend=\"up\"
          trendValue={15}
          color=\"purple\"
          loading={reservationLoading}
        />
      </div>

      {/* Charts Section */}
      <div className=\"charts-grid\">
        {/* Revenue Chart */}
        <div className=\"chart-card\">
          <div className=\"chart-header\">
            <h3>Monthly Revenue & Bookings</h3>
            <div className=\"chart-legend\">
              <div className=\"legend-item\">
                <div className=\"legend-color\" style={{ backgroundColor: '#3b82f6' }}></div>
                <span>Revenue</span>
              </div>
              <div className=\"legend-item\">
                <div className=\"legend-color\" style={{ backgroundColor: '#10b981' }}></div>
                <span>Bookings</span>
              </div>
            </div>
          </div>
          <div className=\"chart-container\">
            <ResponsiveContainer width=\"100%\" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray=\"3 3\" stroke=\"#e2e8f0\" />
                <XAxis dataKey=\"month\" stroke=\"#64748b\" />
                <YAxis stroke=\"#64748b\" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey=\"revenue\" fill=\"#3b82f6\" radius={[4, 4, 0, 0]} />
                <Bar dataKey=\"bookings\" fill=\"#10b981\" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Distribution Chart */}
        <div className=\"chart-card\">
          <div className=\"chart-header\">
            <h3>Room Type Distribution</h3>
            <div className=\"chart-subtitle\">
              Current room allocation
            </div>
          </div>
          <div className=\"chart-container\">
            <ResponsiveContainer width=\"100%\" height={300}>
              <PieChart>
                <Pie
                  data={roomTypeDistribution}
                  cx=\"50%\"
                  cy=\"50%\"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill=\"#8884d8\"
                  dataKey=\"value\"
                >
                  {roomTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className=\"dashboard-bottom\">
        {/* Quick Actions */}
        <div className=\"quick-actions-card\">
          <h3>Quick Actions</h3>
          <div className=\"quick-actions-grid\">
            <button className=\"quick-action-btn btn-primary\">
              <FaUsers />
              <span>Add Guest</span>
            </button>
            <button className=\"quick-action-btn btn-success\">
              <FaBed />
              <span>Add Room</span>
            </button>
            <button className=\"quick-action-btn btn-warning\">
              <FaCalendarCheck />
              <span>New Booking</span>
            </button>
            <button className=\"quick-action-btn btn-secondary\">
              <FaChartLine />
              <span>View Reports</span>
            </button>
          </div>
        </div>

        {/* Room Status Overview */}
        <div className=\"room-status-card\">
          <h3>Room Status Overview</h3>
          <div className=\"room-status-list\">
            <div className=\"room-status-item\">
              <div className=\"status-indicator available\"></div>
              <div className=\"status-info\">
                <span className=\"status-label\">Available</span>
                <span className=\"status-count\">{roomStats?.availableRooms || 0} rooms</span>
              </div>
            </div>
            <div className=\"room-status-item\">
              <div className=\"status-indicator occupied\"></div>
              <div className=\"status-info\">
                <span className=\"status-label\">Occupied</span>
                <span className=\"status-count\">{roomStats?.occupiedRooms || 0} rooms</span>
              </div>
            </div>
            <div className=\"room-status-item\">
              <div className=\"status-indicator maintenance\"></div>
              <div className=\"status-info\">
                <span className=\"status-label\">Maintenance</span>
                <span className=\"status-count\">{roomStats?.maintenanceRooms || 0} rooms</span>
              </div>
            </div>
            <div className=\"room-status-item\">
              <div className=\"status-indicator cleaning\"></div>
              <div className=\"status-info\">
                <span className=\"status-label\">Cleaning</span>
                <span className=\"status-count\">{roomStats?.cleaningRooms || 0} rooms</span>
              </div>
            </div>
          </div>
          
          <div className=\"occupancy-rate\">
            <div className=\"occupancy-label\">Occupancy Rate</div>
            <div className=\"occupancy-percentage\">
              {roomStats?.occupancyRate || 0}%
            </div>
            <div className=\"occupancy-bar\">
              <div 
                className=\"occupancy-fill\" 
                style={{ width: `${roomStats?.occupancyRate || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;