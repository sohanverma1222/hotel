'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bed, Users, Settings, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRooms } from '@/hooks/use-rooms';
import { Room } from '@/lib/db/models';

type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning';

const statusConfig = {
  available: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Bed,
    label: 'Available'
  },
  occupied: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: Users,
    label: 'Occupied'
  },
  maintenance: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Settings,
    label: 'Maintenance'
  },
  cleaning: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Sparkles,
    label: 'Cleaning'
  }
};

export default function RoomGrid() {
  const { rooms, isLoading, updateRoomStatus } = useRooms();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    setIsUpdating(true);
    try {
      const result = await updateRoomStatus(roomId, newStatus);
      if (result.success) {
        setSelectedRoom(null);
      } else {
        console.error('Failed to update room status');
      }
    } catch (error) {
      console.error('Error updating room status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const groupedRooms = rooms.reduce((acc, room) => {
    const floor = room.floor;
    if (!acc[floor]) {
      acc[floor] = [];
    }
    acc[floor].push(room);
    return acc;
  }, {} as Record<number, Room[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedRooms)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([floor, rooms]) => (
          <div key={floor} className="space-y-3">
            <h3 className="font-heading font-medium text-sm text-muted-foreground">
              Floor {floor}
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {rooms.map((room) => {
                const config = statusConfig[room.status];
                const Icon = config.icon;
                
                return (
                  <Card
                    key={room._id?.toString() || room.roomNumber}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedRoom?._id?.toString() === room._id?.toString() && "ring-2 ring-primary"
                    )}
                    onClick={() => handleRoomClick(room)}
                  >
                    <CardContent className="p-3">
                      <div className="flex flex-col items-center space-y-2">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          config.color
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm">{room.roomNumber}</div>
                          <div className="text-xs text-muted-foreground">{room.type}</div>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs px-2 py-1",
                            config.color
                          )}
                        >
                          {config.label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-heading text-lg font-semibold">
                    Room {selectedRoom.roomNumber}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRoom.type} • Floor {selectedRoom.floor}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Status:</span>
                    <Badge className={statusConfig[selectedRoom.status].color}>
                      {statusConfig[selectedRoom.status].label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Price:</span>
                    <span className="text-sm">${selectedRoom.price}/night</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Update Status:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={selectedRoom.status === 'available' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(selectedRoom._id!.toString(), 'available')}
                      disabled={selectedRoom.status === 'available' || isUpdating}
                    >
                      Available
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedRoom.status === 'occupied' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(selectedRoom._id!.toString(), 'occupied')}
                      disabled={selectedRoom.status === 'occupied' || isUpdating}
                    >
                      Occupied
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedRoom.status === 'cleaning' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(selectedRoom._id!.toString(), 'cleaning')}
                      disabled={selectedRoom.status === 'cleaning' || isUpdating}
                    >
                      Cleaning
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedRoom.status === 'maintenance' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(selectedRoom._id!.toString(), 'maintenance')}
                      disabled={selectedRoom.status === 'maintenance' || isUpdating}
                    >
                      Maintenance
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedRoom(null)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Close'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}