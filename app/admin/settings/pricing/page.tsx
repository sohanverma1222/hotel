'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
  description: string;
  isActive: boolean;
}

interface SeasonalRate {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  multiplier: number;
  roomTypes: string[];
  isActive: boolean;
}

interface DiscountRule {
  id: string;
  name: string;
  type: 'early_bird' | 'extended_stay' | 'group' | 'loyalty' | 'promotional';
  value: number;
  valueType: 'percentage' | 'fixed';
  conditions: {
    minNights?: number;
    minRooms?: number;
    advanceBookingDays?: number;
    loyaltyLevel?: string;
  };
  isActive: boolean;
}

export default function PricingSettingsPage() {
  const [activeTab, setActiveTab] = useState('taxes');

  // Tax rates state
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    {
      id: '1',
      name: 'City Tax',
      rate: 3.5,
      type: 'percentage',
      description: 'Standard city accommodation tax',
      isActive: true,
    },
    {
      id: '2',
      name: 'Service Charge',
      rate: 15,
      type: 'fixed',
      description: 'Per night service charge',
      isActive: true,
    },
    {
      id: '3',
      name: 'Tourism Fee',
      rate: 2.0,
      type: 'percentage',
      description: 'Regional tourism development fee',
      isActive: false,
    },
  ]);

  // Seasonal rates state
  const [seasonalRates, setSeasonalRates] = useState<SeasonalRate[]>([
    {
      id: '1',
      name: 'Summer Peak Season',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      multiplier: 1.5,
      roomTypes: ['Deluxe', 'Suite'],
      isActive: true,
    },
    {
      id: '2',
      name: 'Holiday Season',
      startDate: '2024-12-20',
      endDate: '2025-01-05',
      multiplier: 2.0,
      roomTypes: ['Standard', 'Deluxe', 'Suite'],
      isActive: true,
    },
    {
      id: '3',
      name: 'Spring Special',
      startDate: '2024-03-15',
      endDate: '2024-05-15',
      multiplier: 0.85,
      roomTypes: ['Standard'],
      isActive: false,
    },
  ]);

  // Discount rules state
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([
    {
      id: '1',
      name: 'Early Bird Special',
      type: 'early_bird',
      value: 15,
      valueType: 'percentage',
      conditions: { advanceBookingDays: 30 },
      isActive: true,
    },
    {
      id: '2',
      name: 'Extended Stay Discount',
      type: 'extended_stay',
      value: 20,
      valueType: 'percentage',
      conditions: { minNights: 7 },
      isActive: true,
    },
    {
      id: '3',
      name: 'Group Booking Discount',
      type: 'group',
      value: 25,
      valueType: 'percentage',
      conditions: { minRooms: 5 },
      isActive: true,
    },
  ]);

  const [newTaxRate, setNewTaxRate] = useState<Partial<TaxRate>>({
    name: '',
    rate: 0,
    type: 'percentage',
    description: '',
    isActive: true,
  });

  const [newSeasonalRate, setNewSeasonalRate] = useState<Partial<SeasonalRate>>({
    name: '',
    startDate: '',
    endDate: '',
    multiplier: 1,
    roomTypes: [],
    isActive: true,
  });

  const [newDiscountRule, setNewDiscountRule] = useState<Partial<DiscountRule>>({
    name: '',
    type: 'promotional',
    value: 0,
    valueType: 'percentage',
    conditions: {},
    isActive: true,
  });

  const addTaxRate = () => {
    if (newTaxRate.name && newTaxRate.rate !== undefined) {
      const taxRate: TaxRate = {
        id: Date.now().toString(),
        name: newTaxRate.name,
        rate: newTaxRate.rate,
        type: newTaxRate.type || 'percentage',
        description: newTaxRate.description || '',
        isActive: newTaxRate.isActive ?? true,
      };
      setTaxRates([...taxRates, taxRate]);
      setNewTaxRate({
        name: '',
        rate: 0,
        type: 'percentage',
        description: '',
        isActive: true,
      });
    }
  };

  const addSeasonalRate = () => {
    if (newSeasonalRate.name && newSeasonalRate.startDate && newSeasonalRate.endDate) {
      const seasonalRate: SeasonalRate = {
        id: Date.now().toString(),
        name: newSeasonalRate.name,
        startDate: newSeasonalRate.startDate,
        endDate: newSeasonalRate.endDate,
        multiplier: newSeasonalRate.multiplier || 1,
        roomTypes: newSeasonalRate.roomTypes || [],
        isActive: newSeasonalRate.isActive ?? true,
      };
      setSeasonalRates([...seasonalRates, seasonalRate]);
      setNewSeasonalRate({
        name: '',
        startDate: '',
        endDate: '',
        multiplier: 1,
        roomTypes: [],
        isActive: true,
      });
    }
  };

  const addDiscountRule = () => {
    if (newDiscountRule.name && newDiscountRule.value !== undefined) {
      const discountRule: DiscountRule = {
        id: Date.now().toString(),
        name: newDiscountRule.name,
        type: newDiscountRule.type || 'promotional',
        value: newDiscountRule.value,
        valueType: newDiscountRule.valueType || 'percentage',
        conditions: newDiscountRule.conditions || {},
        isActive: newDiscountRule.isActive ?? true,
      };
      setDiscountRules([...discountRules, discountRule]);
      setNewDiscountRule({
        name: '',
        type: 'promotional',
        value: 0,
        valueType: 'percentage',
        conditions: {},
        isActive: true,
      });
    }
  };

  const toggleTaxRateStatus = (id: string) => {
    setTaxRates(taxRates.map(tax => 
      tax.id === id ? { ...tax, isActive: !tax.isActive } : tax
    ));
  };

  const toggleSeasonalRateStatus = (id: string) => {
    setSeasonalRates(seasonalRates.map(rate => 
      rate.id === id ? { ...rate, isActive: !rate.isActive } : rate
    ));
  };

  const toggleDiscountRuleStatus = (id: string) => {
    setDiscountRules(discountRules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const deleteTaxRate = (id: string) => {
    setTaxRates(taxRates.filter(tax => tax.id !== id));
  };

  const deleteSeasonalRate = (id: string) => {
    setSeasonalRates(seasonalRates.filter(rate => rate.id !== id));
  };

  const deleteDiscountRule = (id: string) => {
    setDiscountRules(discountRules.filter(rule => rule.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tax & Pricing Settings</h1>
        <p className="text-muted-foreground">
          Configure tax rates, seasonal pricing, and discount rules for your hotel.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="taxes">Tax Rates</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Pricing</TabsTrigger>
          <TabsTrigger value="discounts">Discount Rules</TabsTrigger>
        </TabsList>

        {/* Tax Rates Tab */}
        <TabsContent value="taxes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Configuration</CardTitle>
              <CardDescription>
                Manage tax rates applied to room bookings and services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add New Tax Rate */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Add New Tax Rate</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="tax-name">Tax Name</Label>
                      <Input
                        id="tax-name"
                        placeholder="e.g., City Tax"
                        value={newTaxRate.name || ''}
                        onChange={(e) => setNewTaxRate({ ...newTaxRate, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax-rate">Rate</Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newTaxRate.rate || ''}
                        onChange={(e) => setNewTaxRate({ ...newTaxRate, rate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax-type">Type</Label>
                      <Select
                        value={newTaxRate.type || 'percentage'}
                        onValueChange={(value: 'percentage' | 'fixed') => 
                          setNewTaxRate({ ...newTaxRate, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tax-description">Description</Label>
                      <Input
                        id="tax-description"
                        placeholder="Tax description"
                        value={newTaxRate.description || ''}
                        onChange={(e) => setNewTaxRate({ ...newTaxRate, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={addTaxRate} className="w-full sm:w-auto">
                    Add Tax Rate
                  </Button>
                </div>

                {/* Existing Tax Rates */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Current Tax Rates</h3>
                  {taxRates.map((tax) => (
                    <div key={tax.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{tax.name}</h4>
                            <Badge variant={tax.isActive ? 'default' : 'secondary'}>
                              {tax.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">
                              {tax.rate}{tax.type === 'percentage' ? '%' : ' fixed'}
                            </Badge>
                          </div>
                          {tax.description && (
                            <p className="text-sm text-muted-foreground">{tax.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTaxRateStatus(tax.id)}
                          >
                            {tax.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTaxRate(tax.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seasonal Pricing Tab */}
        <TabsContent value="seasonal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Pricing</CardTitle>
              <CardDescription>
                Configure seasonal rate multipliers for different periods and room types.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add New Seasonal Rate */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Add New Seasonal Rate</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="season-name">Season Name</Label>
                      <Input
                        id="season-name"
                        placeholder="e.g., Summer Peak"
                        value={newSeasonalRate.name || ''}
                        onChange={(e) => setNewSeasonalRate({ ...newSeasonalRate, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="season-start">Start Date</Label>
                      <Input
                        id="season-start"
                        type="date"
                        value={newSeasonalRate.startDate || ''}
                        onChange={(e) => setNewSeasonalRate({ ...newSeasonalRate, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="season-end">End Date</Label>
                      <Input
                        id="season-end"
                        type="date"
                        value={newSeasonalRate.endDate || ''}
                        onChange={(e) => setNewSeasonalRate({ ...newSeasonalRate, endDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="season-multiplier">Rate Multiplier</Label>
                      <Input
                        id="season-multiplier"
                        type="number"
                        step="0.1"
                        placeholder="1.0"
                        value={newSeasonalRate.multiplier || ''}
                        onChange={(e) => setNewSeasonalRate({ ...newSeasonalRate, multiplier: parseFloat(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                  <Button onClick={addSeasonalRate} className="w-full sm:w-auto">
                    Add Seasonal Rate
                  </Button>
                </div>

                {/* Existing Seasonal Rates */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Current Seasonal Rates</h3>
                  {seasonalRates.map((rate) => (
                    <div key={rate.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{rate.name}</h4>
                            <Badge variant={rate.isActive ? 'default' : 'secondary'}>
                              {rate.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">
                              {rate.multiplier}x multiplier
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {rate.startDate} to {rate.endDate}
                          </p>
                          {rate.roomTypes.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              Applies to: {rate.roomTypes.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSeasonalRateStatus(rate.id)}
                          >
                            {rate.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteSeasonalRate(rate.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discount Rules Tab */}
        <TabsContent value="discounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discount Rules</CardTitle>
              <CardDescription>
                Configure automatic discount rules based on booking conditions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add New Discount Rule */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Add New Discount Rule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="discount-name">Rule Name</Label>
                      <Input
                        id="discount-name"
                        placeholder="e.g., Early Bird Special"
                        value={newDiscountRule.name || ''}
                        onChange={(e) => setNewDiscountRule({ ...newDiscountRule, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount-type">Discount Type</Label>
                      <Select
                        value={newDiscountRule.type || 'promotional'}
                        onValueChange={(value: DiscountRule['type']) => 
                          setNewDiscountRule({ ...newDiscountRule, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="early_bird">Early Bird</SelectItem>
                          <SelectItem value="extended_stay">Extended Stay</SelectItem>
                          <SelectItem value="group">Group Booking</SelectItem>
                          <SelectItem value="loyalty">Loyalty</SelectItem>
                          <SelectItem value="promotional">Promotional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="discount-value">Discount Value</Label>
                      <Input
                        id="discount-value"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newDiscountRule.value || ''}
                        onChange={(e) => setNewDiscountRule({ ...newDiscountRule, value: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount-value-type">Value Type</Label>
                      <Select
                        value={newDiscountRule.valueType || 'percentage'}
                        onValueChange={(value: 'percentage' | 'fixed') => 
                          setNewDiscountRule({ ...newDiscountRule, valueType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={addDiscountRule} className="w-full sm:w-auto">
                    Add Discount Rule
                  </Button>
                </div>

                {/* Existing Discount Rules */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Current Discount Rules</h3>
                  {discountRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{rule.name}</h4>
                            <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {rule.type.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {rule.value}{rule.valueType === 'percentage' ? '%' : ' fixed'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {rule.conditions.minNights && `Min ${rule.conditions.minNights} nights`}
                            {rule.conditions.minRooms && `Min ${rule.conditions.minRooms} rooms`}
                            {rule.conditions.advanceBookingDays && `Book ${rule.conditions.advanceBookingDays} days in advance`}
                            {rule.conditions.loyaltyLevel && `Loyalty level: ${rule.conditions.loyaltyLevel}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleDiscountRuleStatus(rule.id)}
                          >
                            {rule.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteDiscountRule(rule.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}