import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bed, Calendar, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-heading">Hotel Dashboard</h1>
        <p className="text-muted-foreground font-inter">
          Welcome to your hotel management dashboard
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Out of 50 total rooms
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              6 check-outs expected
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading">Recent Activity</CardTitle>
            <CardDescription className="font-inter">
              Latest hotel operations and bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Room 204 checked in
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Guest: John Smith • 2 minutes ago
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    New reservation created
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Room 105 • Sarah Johnson • 5 minutes ago
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Maintenance request
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Room 301 • AC repair needed • 10 minutes ago
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Payment received
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Invoice #HM-2024-001 • $299.00 • 15 minutes ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Quick Actions</CardTitle>
            <CardDescription className="font-inter">
              Common hotel management tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full justify-start h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors">
              Add New Reservation
            </button>
            <button className="w-full justify-start h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors">
              Check-in Guest
            </button>
            <button className="w-full justify-start h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors">
              Room Maintenance
            </button>
            <button className="w-full justify-start h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors">
              Generate Report
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Today's Schedule</CardTitle>
          <CardDescription className="font-inter">
            Important events and tasks for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                <div>
                  <p className="text-sm font-medium">Morning housekeeping rounds</p>
                  <p className="text-xs text-muted-foreground">8:00 AM - 10:00 AM</p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                <div>
                  <p className="text-sm font-medium">VIP guest arrival</p>
                  <p className="text-xs text-muted-foreground">2:00 PM - Suite 501</p>
                </div>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Scheduled</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                <div>
                  <p className="text-sm font-medium">Staff meeting</p>
                  <p className="text-xs text-muted-foreground">5:00 PM - Conference Room</p>
                </div>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Upcoming</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}