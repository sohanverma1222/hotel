'use client';

import { useState } from 'react';
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
  Shield,
  Plus,
  Edit,
  Trash2,
  Save,
  Users,
  Key,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  Check,
  X,
  Settings,
  Lock,
  Unlock
} from 'lucide-react';
import Link from 'next/link';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  actions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

const defaultPermissions: Permission[] = [
  {
    id: 'rooms_view',
    name: 'View Rooms',
    description: 'Can view room information and status',
    module: 'Rooms',
    actions: ['read']
  },
  {
    id: 'rooms_manage',
    name: 'Manage Rooms',
    description: 'Can create, edit, and update room information',
    module: 'Rooms',
    actions: ['create', 'read', 'update', 'delete']
  },
  {
    id: 'reservations_view',
    name: 'View Reservations',
    description: 'Can view reservation details and status',
    module: 'Reservations',
    actions: ['read']
  },
  {
    id: 'reservations_manage',
    name: 'Manage Reservations',
    description: 'Can create, modify, and cancel reservations',
    module: 'Reservations',
    actions: ['create', 'read', 'update', 'delete']
  },
  {
    id: 'guests_view',
    name: 'View Guests',
    description: 'Can view guest information and history',
    module: 'Guests',
    actions: ['read']
  },
  {
    id: 'guests_manage',
    name: 'Manage Guests',
    description: 'Can create and edit guest profiles',
    module: 'Guests',
    actions: ['create', 'read', 'update']
  },
  {
    id: 'billing_view',
    name: 'View Billing',
    description: 'Can view invoices and payment status',
    module: 'Billing',
    actions: ['read']
  },
  {
    id: 'billing_manage',
    name: 'Manage Billing',
    description: 'Can create invoices and process payments',
    module: 'Billing',
    actions: ['create', 'read', 'update']
  },
  {
    id: 'reports_view',
    name: 'View Reports',
    description: 'Can view business reports and analytics',
    module: 'Reports',
    actions: ['read']
  },
  {
    id: 'settings_view',
    name: 'View Settings',
    description: 'Can view system settings',
    module: 'Settings',
    actions: ['read']
  },
  {
    id: 'settings_manage',
    name: 'Manage Settings',
    description: 'Can modify system configuration',
    module: 'Settings',
    actions: ['create', 'read', 'update', 'delete']
  },
  {
    id: 'users_manage',
    name: 'Manage Users',
    description: 'Can create, edit, and manage user accounts',
    module: 'Users',
    actions: ['create', 'read', 'update', 'delete']
  }
];

const defaultRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all system features and settings',
    permissions: defaultPermissions.map(p => p.id),
    isSystem: true,
    userCount: 2,
    isActive: true
  },
  {
    id: 'manager',
    name: 'Hotel Manager',
    description: 'Management access with limited settings control',
    permissions: [
      'rooms_manage', 'reservations_manage', 'guests_manage', 
      'billing_manage', 'reports_view', 'settings_view'
    ],
    isSystem: true,
    userCount: 3,
    isActive: true
  },
  {
    id: 'frontdesk',
    name: 'Front Desk Staff',
    description: 'Check-in/out, reservations, and guest management',
    permissions: [
      'rooms_view', 'reservations_manage', 'guests_manage', 'billing_view'
    ],
    isSystem: false,
    userCount: 8,
    isActive: true
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping',
    description: 'Room status and maintenance access only',
    permissions: ['rooms_view'],
    isSystem: false,
    userCount: 5,
    isActive: true
  }
];

const defaultUsers: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@hotel.com',
    role: 'Administrator',
    status: 'active',
    lastLogin: '2024-01-26 10:30',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'manager@hotel.com',
    role: 'Hotel Manager',
    status: 'active',
    lastLogin: '2024-01-26 09:15',
    createdAt: '2024-01-05'
  },
  {
    id: '3',
    name: 'Mike Receptionist',
    email: 'mike@hotel.com',
    role: 'Front Desk Staff',
    status: 'active',
    lastLogin: '2024-01-26 08:00',
    createdAt: '2024-01-10'
  }
];

export default function UserRoleAccessPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [permissions] = useState<Permission[]>(defaultPermissions);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
  });

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const handleSaveUser = () => {
    if (isAddingUser) {
      const user: User = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: roles.find(r => r.id === newUser.role)?.name || '',
        status: 'active',
        lastLogin: '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', role: '', password: '' });
      setIsAddingUser(false);
    }
  };

  const handleSaveRole = () => {
    if (isAddingRole) {
      const role: Role = {
        id: Date.now().toString(),
        ...newRole,
        isSystem: false,
        userCount: 0,
        isActive: true,
      };
      setRoles([...roles, role]);
      setNewRole({ name: '', description: '', permissions: [] });
      setIsAddingRole(false);
    }
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(user =>
      user.id === id
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as any }
        : user
    ));
  };

  const toggleRoleStatus = (id: string) => {
    setRoles(roles.map(role =>
      role.id === id ? { ...role, isActive: !role.isActive } : role
    ));
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const handleDeleteRole = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (role?.isSystem) {
      alert('Cannot delete system roles');
      return;
    }
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(role => role.id !== id));
    }
  };

  const getPermissionsByModule = () => {
    const modules: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!modules[permission.module]) {
        modules[permission.module] = [];
      }
      modules[permission.module].push(permission);
    });
    return modules;
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
            <h1 className="text-3xl font-bold text-foreground font-heading">User Role & Access Control</h1>
            <p className="text-muted-foreground font-inter">
              Manage user accounts, roles, and system permissions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and their access levels</CardDescription>
                </div>
                <Button onClick={() => setIsAddingUser(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add New User Form */}
              {isAddingUser && (
                <Card className="mb-6 border-dashed border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Add New User</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="userName">Full Name</Label>
                        <Input
                          id="userName"
                          value={newUser.name}
                          onChange={(e) =>
                            setNewUser({ ...newUser, name: e.target.value })
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="userEmail">Email Address</Label>
                        <Input
                          id="userEmail"
                          type="email"
                          value={newUser.email}
                          onChange={(e) =>
                            setNewUser({ ...newUser, email: e.target.value })
                          }
                          placeholder="john@hotel.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="userRole">Role</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value) =>
                            setNewUser({ ...newUser, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.filter(role => role.isActive).map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="userPassword">Temporary Password</Label>
                        <Input
                          id="userPassword"
                          type="password"
                          value={newUser.password}
                          onChange={(e) =>
                            setNewUser({ ...newUser, password: e.target.value })
                          }
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingUser(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveUser}>
                        <Save className="h-4 w-4 mr-2" />
                        Create User
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Users Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : user.status === 'inactive'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastLogin || 'Never'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{user.createdAt}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            {user.status === 'active' ? (
                              <>
                                <Lock className="h-3 w-3 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Unlock className="h-3 w-3 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
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

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Role Management</CardTitle>
                  <CardDescription>Configure user roles and their permissions</CardDescription>
                </div>
                <Button onClick={() => setIsAddingRole(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add New Role Form */}
              {isAddingRole && (
                <Card className="mb-6 border-dashed border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Role</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="roleName">Role Name</Label>
                        <Input
                          id="roleName"
                          value={newRole.name}
                          onChange={(e) =>
                            setNewRole({ ...newRole, name: e.target.value })
                          }
                          placeholder="e.g., Night Manager"
                        />
                      </div>
                      <div>
                        <Label htmlFor="roleDescription">Description</Label>
                        <Input
                          id="roleDescription"
                          value={newRole.description}
                          onChange={(e) =>
                            setNewRole({ ...newRole, description: e.target.value })
                          }
                          placeholder="Brief role description"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Permissions</Label>
                      <div className="mt-2 space-y-4 max-h-64 overflow-y-auto border rounded-md p-4">
                        {Object.entries(getPermissionsByModule()).map(([module, modulePermissions]) => (
                          <div key={module}>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">{module}</h4>
                            <div className="space-y-2 ml-4">
                              {modulePermissions.map((permission) => (
                                <label key={permission.id} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={newRole.permissions.includes(permission.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setNewRole({
                                          ...newRole,
                                          permissions: [...newRole.permissions, permission.id]
                                        });
                                      } else {
                                        setNewRole({
                                          ...newRole,
                                          permissions: newRole.permissions.filter(p => p !== permission.id)
                                        });
                                      }
                                    }}
                                  />
                                  <span className="text-sm">{permission.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingRole(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveRole}>
                        <Save className="h-4 w-4 mr-2" />
                        Create Role
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Roles Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {role.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{role.userCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {role.permissions.length} permissions
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.isSystem ? 'default' : 'secondary'}>
                          {role.isSystem ? 'System' : 'Custom'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            role.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {role.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRole(role.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {!role.isSystem && (
                            <>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRole(role.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Permissions</CardTitle>
              <CardDescription>Overview of all available system permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(getPermissionsByModule()).map(([module, modulePermissions]) => (
                  <Card key={module}>
                    <CardHeader>
                      <CardTitle className="text-lg">{module} Module</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {modulePermissions.map((permission) => (
                          <div key={permission.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{permission.name}</h4>
                              <Key className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {permission.description}
                            </p>
                            <div className="flex gap-1">
                              {permission.actions.map((action) => (
                                <Badge key={action} variant="outline" className="text-xs">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Details Modal */}
      {selectedRole && (
        <Card className="fixed inset-0 z-50 m-4 max-w-2xl mx-auto mt-20 max-h-[80vh] overflow-y-auto bg-background border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {roles.find(r => r.id === selectedRole)?.name} Permissions
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRole(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(getPermissionsByModule()).map(([module, modulePermissions]) => {
                const rolePermissions = roles.find(r => r.id === selectedRole)?.permissions || [];
                const moduleHasPermissions = modulePermissions.some(p => rolePermissions.includes(p.id));
                
                return moduleHasPermissions ? (
                  <div key={module}>
                    <h4 className="font-medium mb-2">{module}</h4>
                    <div className="space-y-2 ml-4">
                      {modulePermissions.map((permission) => (
                        rolePermissions.includes(permission.id) ? (
                          <div key={permission.id} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                            <Check className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="font-medium text-sm">{permission.name}</div>
                              <div className="text-xs text-muted-foreground">{permission.description}</div>
                            </div>
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Backdrop for modal */}
      {selectedRole && (
        <div 
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setSelectedRole(null)}
        />
      )}
    </div>
  );
}