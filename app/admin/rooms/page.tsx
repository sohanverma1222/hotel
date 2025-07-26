'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bed, Users, Settings, RefreshCw, Filter, Search, Wifi, WifiOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/ui/status-badge';
import RoomGrid from '@/components/room-grid';
import RoomFilters from '@/components/room-filters';
import RoomStatusCard from '@/components/room-status-card';
import { useRooms, useRoomStats } from '@/hooks/use-rooms';

export default function RoomStatusPage() {
  const { rooms, allRooms, isLoading, refresh, isRealTimeConnected, searchTerm, setSearchTerm, activeFilters, addFilter, removeFilter, clearAllFilters } = useRooms();
  const stats = useRoomStats(allRooms); // Use all rooms for stats, not filtered ones
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">Room Status Dashboard</h1>
          <p className="text-muted-foreground font-inter">
            Real-time room status and management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isRealTimeConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span>Real-time</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-600" />
                <span>Offline</span>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => refresh()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            <Bed className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
            <p className="text-xs text-muted-foreground">
              Ready for check-in
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupied}</div>
            <p className="text-xs text-muted-foreground">
              Currently occupied
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Settings className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance}</div>
            <p className="text-xs text-muted-foreground">
              Under maintenance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cleaning</CardTitle>
            <Bed className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cleaning}</div>
            <p className="text-xs text-muted-foreground">
              Being cleaned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <RoomFilters 
          activeFilters={activeFilters}
          addFilter={addFilter}
          removeFilter={removeFilter}
          clearAllFilters={clearAllFilters}
        />
      </div>

      {/* Room Status Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading">Room Status Grid</CardTitle>
            <CardDescription className="font-inter">
              Visual overview of all rooms with real-time status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RoomGrid />
            {rooms.length === 0 && !isLoading && (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>No rooms found matching your search criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Recent Updates</CardTitle>
            <CardDescription className="font-inter">
              Latest room status changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Bed className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Room 204</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">2 min ago</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Room 105</p>
                    <p className="text-xs text-muted-foreground">Occupied</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">5 min ago</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bed className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Room 301</p>
                    <p className="text-xs text-muted-foreground">Cleaning</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">8 min ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Room List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">All Rooms</CardTitle>
          <CardDescription className="font-inter">
            Complete list of rooms with detailed status information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoomStatusCard />
        </CardContent>
      </Card>
    </div>
  );
}