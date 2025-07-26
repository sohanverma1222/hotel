'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Bed, 
  Users, 
  DollarSign,
  Bell,
  Shield,
  Building,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const settingsCategories = [
  {
    id: 'rooms',
    title: 'Room Setup & Configuration',
    description: 'Manage room types, amenities, pricing, and availability settings',
    icon: Bed,
    href: '/admin/settings/rooms',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'users',
    title: 'User Role & Access Control',
    description: 'Configure user permissions, roles, and access levels',
    icon: Shield,
    href: '/admin/settings/users',
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'pricing',
    title: 'Tax and Pricing Settings',
    description: 'Set up tax rates, pricing rules, and discount policies',
    icon: DollarSign,
    href: '/admin/settings/pricing',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 'notifications',
    title: 'Notification Settings',
    description: 'Configure email alerts, SMS notifications, and system alerts',
    icon: Bell,
    href: '/admin/settings/notifications',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'hotel',
    title: 'Hotel Information',
    description: 'Update hotel details, contact information, and branding',
    icon: Building,
    href: '/admin/settings/hotel',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    id: 'guests',
    title: 'Guest Management',
    description: 'Configure guest preferences, loyalty programs, and data policies',
    icon: Users,
    href: '/admin/settings/guests',
    color: 'bg-pink-100 text-pink-600',
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">System Settings</h1>
          <p className="text-muted-foreground font-inter">
            Configure your hotel management system settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              href={category.href}
              className="group block transition-transform hover:scale-[1.02]"
            >
              <Card className="h-full border-2 border-transparent group-hover:border-primary/20 group-hover:shadow-lg transition-all">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="text-lg font-heading">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-inter">
                    {category.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Currently logged in
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Connected</div>
            <p className="text-xs text-muted-foreground">
              MongoDB cluster
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h ago</div>
            <p className="text-xs text-muted-foreground">
              Automated daily backup
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Configuration Changes</CardTitle>
          <CardDescription>Latest system setting modifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bed className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Room pricing updated</p>
                  <p className="text-xs text-muted-foreground">
                    Suite room rates adjusted for weekend pricing
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">2 hours ago</p>
                <p className="text-xs text-muted-foreground">by Admin</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">New user role created</p>
                  <p className="text-xs text-muted-foreground">
                    'Front Desk Supervisor' role with custom permissions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">1 day ago</p>
                <p className="text-xs text-muted-foreground">by Manager</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Tax settings modified</p>
                  <p className="text-xs text-muted-foreground">
                    City tax rate updated to 3.5%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">3 days ago</p>
                <p className="text-xs text-muted-foreground">by Admin</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}