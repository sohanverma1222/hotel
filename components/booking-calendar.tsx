'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, User, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Reservation {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: Date;
  checkOut: Date;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  numberOfGuests: number;
}

interface BookingCalendarProps {
  reservations?: Reservation[];
  onDateClick?: (date: Date) => void;
  onReservationClick?: (reservation: Reservation) => void;
  currentDate?: Date;
  className?: string;
}

const statusColors = {
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  checked_in: 'bg-green-100 text-green-800 border-green-200',
  checked_out: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons = {
  confirmed: Clock,
  checked_in: CheckCircle,
  checked_out: User,
  cancelled: User,
};

export default function BookingCalendar({ 
  reservations = [], 
  onDateClick, 
  onReservationClick,
  currentDate = new Date(),
  className 
}: BookingCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get calendar days for the current view
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);
    
    // Adjust to start on Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());
    // Adjust to end on Saturday
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [viewDate]);

  // Group reservations by date
  const reservationsByDate = useMemo(() => {
    const grouped: { [key: string]: Reservation[] } = {};
    
    reservations.forEach(reservation => {
      const current = new Date(reservation.checkIn);
      const end = new Date(reservation.checkOut);
      
      while (current <= end) {
        const dateKey = current.toISOString().split('T')[0];
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(reservation);
        current.setDate(current.getDate() + 1);
      }
    });
    
    return grouped;
  }, [reservations]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setViewDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === viewDate.getMonth();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const getDayReservations = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return reservationsByDate[dateKey] || [];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading">Booking Calendar</CardTitle>
              <CardDescription className="font-inter">
                View and manage reservations by date
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h2>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              const dayReservations = getDayReservations(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDay = isToday(date);
              const isSelectedDay = isSelected(date);
              
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[120px] p-2 border cursor-pointer transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    !isCurrentMonthDay && "bg-muted/50 text-muted-foreground",
                    isTodayDay && "bg-primary/10 border-primary",
                    isSelectedDay && "bg-primary text-primary-foreground",
                    dayReservations.length > 0 && "border-l-4 border-l-blue-500"
                  )}
                  onClick={() => handleDateClick(date)}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isTodayDay && !isSelectedDay && "text-primary",
                    isSelectedDay && "text-primary-foreground"
                  )}>
                    {date.getDate()}
                  </div>
                  
                  {/* Reservations for this date */}
                  <div className="space-y-1">
                    {dayReservations.slice(0, 3).map((reservation, i) => {
                      const StatusIcon = statusIcons[reservation.status];
                      return (
                        <div
                          key={`${reservation.id}-${i}`}
                          className={cn(
                            "text-xs p-1 rounded cursor-pointer truncate",
                            "hover:opacity-80 transition-opacity",
                            statusColors[reservation.status]
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onReservationClick?.(reservation);
                          }}
                          title={`${reservation.guestName} - Room ${reservation.roomNumber}`}
                        >
                          <div className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            <span className="truncate">
                              {reservation.guestName.split(' ')[0]} - R{reservation.roomNumber}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    
                    {dayReservations.length > 3 && (
                      <div className="text-xs text-muted-foreground p-1">
                        +{dayReservations.length - 3} more
                      </div>
                    )}
                    
                    {/* Quick add button for empty dates */}
                    {dayReservations.length === 0 && isCurrentMonthDay && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-6 text-xs opacity-0 hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDateClick(date);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Reservations for {selectedDate.toLocaleDateString()}</span>
              <Badge variant="outline">
                {getDayReservations(selectedDate).length} bookings
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getDayReservations(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getDayReservations(selectedDate).map((reservation, index) => {
                  const StatusIcon = statusIcons[reservation.status];
                  return (
                    <div
                      key={`${reservation.id}-detail-${index}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => onReservationClick?.(reservation)}
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{reservation.guestName}</div>
                          <div className="text-sm text-muted-foreground">
                            Room {reservation.roomNumber} • {reservation.numberOfGuests} guests
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {reservation.checkIn.toLocaleDateString()} - {reservation.checkOut.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge className={statusColors[reservation.status]}>
                        {reservation.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mb-4">
                  <Plus className="h-12 w-12 mx-auto opacity-50" />
                </div>
                <h3 className="font-medium mb-2">No reservations for this date</h3>
                <p className="text-sm mb-4">Add a new booking to get started</p>
                <Button size="sm" onClick={() => handleDateClick(selectedDate)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Reservation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}