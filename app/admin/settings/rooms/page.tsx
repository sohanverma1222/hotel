'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
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
  Bed,
  Plus,
  Edit,
  Trash2,
  Save,
  Settings,
  DollarSign,
  Users,
  Wifi,
  Car,
  Utensils,
  Tv,
  Bath,
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';

interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  amenities: string[];
  isActive: boolean;
}

interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: 'comfort' | 'technology' | 'bathroom' | 'dining' | 'accessibility';
  isActive: boolean;
}

const defaultAmenities: Amenity[] = [
  { id: '1', name: 'WiFi', icon: 'Wifi', category: 'technology', isActive: true },
  { id: '2', name: 'TV', icon: 'Tv', category: 'technology', isActive: true },
  { id: '3', name: 'Mini Bar', icon: 'Utensils', category: 'dining', isActive: true },
  { id: '4', name: 'Parking', icon: 'Car', category: 'comfort', isActive: true },
  { id: '5', name: 'Bathtub', icon: 'Bath', category: 'bathroom', isActive: true },
];

const defaultRoomTypes: RoomType[] = [
  {
    id: '1',
    name: 'Standard Single',
    description: 'Comfortable single room with basic amenities',
    basePrice: 120,
    maxOccupancy: 1,
    amenities: ['WiFi', 'TV'],
    isActive: true,
  },
  {
    id: '2',
    name: 'Standard Double',
    description: 'Spacious double room with modern amenities',
    basePrice: 180,
    maxOccupancy: 2,
    amenities: ['WiFi', 'TV', 'Mini Bar'],
    isActive: true,
  },
  {
    id: '3',
    name: 'Deluxe Suite',
    description: 'Luxurious suite with premium amenities and city view',
    basePrice: 350,
    maxOccupancy: 4,
    amenities: ['WiFi', 'TV', 'Mini Bar', 'Bathtub', 'Parking'],
    isActive: true,
  },
];

export default function RoomSettingsPage() {
  const [activeTab, setActiveTab] = useState('types');
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(defaultRoomTypes);
  const [amenities, setAmenities] = useState<Amenity[]>(defaultAmenities);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingAmenity, setEditingAmenity] = useState<string | null>(null);
  const [isAddingType, setIsAddingType] = useState(false);
  const [isAddingAmenity, setIsAddingAmenity] = useState(false);

  // Form state for new room type
  const [newRoomType, setNewRoomType] = useState({
    name: '',
    description: '',
    basePrice: 0,
    maxOccupancy: 1,
    amenities: [] as string[],
  });

  // Form state for new amenity
  const [newAmenity, setNewAmenity] = useState({
    name: '',
    category: 'comfort' as const,
  });

  const handleSaveRoomType = () => {
    if (isAddingType) {
      const roomType: RoomType = {
        id: Date.now().toString(),
        ...newRoomType,
        isActive: true,
      };
      setRoomTypes([...roomTypes, roomType]);
      setNewRoomType({
        name: '',
        description: '',
        basePrice: 0,
        maxOccupancy: 1,
        amenities: [],
      });
      setIsAddingType(false);
    }
  };

  const handleSaveAmenity = () => {
    if (isAddingAmenity) {
      const amenity: Amenity = {
        id: Date.now().toString(),
        ...newAmenity,
        icon: 'Settings',
        isActive: true,
      };
      setAmenities([...amenities, amenity]);
      setNewAmenity({
        name: '',
        category: 'comfort',
      });
      setIsAddingAmenity(false);
    }
  };

  const handleDeleteRoomType = (id: string) => {
    if (window.confirm('Are you sure you want to delete this room type?')) {
      setRoomTypes(roomTypes.filter(type => type.id !== id));
    }
  };

  const handleDeleteAmenity = (id: string) => {
    if (window.confirm('Are you sure you want to delete this amenity?')) {
      setAmenities(amenities.filter(amenity => amenity.id !== id));
    }
  };

  const toggleRoomTypeStatus = (id: string) => {
    setRoomTypes(roomTypes.map(type =>
      type.id === id ? { ...type, isActive: !type.isActive } : type
    ));
  };

  const toggleAmenityStatus = (id: string) => {
    setAmenities(amenities.map(amenity =>
      amenity.id === id ? { ...amenity, isActive: !amenity.isActive } : amenity
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading">Room Setup & Configuration</h1>
            <p className="text-muted-foreground font-inter">
              Manage room types, amenities, and pricing settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Bed className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="types">Room Types</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Rules</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Room Types</CardTitle>
                  <CardDescription>Configure different room categories and their settings</CardDescription>
                </div>
                <Button onClick={() => setIsAddingType(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room Type
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add New Room Type Form */}
              {isAddingType && (
                <Card className="mb-6 border-dashed border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Room Type</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Room Type Name</Label>
                        <Input
                          id="name"
                          value={newRoomType.name}
                          onChange={(e) =>
                            setNewRoomType({ ...newRoomType, name: e.target.value })
                          }
                          placeholder="e.g., Executive Suite"
                        />
                      </div>
                      <div>
                        <Label htmlFor="basePrice">Base Price ($)</Label>
                        <Input
                          id="basePrice"
                          type="number"
                          value={newRoomType.basePrice}
                          onChange={(e) =>
                            setNewRoomType({ ...newRoomType, basePrice: parseFloat(e.target.value) || 0 })
                          }
                          placeholder="150"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newRoomType.description}
                        onChange={(e) =>
                          setNewRoomType({ ...newRoomType, description: e.target.value })
                        }
                        placeholder="Describe the room type..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxOccupancy">Maximum Occupancy</Label>
                      <Select
                        value={newRoomType.maxOccupancy.toString()}
                        onValueChange={(value) =>
                          setNewRoomType({ ...newRoomType, maxOccupancy: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Guest</SelectItem>
                          <SelectItem value="2">2 Guests</SelectItem>
                          <SelectItem value="3">3 Guests</SelectItem>
                          <SelectItem value="4">4 Guests</SelectItem>
                          <SelectItem value="5">5 Guests</SelectItem>
                          <SelectItem value="6">6 Guests</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingType(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveRoomType}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Room Type
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Room Types Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Max Occupancy</TableHead>
                    <TableHead>Amenities</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomTypes.map((roomType) => (
                    <TableRow key={roomType.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{roomType.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {roomType.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{roomType.basePrice}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{roomType.maxOccupancy}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {roomType.amenities.slice(0, 2).map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {roomType.amenities.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{roomType.amenities.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleRoomTypeStatus(roomType.id)}
                          className={roomType.isActive ? 'text-green-600' : 'text-red-600'}
                        >
                          {roomType.isActive ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRoomType(roomType.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Amenities Management</CardTitle>
                  <CardDescription>Configure available amenities for rooms</CardDescription>
                </div>
                <Button onClick={() => setIsAddingAmenity(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Amenity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add New Amenity Form */}
              {isAddingAmenity && (
                <Card className="mb-6 border-dashed border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Amenity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amenityName">Amenity Name</Label>
                        <Input
                          id="amenityName"
                          value={newAmenity.name}
                          onChange={(e) =>
                            setNewAmenity({ ...newAmenity, name: e.target.value })
                          }
                          placeholder="e.g., Room Service"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newAmenity.category}
                          onValueChange={(value: any) =>
                            setNewAmenity({ ...newAmenity, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="comfort">Comfort</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="bathroom">Bathroom</SelectItem>
                            <SelectItem value="dining">Dining</SelectItem>
                            <SelectItem value="accessibility">Accessibility</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingAmenity(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveAmenity}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Amenity
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Amenities Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {amenities.map((amenity) => (
                  <Card key={amenity.id} className={`${amenity.isActive ? 'border-green-200' : 'border-gray-200 opacity-60'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Settings className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{amenity.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {amenity.category}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAmenityStatus(amenity.id)}
                            className={amenity.isActive ? 'text-green-600' : 'text-red-600'}
                          >
                            {amenity.isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAmenity(amenity.id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Rules</CardTitle>
              <CardDescription>Configure dynamic pricing and seasonal rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Peak Season Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Peak Season Multiplier</CardTitle>
                      <CardDescription>Price multiplier during peak seasons</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="peakMultiplier">Multiplier (%)</Label>
                          <Input
                            id="peakMultiplier"
                            type="number"
                            defaultValue="150"
                            placeholder="150"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="peakStart">Peak Season Start</Label>
                            <Input
                              id="peakStart"
                              type="date"
                              defaultValue="2024-12-15"
                            />
                          </div>
                          <div>
                            <Label htmlFor="peakEnd">Peak Season End</Label>
                            <Input
                              id="peakEnd"
                              type="date"
                              defaultValue="2024-01-15"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Weekend Pricing</CardTitle>
                      <CardDescription>Price adjustment for weekends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="weekendMultiplier">Weekend Multiplier (%)</Label>
                          <Input
                            id="weekendMultiplier"
                            type="number"
                            defaultValue="125"
                            placeholder="125"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Apply to Friday-Sunday</Label>
                          <Button variant="outline" size="sm">
                            <Check className="h-4 w-4 mr-2" />
                            Enabled
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Last Minute Discounts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Last Minute Discounts</CardTitle>
                    <CardDescription>Automatic discounts for last-minute bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="sameDay">Same Day Discount (%)</Label>
                        <Input
                          id="sameDay"
                          type="number"
                          defaultValue="15"
                          placeholder="15"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nextDay">Next Day Discount (%)</Label>
                        <Input
                          id="nextDay"
                          type="number"
                          defaultValue="10"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="withinWeek">Within 7 Days (%)</Label>
                        <Input
                          id="withinWeek"
                          type="number"
                          defaultValue="5"
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Pricing Rules
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Availability Settings</CardTitle>
              <CardDescription>Configure room availability and booking rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Booking Window</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="maxAdvance">Maximum Advance Booking (days)</Label>
                      <Input
                        id="maxAdvance"
                        type="number"
                        defaultValue="365"
                        placeholder="365"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minAdvance">Minimum Advance Booking (hours)</Label>
                      <Input
                        id="minAdvance"
                        type="number"
                        defaultValue="2"
                        placeholder="2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Check-in/Check-out Times</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="checkinTime">Standard Check-in Time</Label>
                      <Input
                        id="checkinTime"
                        type="time"
                        defaultValue="15:00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkoutTime">Standard Check-out Time</Label>
                      <Input
                        id="checkoutTime"
                        type="time"
                        defaultValue="11:00"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Overbooking Protection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="overbookingPercent">Overbooking Percentage</Label>
                        <Input
                          id="overbookingPercent"
                          type="number"
                          defaultValue="5"
                          placeholder="5"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Allow bookings up to 5% over capacity
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Enable Overbooking Protection</Label>
                        <Button variant="outline" size="sm">
                          <Check className="h-4 w-4 mr-2" />
                          Enabled
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Availability Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}