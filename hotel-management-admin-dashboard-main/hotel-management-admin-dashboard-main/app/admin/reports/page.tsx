'use client';

import { useState, useEffect } from 'react';
import { useOccupancyReport, useRevenueReport, useUtilizationReport, useComprehensiveReport } from '@/hooks/use-reports';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  RefreshCw,
  Users,
  Bed,
  ClipboardList,
  Activity
} from 'lucide-react';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedReport, setSelectedReport] = useState('comprehensive');
  
  // Initialize with last 30 days
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const { occupancyReport, isLoading: occupancyLoading, error: occupancyError } = useOccupancyReport(startDate, endDate);
  const { revenueReport, isLoading: revenueLoading, error: revenueError } = useRevenueReport(startDate, endDate);
  const { utilizationReport, isLoading: utilizationLoading, error: utilizationError } = useUtilizationReport(startDate, endDate);
  const { comprehensiveReport, isLoading: comprehensiveLoading, error: comprehensiveError } = useComprehensiveReport(startDate, endDate);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return TrendingUp;
    if (value < 0) return TrendingDown;
    return Activity;
  };

  const isLoading = occupancyLoading || revenueLoading || utilizationLoading || comprehensiveLoading;
  const hasError = occupancyError || revenueError || utilizationError || comprehensiveError;

  if (isLoading) {
    return (
      <div className=\"flex items-center justify-center min-h-[400px]\">
        <div className=\"text-center\">
          <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto\"></div>
          <p className=\"mt-2 text-gray-600\">Generating reports...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className=\"text-center py-8\">
        <p className=\"text-red-600\">Error loading reports. Please try again.</p>
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      {/* Header */}
      <div className=\"flex justify-between items-center\">
        <div>
          <h1 className=\"text-2xl font-bold text-gray-900\">Analytics & Reports</h1>
          <p className=\"text-gray-600\">Hotel performance insights and business analytics</p>
        </div>
        <div className=\"flex gap-2\">
          <Button variant=\"outline\" onClick={() => window.location.reload()}>
            <RefreshCw className=\"w-4 h-4 mr-2\" />
            Refresh
          </Button>
          <Button className=\"bg-indigo-600 hover:bg-indigo-700\">
            <Download className=\"w-4 h-4 mr-2\" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className=\"p-4\">
        <div className=\"flex flex-wrap gap-4 items-center\">
          <div className=\"flex items-center gap-2\">
            <Calendar className=\"w-4 h-4 text-gray-500\" />
            <Label htmlFor=\"startDate\">From:</Label>
            <Input
              id=\"startDate\"
              type=\"date\"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className=\"w-40\"
            />
          </div>
          <div className=\"flex items-center gap-2\">
            <Label htmlFor=\"endDate\">To:</Label>
            <Input
              id=\"endDate\"
              type=\"date\"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className=\"w-40\"
            />
          </div>
        </div>
      </Card>

      {/* Key Metrics Overview */}
      {comprehensiveReport && (
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4\">
          <Card className=\"p-4\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-gray-600\">Total Revenue</p>
                <p className=\"text-2xl font-bold text-gray-900\">
                  {formatCurrency(comprehensiveReport.summary.totalRevenue)}
                </p>
              </div>
              <DollarSign className=\"w-8 h-8 text-green-600\" />
            </div>
            {comprehensiveReport.trends.revenueGrowth !== 0 && (
              <div className=\"flex items-center mt-2\">
                {(() => {
                  const TrendIcon = getTrendIcon(comprehensiveReport.trends.revenueGrowth);
                  return <TrendIcon className={`w-4 h-4 mr-1 ${getTrendColor(comprehensiveReport.trends.revenueGrowth)}`} />;
                })()}
                <span className={`text-sm ${getTrendColor(comprehensiveReport.trends.revenueGrowth)}`}>
                  {comprehensiveReport.trends.revenueGrowth > 0 ? '+' : ''}{comprehensiveReport.trends.revenueGrowth}%
                </span>
              </div>
            )}
          </Card>

          <Card className=\"p-4\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-gray-600\">Avg Occupancy</p>
                <p className=\"text-2xl font-bold text-gray-900\">
                  {comprehensiveReport.summary.averageOccupancy}%
                </p>
              </div>
              <Bed className=\"w-8 h-8 text-blue-600\" />
            </div>
            {comprehensiveReport.trends.occupancyGrowth !== 0 && (
              <div className=\"flex items-center mt-2\">
                {(() => {
                  const TrendIcon = getTrendIcon(comprehensiveReport.trends.occupancyGrowth);
                  return <TrendIcon className={`w-4 h-4 mr-1 ${getTrendColor(comprehensiveReport.trends.occupancyGrowth)}`} />;
                })()}
                <span className={`text-sm ${getTrendColor(comprehensiveReport.trends.occupancyGrowth)}`}>
                  {comprehensiveReport.trends.occupancyGrowth > 0 ? '+' : ''}{comprehensiveReport.trends.occupancyGrowth}%
                </span>
              </div>
            )}
          </Card>

          <Card className=\"p-4\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-gray-600\">Total Bookings</p>
                <p className=\"text-2xl font-bold text-gray-900\">
                  {comprehensiveReport.summary.totalBookings}
                </p>
              </div>
              <BarChart3 className=\"w-8 h-8 text-indigo-600\" />
            </div>
            {comprehensiveReport.trends.bookingGrowth !== 0 && (
              <div className=\"flex items-center mt-2\">
                {(() => {
                  const TrendIcon = getTrendIcon(comprehensiveReport.trends.bookingGrowth);
                  return <TrendIcon className={`w-4 h-4 mr-1 ${getTrendColor(comprehensiveReport.trends.bookingGrowth)}`} />;
                })()}
                <span className={`text-sm ${getTrendColor(comprehensiveReport.trends.bookingGrowth)}`}>
                  {comprehensiveReport.trends.bookingGrowth > 0 ? '+' : ''}{comprehensiveReport.trends.bookingGrowth}%
                </span>
              </div>
            )}
          </Card>

          <Card className=\"p-4\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-gray-600\">Room Utilization</p>
                <p className=\"text-2xl font-bold text-gray-900\">
                  {comprehensiveReport.summary.averageUtilization}%
                </p>
              </div>
              <Activity className=\"w-8 h-8 text-purple-600\" />
            </div>
          </Card>

          <Card className=\"p-4\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-gray-600\">Total Guests</p>
                <p className=\"text-2xl font-bold text-gray-900\">
                  {comprehensiveReport.summary.totalGuests}
                </p>
              </div>
              <Users className=\"w-8 h-8 text-orange-600\" />
            </div>
          </Card>

          <Card className=\"p-4\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-gray-600\">Tasks Done</p>
                <p className=\"text-2xl font-bold text-gray-900\">
                  {comprehensiveReport.summary.completedTasks}
                </p>
              </div>
              <ClipboardList className=\"w-8 h-8 text-green-600\" />
            </div>
          </Card>
        </div>
      )}

      {/* Revenue Analytics */}
      {revenueReport && (
        <Card className=\"p-6\">
          <h2 className=\"text-xl font-bold text-gray-900 mb-4\">Revenue Analytics</h2>
          <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
            <div>
              <h3 className=\"text-lg font-semibold text-gray-800 mb-3\">Revenue by Room Type</h3>
              <div className=\"space-y-3\">
                {revenueReport.revenueByRoomType.map((item, index) => (
                  <div key={index} className=\"flex items-center justify-between p-3 bg-gray-50 rounded-lg\">
                    <div>
                      <p className=\"font-medium text-gray-900 capitalize\">{item.roomType}</p>
                      <p className=\"text-sm text-gray-600\">{item.bookings} bookings</p>
                    </div>
                    <div className=\"text-right\">
                      <p className=\"font-bold text-gray-900\">{formatCurrency(item.revenue)}</p>
                      <p className=\"text-sm text-gray-600\">{formatCurrency(item.averageRate)} avg</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className=\"text-lg font-semibold text-gray-800 mb-3\">Payment Status</h3>
              <div className=\"space-y-3\">
                {revenueReport.paymentStatusBreakdown.map((item, index) => (
                  <div key={index} className=\"flex items-center justify-between p-3 bg-gray-50 rounded-lg\">
                    <div className=\"flex items-center gap-2\">
                      <Badge 
                        className={
                          item.status === 'paid' ? 'bg-green-100 text-green-800' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {item.status}
                      </Badge>
                      <span className=\"text-sm text-gray-600\">{item.count} bills</span>
                    </div>
                    <p className=\"font-bold text-gray-900\">{formatCurrency(item.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className=\"mt-6 p-4 bg-blue-50 rounded-lg\">
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"text-sm text-blue-600\">Top Revenue Date</p>
                <p className=\"font-bold text-blue-900\">{formatDate(revenueReport.topRevenueDate)}</p>
              </div>
              <div className=\"text-right\">
                <p className=\"text-sm text-blue-600\">Average Daily Revenue</p>
                <p className=\"font-bold text-blue-900\">{formatCurrency(revenueReport.averageDailyRevenue)}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Occupancy Analytics */}
      {occupancyReport && (
        <Card className=\"p-6\">
          <h2 className=\"text-xl font-bold text-gray-900 mb-4\">Occupancy Analytics</h2>
          <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
            <div>
              <h3 className=\"text-lg font-semibold text-gray-800 mb-3\">Occupancy by Room Type</h3>
              <div className=\"space-y-3\">
                {occupancyReport.occupancyByRoomType.map((item, index) => (
                  <div key={index} className=\"flex items-center justify-between p-3 bg-gray-50 rounded-lg\">
                    <div>
                      <p className=\"font-medium text-gray-900 capitalize\">{item.roomType}</p>
                      <p className=\"text-sm text-gray-600\">{item.totalRooms} rooms</p>
                    </div>
                    <div className=\"text-right\">
                      <p className=\"font-bold text-gray-900\">{item.averageOccupancy}%</p>
                      <div className=\"w-20 bg-gray-200 rounded-full h-2 mt-1\">
                        <div 
                          className=\"bg-blue-600 h-2 rounded-full\" 
                          style={{ width: `${item.averageOccupancy}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className=\"text-lg font-semibold text-gray-800 mb-3\">Key Insights</h3>
              <div className=\"space-y-4\">
                <div className=\"p-3 bg-green-50 rounded-lg\">
                  <p className=\"text-sm text-green-600\">Peak Occupancy Date</p>
                  <p className=\"font-bold text-green-900\">{formatDate(occupancyReport.peakOccupancyDate)}</p>
                </div>
                <div className=\"p-3 bg-red-50 rounded-lg\">
                  <p className=\"text-sm text-red-600\">Lowest Occupancy Date</p>
                  <p className=\"font-bold text-red-900\">{formatDate(occupancyReport.lowestOccupancyDate)}</p>
                </div>
                <div className=\"p-3 bg-blue-50 rounded-lg\">
                  <p className=\"text-sm text-blue-600\">Average Occupancy</p>
                  <p className=\"font-bold text-blue-900\">{occupancyReport.averageOccupancy}%</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Room Utilization */}
      {utilizationReport && (
        <Card className=\"p-6\">
          <h2 className=\"text-xl font-bold text-gray-900 mb-4\">Room Utilization</h2>
          <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
            <div>
              <h3 className=\"text-lg font-semibold text-gray-800 mb-3\">Top Performing Rooms</h3>
              <div className=\"space-y-3\">
                {utilizationReport.topPerformingRooms.map((room, index) => (
                  <div key={index} className=\"flex items-center justify-between p-3 bg-green-50 rounded-lg\">
                    <div>
                      <p className=\"font-medium text-gray-900\">Room {room.roomNumber}</p>
                      <p className=\"text-sm text-gray-600\">{room.utilizationRate}% utilization</p>
                    </div>
                    <p className=\"font-bold text-green-900\">{formatCurrency(room.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className=\"text-lg font-semibold text-gray-800 mb-3\">Underutilized Rooms</h3>
              <div className=\"space-y-3\">
                {utilizationReport.underutilizedRooms.map((room, index) => (
                  <div key={index} className=\"flex items-center justify-between p-3 bg-yellow-50 rounded-lg\">
                    <div>
                      <p className=\"font-medium text-gray-900\">Room {room.roomNumber}</p>
                      <p className=\"text-sm text-gray-600\">{room.utilizationRate}% utilization</p>
                    </div>
                    <p className=\"font-bold text-yellow-900\">{formatCurrency(room.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {utilizationReport.maintenanceImpact.length > 0 && (
            <div className=\"mt-6\">
              <h3 className=\"text-lg font-semibold text-gray-800 mb-3\">Maintenance Impact</h3>
              <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
                {utilizationReport.maintenanceImpact.map((room, index) => (
                  <div key={index} className=\"p-3 bg-red-50 rounded-lg\">
                    <p className=\"font-medium text-gray-900\">Room {room.roomNumber}</p>
                    <p className=\"text-sm text-gray-600\">{room.maintenanceDays} days down</p>
                    <p className=\"font-bold text-red-900\">{formatCurrency(room.lostRevenue)} lost</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}