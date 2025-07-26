'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Star, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  UserPlus,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  Eye
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
import { Pagination } from '@/components/ui/pagination';
import GuestProfileModal from '@/components/guest-profile-modal';
import { usePagination } from '@/hooks/use-pagination';
import { useGuests, useGuestStats, useGuestActions } from '@/hooks/use-guests';

const statusConfig = {
  New: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: UserPlus },
  Returning: { color: 'bg-green-100 text-green-800 border-green-200', icon: Users },
  VIP: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Star },
};

export default function GuestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewGuestModal, setShowNewGuestModal] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [showGuestProfile, setShowGuestProfile] = useState(false);

  const { guests, isLoading, error, refetch } = useGuests(searchTerm);
  const { stats } = useGuestStats();
  const { deleteGuest } = useGuestActions();

  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      const matchesSearch = guest.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           guest.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [guests, searchTerm, statusFilter]);

  const {
    currentPage,
    totalPages,
    currentItems: paginatedGuests,
    totalItems,
    itemsPerPage,
    goToPage
  } = usePagination({
    data: filteredGuests,
    itemsPerPage: 10
  });

  const handleDeleteGuest = async (guestId: string) => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      try {
        await deleteGuest(guestId);
        console.log('Guest deleted successfully');
        refetch();
      } catch (error) {
        console.error('Failed to delete guest:', error);
      }
    }
  };

  const handleViewGuestProfile = (guestId: string) => {
    setSelectedGuestId(guestId);
    setShowGuestProfile(true);
  };

  const handleCloseGuestProfile = () => {
    setShowGuestProfile(false);
    setSelectedGuestId(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Guests</h2>
          <p className="text-muted-foreground mb-4">Failed to load guest data</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">Guest Management</h1>
          <p className="text-muted-foreground font-inter">
            Manage guest information and customer relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowNewGuestModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Guest Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
            <p className="text-xs text-muted-foreground">
              All registered guests
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newGuestsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              New guest registrations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Guests</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vipGuests}</div>
            <p className="text-xs text-muted-foreground">
              High-value customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returning Guests</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.returningGuests}</div>
            <p className="text-xs text-muted-foreground">
              Repeat customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageSpending.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Per guest lifetime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Status: {statusFilter === 'all' ? 'All' : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              All Guests
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatusFilter('New')}>
              New Guests
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Returning')}>
              Returning Guests
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('VIP')}>
              VIP Guests
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Guests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Guest Directory</CardTitle>
          <CardDescription className="font-inter">
            Comprehensive guest information and history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedGuests.map((guest) => {
                  const StatusIcon = statusConfig[guest.status as keyof typeof statusConfig].icon;
                  return (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-700">
                              {guest.firstName[0]}{guest.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{guest.fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              {guest.preferences?.join(', ') || 'No preferences'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {guest.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {guest.phone}
                          </div>
                          {guest.address && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {guest.address.city}, {guest.address.state}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[guest.status as keyof typeof statusConfig].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {guest.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{guest.visitCount} visits</div>
                          <div className="text-muted-foreground">
                            {guest.visitCount === 0 ? 'No visits yet' : 
                             guest.visitCount === 1 ? 'First-time guest' : 
                             'Returning guest'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${guest.totalSpent.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          Lifetime value
                        </div>
                      </TableCell>
                      <TableCell>
                        {guest.lastVisit ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {new Date(guest.lastVisit).toLocaleDateString()}
                            </div>
                            <div className="text-muted-foreground">
                              {Math.floor((new Date().getTime() - new Date(guest.lastVisit).getTime()) / (1000 * 60 * 60 * 24))} days ago
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Never visited
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewGuestProfile(guest.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                •••
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Plus className="h-4 w-4 mr-2" />
                                New Reservation
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                View History
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                Export Data
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteGuest(guest.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Guest
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {isLoading && (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>Loading guests...</p>
              </div>
            )}
            
            {!isLoading && filteredGuests.length === 0 && (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>No guests found matching your criteria.</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add New Guest
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Export Guest List
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">New guest registered</p>
                  <p className="text-xs text-muted-foreground">Sarah Johnson - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Guest upgraded to VIP</p>
                  <p className="text-xs text-muted-foreground">Michael Brown - 1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Return guest check-in</p>
                  <p className="text-xs text-muted-foreground">Emily Davis - 2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Guest Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Return Rate</span>
                <span className="font-medium">
                  {stats.totalGuests > 0 ? Math.round((stats.returningGuests / stats.totalGuests) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">VIP Rate</span>
                <span className="font-medium">
                  {stats.totalGuests > 0 ? Math.round((stats.vipGuests / stats.totalGuests) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Growth This Month</span>
                <span className="font-medium text-green-600">
                  +{stats.newGuestsThisMonth}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span>Revenue Per Guest</span>
                  <span>${stats.averageSpending.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Guest Profile Modal */}
      <GuestProfileModal
        isOpen={showGuestProfile}
        onClose={handleCloseGuestProfile}
        guestId={selectedGuestId}
      />
    </div>
  );
}