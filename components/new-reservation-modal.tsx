'use client';

import { useState, useEffect } from 'react';
import { ObjectId } from 'mongodb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Users, DollarSign, Clock } from 'lucide-react';
import { Room, Guest, Reservation } from '@/lib/db/models';

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reservationData: any) => Promise<{ success: boolean; error?: any }>;
}

export default function NewReservationModal({
  isOpen,
  onClose,
  onSubmit,
}: NewReservationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    guestId: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    numberOfGuests: 1,
    specialRequests: '',
    notes: '',
    paymentStatus: 'pending' as 'pending' | 'partial' | 'paid' | 'refunded',
    totalAmount: 0,
    paidAmount: 0,
  });

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load rooms and guests data
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [roomsResponse, guestsResponse] = await Promise.all([
            fetch('/api/rooms'),
            fetch('/api/guests'),
          ]);

          if (roomsResponse.ok) {
            const roomsData = await roomsResponse.json();
            setRooms(roomsData.rooms || []);
          }

          if (guestsResponse.ok) {
            const guestsData = await guestsResponse.json();
            setGuests(guestsData.guests || []);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoadingData(false);
        }
      };

      fetchData();
    }
  }, [isOpen]);

  // Calculate total amount based on selected room and dates
  useEffect(() => {
    if (formData.roomId && formData.checkIn && formData.checkOut) {
      const room = rooms.find((r) => r._id?.toString() === formData.roomId);
      if (room) {
        const checkIn = new Date(formData.checkIn);
        const checkOut = new Date(formData.checkOut);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        if (nights > 0) {
          const totalAmount = nights * room.price;
          setFormData((prev) => ({
            ...prev,
            totalAmount,
          }));
        }
      }
    }
  }, [formData.roomId, formData.checkIn, formData.checkOut, rooms]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.guestId) {
      newErrors.guestId = 'Please select a guest';
    }

    if (!formData.roomId) {
      newErrors.roomId = 'Please select a room';
    }

    if (!formData.checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    }

    if (!formData.checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    }

    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      
      if (checkIn >= checkOut) {
        newErrors.checkOut = 'Check-out must be after check-in';
      }

      if (checkIn < new Date()) {
        newErrors.checkIn = 'Check-in date cannot be in the past';
      }
    }

    if (formData.numberOfGuests < 1) {
      newErrors.numberOfGuests = 'At least 1 guest is required';
    }

    if (formData.totalAmount <= 0) {
      newErrors.totalAmount = 'Total amount must be greater than 0';
    }

    if (formData.paidAmount < 0) {
      newErrors.paidAmount = 'Paid amount cannot be negative';
    }

    if (formData.paidAmount > formData.totalAmount) {
      newErrors.paidAmount = 'Paid amount cannot exceed total amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const reservationData = {
        guestId: new ObjectId(formData.guestId),
        roomId: new ObjectId(formData.roomId),
        checkIn: new Date(formData.checkIn),
        checkOut: new Date(formData.checkOut),
        status: 'confirmed' as const,
        numberOfGuests: formData.numberOfGuests,
        totalAmount: formData.totalAmount,
        paidAmount: formData.paidAmount,
        paymentStatus: formData.paidAmount >= formData.totalAmount ? 'paid' : 
                      formData.paidAmount > 0 ? 'partial' : 'pending',
        specialRequests: formData.specialRequests || undefined,
        notes: formData.notes || undefined,
      };

      const result = await onSubmit(reservationData);

      if (result.success) {
        // Reset form
        setFormData({
          guestId: '',
          roomId: '',
          checkIn: '',
          checkOut: '',
          numberOfGuests: 1,
          specialRequests: '',
          notes: '',
          paymentStatus: 'pending',
          totalAmount: 0,
          paidAmount: 0,
        });
        setErrors({});
        onClose();
      } else {
        // Handle error - you might want to show a toast notification here
        console.error('Failed to create reservation:', result.error);
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        guestId: '',
        roomId: '',
        checkIn: '',
        checkOut: '',
        numberOfGuests: 1,
        specialRequests: '',
        notes: '',
        paymentStatus: 'pending',
        totalAmount: 0,
        paidAmount: 0,
      });
      setErrors({});
      onClose();
    }
  };

  const availableRooms = rooms.filter((room) => room.status === 'available');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Reservation
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new hotel reservation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Guest Selection */}
            <div className="space-y-2">
              <Label htmlFor="guest">Guest *</Label>
              <Select
                value={formData.guestId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, guestId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingData ? "Loading..." : "Select a guest"} />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((guest) => (
                    <SelectItem
                      key={guest._id?.toString()}
                      value={guest._id?.toString() || ''}
                    >
                      {guest.firstName} {guest.lastName} - {guest.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.guestId && (
                <p className="text-sm text-red-600">{errors.guestId}</p>
              )}
            </div>

            {/* Room Selection */}
            <div className="space-y-2">
              <Label htmlFor="room">Room *</Label>
              <Select
                value={formData.roomId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, roomId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingData ? "Loading..." : "Select a room"} />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((room) => (
                    <SelectItem
                      key={room._id?.toString()}
                      value={room._id?.toString() || ''}
                    >
                      Room {room.roomNumber} - {room.type} (${room.price}/night)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomId && (
                <p className="text-sm text-red-600">{errors.roomId}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Check-in Date */}
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in Date *</Label>
              <Input
                id="checkIn"
                type="date"
                value={formData.checkIn}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, checkIn: e.target.value }))
                }
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.checkIn && (
                <p className="text-sm text-red-600">{errors.checkIn}</p>
              )}
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out Date *</Label>
              <Input
                id="checkOut"
                type="date"
                value={formData.checkOut}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, checkOut: e.target.value }))
                }
                min={formData.checkIn || new Date().toISOString().split('T')[0]}
              />
              {errors.checkOut && (
                <p className="text-sm text-red-600">{errors.checkOut}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Number of Guests */}
            <div className="space-y-2">
              <Label htmlFor="numberOfGuests">Number of Guests *</Label>
              <Input
                id="numberOfGuests"
                type="number"
                min="1"
                max="10"
                value={formData.numberOfGuests}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    numberOfGuests: parseInt(e.target.value) || 1,
                  }))
                }
              />
              {errors.numberOfGuests && (
                <p className="text-sm text-red-600">{errors.numberOfGuests}</p>
              )}
            </div>

            {/* Total Amount */}
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      totalAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="pl-10"
                  readOnly
                />
              </div>
              {errors.totalAmount && (
                <p className="text-sm text-red-600">{errors.totalAmount}</p>
              )}
            </div>

            {/* Paid Amount */}
            <div className="space-y-2">
              <Label htmlFor="paidAmount">Paid Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="paidAmount"
                  type="number"
                  step="0.01"
                  value={formData.paidAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paidAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="pl-10"
                />
              </div>
              {errors.paidAmount && (
                <p className="text-sm text-red-600">{errors.paidAmount}</p>
              )}
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              placeholder="Any special requests or requirements..."
              value={formData.specialRequests}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  specialRequests: e.target.value,
                }))
              }
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              placeholder="Internal notes for staff..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || loadingData}>
              {isLoading ? 'Creating...' : 'Create Reservation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}