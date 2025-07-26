'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  Clock,
  Bed,
  UserPlus,
  Edit,
  Plus,
  FileText
} from 'lucide-react';
import { useGuestById } from '@/hooks/use-guests';

interface GuestProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestId: string | null;
}

const statusConfig = {
  New: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: UserPlus },
  Returning: { color: 'bg-green-100 text-green-800 border-green-200', icon: Users },
  VIP: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Star },
};

export default function GuestProfileModal({
  isOpen,
  onClose,
  guestId,
}: GuestProfileModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { guest, isLoading, error } = useGuestById(guestId || '');

  // Mock data for reservations history (in a real app, this would come from an API)
  const [reservations, setReservations] = useState([]);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    if (guest && guestId) {
      // Fetch guest's reservation history
      const fetchGuestHistory = async () => {
        try {
          // In a real implementation, you'd have endpoints like:
          // /api/guests/[id]/reservations
          // /api/guests/[id]/bills
          
          // For now, we'll use mock data
          setReservations([
            {
              id: '1',
              roomNumber: '101',
              checkIn: '2024-01-15',
              checkOut: '2024-01-18',
              status: 'checked_out',
              totalAmount: 450.00,
              nights: 3
            },
            {
              id: '2',
              roomNumber: '205',
              checkIn: '2024-03-22',
              checkOut: '2024-03-25',
              status: 'checked_out',
              totalAmount: 600.00,
              nights: 3
            },
            {
              id: '3',
              roomNumber: '308',
              checkIn: '2024-07-10',
              checkOut: '2024-07-14',
              status: 'confirmed',
              totalAmount: 800.00,
              nights: 4
            }
          ]);

          setBills([
            {
              id: '1',
              date: '2024-01-18',
              amount: 450.00,
              status: 'paid',
              items: ['Room charge', 'Tax']
            },
            {
              id: '2',
              date: '2024-03-25',
              amount: 650.00,
              status: 'paid',
              items: ['Room charge', 'Breakfast', 'Tax']
            },
            {
              id: '3',
              date: '2024-07-14',
              amount: 800.00,
              status: 'pending',
              items: ['Room charge', 'Spa service', 'Tax']
            }
          ]);
        } catch (error) {
          console.error('Error fetching guest history:', error);
        }
      };

      fetchGuestHistory();
    }
  }, [guest, guestId]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading guest profile...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !guest) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Profile</h3>
              <p className="text-muted-foreground mb-4">Failed to load guest information</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const StatusIcon = statusConfig[guest.status as keyof typeof statusConfig]?.icon || User;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-indigo-700">
                  {guest.firstName[0]}{guest.lastName[0]}
                </span>
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {guest.firstName} {guest.lastName}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={statusConfig[guest.status as keyof typeof statusConfig].color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {guest.status} Guest
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Member since {new Date(guest.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Reservation
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{guest.email}</p>
                      <p className="text-xs text-muted-foreground">Email</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{guest.phone}</p>
                      <p className="text-xs text-muted-foreground">Phone</p>
                    </div>
                  </div>
                  {guest.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {guest.address.city}, {guest.address.state}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {guest.address.country}
                        </p>
                      </div>
                    </div>
                  )}
                  {guest.idDocument && (
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{guest.idDocument.number}</p>
                        <p className="text-xs text-muted-foreground">
                          {guest.idDocument.type.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guest Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Guest Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{guest.visitCount} visits</p>
                      <p className="text-xs text-muted-foreground">Total stays</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">${guest.totalSpent.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Lifetime value</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {guest.lastVisit 
                          ? new Date(guest.lastVisit).toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">Last visit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        ${guest.visitCount > 0 ? (guest.totalSpent / guest.visitCount).toFixed(2) : '0.00'}
                      </p>
                      <p className="text-xs text-muted-foreground">Average per stay</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes and Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes & Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {guest.preferences && guest.preferences.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Preferences</p>
                      <div className="flex flex-wrap gap-1">
                        {guest.preferences.map((preference, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {preference}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {guest.notes && (
                    <div>
                      <p className="text-sm font-medium mb-2">Notes</p>
                      <p className="text-sm text-muted-foreground">{guest.notes}</p>
                    </div>
                  )}
                  {(!guest.preferences || guest.preferences.length === 0) && !guest.notes && (
                    <p className="text-sm text-muted-foreground">No notes or preferences recorded</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest reservations and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reservations.slice(0, 3).map((reservation: any) => (
                    <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            Room {reservation.roomNumber} - {reservation.nights} nights
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(reservation.checkIn).toLocaleDateString()} - {new Date(reservation.checkOut).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${reservation.totalAmount}</p>
                        <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}>
                          {reservation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {reservations.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reservations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reservation History</CardTitle>
                <CardDescription>All past and upcoming reservations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Nights</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map((reservation: any) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-medium">Room {reservation.roomNumber}</TableCell>
                        <TableCell>{new Date(reservation.checkIn).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(reservation.checkOut).toLocaleDateString()}</TableCell>
                        <TableCell>{reservation.nights}</TableCell>
                        <TableCell>
                          <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}>
                            {reservation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${reservation.totalAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {reservations.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No reservations found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Payment history and outstanding invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill: any) => (
                      <TableRow key={bill.id}>
                        <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                        <TableCell>{bill.items.join(', ')}</TableCell>
                        <TableCell>
                          <Badge variant={bill.status === 'paid' ? 'default' : 'destructive'}>
                            {bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${bill.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {bills.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No billing history found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Guest Preferences</CardTitle>
                <CardDescription>Room preferences and special requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Room Preferences</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Preferred Room Type</p>
                      <p className="text-sm">Suite</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Preferred Floor</p>
                      <p className="text-sm">High Floor</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bed Type</p>
                      <p className="text-sm">King</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">View Preference</p>
                      <p className="text-sm">Ocean View</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Special Requests</h4>
                  {guest.preferences && guest.preferences.length > 0 ? (
                    <div className="space-y-2">
                      {guest.preferences.map((preference, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <span className="text-sm">{preference}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No special requests recorded</p>
                  )}
                </div>

                {guest.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Additional Notes</h4>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm">{guest.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}