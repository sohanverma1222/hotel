'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bed, 
  Users, 
  Settings, 
  Sparkles, 
  MoreHorizontal, 
  Eye,
  Edit,
  Calendar,
  DollarSign
} from 'lucide-react';
import StatusBadge from '@/components/ui/status-badge';
import { useRooms } from '@/hooks/use-rooms';

export default function RoomStatusCard() {
  const { rooms, isLoading, updateRoomStatus } = useRooms();
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRooms.length === rooms.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(rooms.map(room => room._id?.toString() || room.roomNumber));
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    for (const roomId of selectedRooms) {
      await updateRoomStatus(roomId, newStatus as any);
    }
    setSelectedRooms([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading rooms...</div>
      </div>
    );
  }

  const statusIcons = {
    available: <Bed className="h-4 w-4 text-green-600" />,
    occupied: <Users className="h-4 w-4 text-red-600" />,
    maintenance: <Settings className="h-4 w-4 text-yellow-600" />,
    cleaning: <Sparkles className="h-4 w-4 text-blue-600" />,
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedRooms.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedRooms.length} room{selectedRooms.length > 1 ? 's' : ''} selected
          </span>
          <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('available')}>
            Mark Available
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('cleaning')}>
            Send to Cleaning
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('maintenance')}>
            Schedule Maintenance
          </Button>
        </div>
      )}

      {/* Room Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedRooms.length === rooms.length && rooms.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Check-in/out</TableHead>
              <TableHead>Last Cleaned</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room._id?.toString() || room.roomNumber}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedRooms.includes(room._id?.toString() || room.roomNumber)}
                    onChange={() => handleRoomSelect(room._id?.toString() || room.roomNumber)}
                    className="rounded border-gray-300"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{room.roomNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {room.type} • Floor {room.floor}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {statusIcons[room.status]}
                    <StatusBadge status={room.status}>
                      {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </StatusBadge>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">—</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    ${room.price}/night
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="text-muted-foreground">—</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    N/A
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground max-w-32 truncate">
                    {room.description || 'No notes'}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Room
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        View Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Room Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Info */}
      <div className="grid grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="font-medium text-green-600">Available</div>
          <div className="text-muted-foreground">
            {rooms.filter(r => r.status === 'available').length} rooms
          </div>
        </div>
        <div className="text-center">
          <div className="font-medium text-red-600">Occupied</div>
          <div className="text-muted-foreground">
            {rooms.filter(r => r.status === 'occupied').length} rooms
          </div>
        </div>
        <div className="text-center">
          <div className="font-medium text-blue-600">Cleaning</div>
          <div className="text-muted-foreground">
            {rooms.filter(r => r.status === 'cleaning').length} rooms
          </div>
        </div>
        <div className="text-center">
          <div className="font-medium text-yellow-600">Maintenance</div>
          <div className="text-muted-foreground">
            {rooms.filter(r => r.status === 'maintenance').length} rooms
          </div>
        </div>
      </div>
    </div>
  );
}