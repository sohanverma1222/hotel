'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  CheckIn, 
  CheckOut, 
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import StatusBadge from '@/components/ui/status-badge';
import { useReservations, useReservationStats } from '@/hooks/use-reservations';

const statusConfig = {
  confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Confirmed' },
  checked_in: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Checked In' },
  checked_out: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Checked Out' },
  cancelled: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' },
};

const paymentStatusConfig = {
  paid: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Paid' },
  partial: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Partial' },
  pending: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Pending' },
  refunded: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Refunded' },
};

export default function ReservationsPage() {
  const { 
    reservations, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    statusFilter, 
    setStatusFilter,
    checkIn,
    checkOut,
    cancelReservation 
  } = useReservations();
  
  const stats = useReservationStats(reservations);
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);

  const handleCheckIn = async (reservationId: string) => {
    const result = await checkIn(reservationId);
    if (result.success) {
      // Success notification could be added here
      console.log('Guest checked in successfully');
    } else {
      // Error notification could be added here
      console.error('Failed to check in guest');
    }
  };

  const handleCheckOut = async (reservationId: string) => {
    const result = await checkOut(reservationId, '', 'needs_cleaning');
    if (result.success) {
      // Success notification could be added here
      console.log('Guest checked out successfully');
    } else {
      // Error notification could be added here
      console.error('Failed to check out guest');
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    const result = await cancelReservation(reservationId);
    if (result.success) {
      // Success notification could be added here
      console.log('Reservation cancelled successfully');
    } else {
      // Error notification could be added here
      console.error('Failed to cancel reservation');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading reservations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">Reservations & Bookings</h1>
          <p className="text-muted-foreground font-inter">
            Manage reservations, check-ins, and check-outs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button size="sm" onClick={() => setShowNewReservationModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Reservation
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.confirmed} confirmed, {stats.checked_in} checked in
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total booking value
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
            <CheckIn className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaysCheckIns}</div>
            <p className="text-xs text-muted-foreground">
              Expected arrivals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reservations..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Status: {statusFilter === 'all' ? 'All' : statusConfig[statusFilter as keyof typeof statusConfig]?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              All Reservations
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatusFilter('confirmed')}>
              Confirmed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('checked_in')}>
              Checked In
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('checked_out')}>
              Checked Out
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
              Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Reservations</CardTitle>
          <CardDescription className="font-inter">
            Manage all hotel reservations and bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation._id?.toString() || reservation.checkIn}>
                    <TableCell>
                      <div>
                        <div className="font-medium">Guest Info</div>
                        <div className="text-sm text-muted-foreground">Loading...</div>
                        <div className="text-xs text-muted-foreground">
                          {reservation.numberOfGuests} guest{reservation.numberOfGuests > 1 ? 's' : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">Room Info</div>
                        <div className="text-sm text-muted-foreground">Loading...</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(reservation.checkIn).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(reservation.checkOut).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[reservation.status as keyof typeof statusConfig].color}>
                        {statusConfig[reservation.status as keyof typeof statusConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={paymentStatusConfig[reservation.paymentStatus as keyof typeof paymentStatusConfig].color}>
                        {paymentStatusConfig[reservation.paymentStatus as keyof typeof paymentStatusConfig].label}
                      </Badge>
                      {reservation.paymentStatus === 'partial' && (
                        <div className="text-xs text-muted-foreground mt-1">
                          ${reservation.paidAmount} / ${reservation.totalAmount}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${reservation.totalAmount}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {reservation.status === 'confirmed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCheckIn(reservation._id?.toString() || '')}
                          >
                            <CheckIn className="h-4 w-4 mr-1" />
                            Check In
                          </Button>
                        )}
                        {reservation.status === 'checked_in' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCheckOut(reservation._id?.toString() || '')}
                          >
                            <CheckOut className="h-4 w-4 mr-1" />
                            Check Out
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              •••
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Reservation</DropdownMenuItem>
                            <DropdownMenuItem>Send Confirmation</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleCancelReservation(reservation._id?.toString() || '')}
                            >
                              Cancel Reservation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {reservations.length === 0 && !isLoading && (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>No reservations found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}