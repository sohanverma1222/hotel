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

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: 'booking_confirmation' | 'check_in_reminder' | 'check_out_reminder' | 'cancellation' | 'payment_reminder' | 'welcome' | 'custom';
  content: string;
  isActive: boolean;
  variables: string[];
}

interface NotificationRule {
  id: string;
  name: string;
  event: 'new_booking' | 'cancellation' | 'check_in' | 'check_out' | 'payment_due' | 'maintenance_request' | 'guest_complaint';
  channels: ('email' | 'sms' | 'push' | 'slack')[];
  recipients: string[];
  timing: 'immediate' | 'scheduled';
  delay?: number; // in minutes
  isActive: boolean;
}

interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  isRead: boolean;
  targetUsers: string[];
}

export default function NotificationSettingsPage() {
  const [activeTab, setActiveTab] = useState('email');

  // Email templates state
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Booking Confirmation',
      subject: 'Your Booking Confirmation - {{hotelName}}',
      type: 'booking_confirmation',
      content: `Dear {{guestName}},

Thank you for choosing {{hotelName}}! We're excited to confirm your reservation.

Booking Details:
- Confirmation Number: {{confirmationNumber}}
- Check-in: {{checkInDate}} at {{checkInTime}}
- Check-out: {{checkOutDate}} at {{checkOutTime}}
- Room Type: {{roomType}}
- Total Amount: {{totalAmount}}

If you have any questions, please don't hesitate to contact us.

Best regards,
The {{hotelName}} Team`,
      isActive: true,
      variables: ['guestName', 'hotelName', 'confirmationNumber', 'checkInDate', 'checkInTime', 'checkOutDate', 'checkOutTime', 'roomType', 'totalAmount'],
    },
    {
      id: '2',
      name: 'Check-in Reminder',
      subject: 'Check-in Reminder - {{hotelName}}',
      type: 'check_in_reminder',
      content: `Hello {{guestName}},

This is a friendly reminder that your check-in is scheduled for tomorrow, {{checkInDate}} at {{checkInTime}}.

Booking Details:
- Confirmation Number: {{confirmationNumber}}
- Room Type: {{roomType}}

We look forward to welcoming you!

Best regards,
The {{hotelName}} Team`,
      isActive: true,
      variables: ['guestName', 'hotelName', 'confirmationNumber', 'checkInDate', 'checkInTime', 'roomType'],
    },
    {
      id: '3',
      name: 'Payment Reminder',
      subject: 'Payment Due - {{hotelName}}',
      type: 'payment_reminder',
      content: `Dear {{guestName}},

This is a reminder that payment for your stay is now due.

Amount Due: {{amountDue}}
Due Date: {{dueDate}}
Booking Reference: {{confirmationNumber}}

Please make payment at your earliest convenience.

Thank you,
The {{hotelName}} Team`,
      isActive: false,
      variables: ['guestName', 'hotelName', 'amountDue', 'dueDate', 'confirmationNumber'],
    },
  ]);

  // Notification rules state
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'New Booking Alert',
      event: 'new_booking',
      channels: ['email', 'push'],
      recipients: ['admin@hotel.com', 'reservations@hotel.com'],
      timing: 'immediate',
      isActive: true,
    },
    {
      id: '2',
      name: 'Check-in Reminder',
      event: 'check_in',
      channels: ['email'],
      recipients: [],
      timing: 'scheduled',
      delay: 1440, // 24 hours before
      isActive: true,
    },
    {
      id: '3',
      name: 'Maintenance Request',
      event: 'maintenance_request',
      channels: ['email', 'slack'],
      recipients: ['maintenance@hotel.com'],
      timing: 'immediate',
      isActive: true,
    },
  ]);

  // System notifications state
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([
    {
      id: '1',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled system maintenance on Sunday, 2AM - 4AM UTC',
      type: 'warning',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false,
      targetUsers: ['all'],
    },
    {
      id: '2',
      title: 'New Feature Available',
      message: 'Invoice export feature is now available in billing section',
      type: 'info',
      timestamp: '2024-01-14T15:20:00Z',
      isRead: true,
      targetUsers: ['admin', 'manager'],
    },
    {
      id: '3',
      title: 'Database Backup Completed',
      message: 'Weekly database backup completed successfully',
      type: 'success',
      timestamp: '2024-01-14T02:00:00Z',
      isRead: true,
      targetUsers: ['admin'],
    },
  ]);

  const [newEmailTemplate, setNewEmailTemplate] = useState<Partial<EmailTemplate>>({
    name: '',
    subject: '',
    type: 'custom',
    content: '',
    isActive: true,
    variables: [],
  });

  const [newNotificationRule, setNewNotificationRule] = useState<Partial<NotificationRule>>({
    name: '',
    event: 'new_booking',
    channels: ['email'],
    recipients: [],
    timing: 'immediate',
    isActive: true,
  });

  const [newSystemNotification, setNewSystemNotification] = useState<Partial<SystemNotification>>({
    title: '',
    message: '',
    type: 'info',
    targetUsers: ['all'],
  });

  const addEmailTemplate = () => {
    if (newEmailTemplate.name && newEmailTemplate.subject && newEmailTemplate.content) {
      const template: EmailTemplate = {
        id: Date.now().toString(),
        name: newEmailTemplate.name,
        subject: newEmailTemplate.subject,
        type: newEmailTemplate.type || 'custom',
        content: newEmailTemplate.content,
        isActive: newEmailTemplate.isActive ?? true,
        variables: newEmailTemplate.variables || [],
      };
      setEmailTemplates([...emailTemplates, template]);
      setNewEmailTemplate({
        name: '',
        subject: '',
        type: 'custom',
        content: '',
        isActive: true,
        variables: [],
      });
    }
  };

  const addNotificationRule = () => {
    if (newNotificationRule.name && newNotificationRule.event) {
      const rule: NotificationRule = {
        id: Date.now().toString(),
        name: newNotificationRule.name,
        event: newNotificationRule.event,
        channels: newNotificationRule.channels || ['email'],
        recipients: newNotificationRule.recipients || [],
        timing: newNotificationRule.timing || 'immediate',
        delay: newNotificationRule.delay,
        isActive: newNotificationRule.isActive ?? true,
      };
      setNotificationRules([...notificationRules, rule]);
      setNewNotificationRule({
        name: '',
        event: 'new_booking',
        channels: ['email'],
        recipients: [],
        timing: 'immediate',
        isActive: true,
      });
    }
  };

  const addSystemNotification = () => {
    if (newSystemNotification.title && newSystemNotification.message) {
      const notification: SystemNotification = {
        id: Date.now().toString(),
        title: newSystemNotification.title,
        message: newSystemNotification.message,
        type: newSystemNotification.type || 'info',
        timestamp: new Date().toISOString(),
        isRead: false,
        targetUsers: newSystemNotification.targetUsers || ['all'],
      };
      setSystemNotifications([notification, ...systemNotifications]);
      setNewSystemNotification({
        title: '',
        message: '',
        type: 'info',
        targetUsers: ['all'],
      });
    }
  };

  const toggleTemplateStatus = (id: string) => {
    setEmailTemplates(emailTemplates.map(template => 
      template.id === id ? { ...template, isActive: !template.isActive } : template
    ));
  };

  const toggleRuleStatus = (id: string) => {
    setNotificationRules(notificationRules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const markNotificationAsRead = (id: string) => {
    setSystemNotifications(systemNotifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const deleteTemplate = (id: string) => {
    setEmailTemplates(emailTemplates.filter(template => template.id !== id));
  };

  const deleteRule = (id: string) => {
    setNotificationRules(notificationRules.filter(rule => rule.id !== id));
  };

  const deleteNotification = (id: string) => {
    setSystemNotifications(systemNotifications.filter(notif => notif.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground">
          Configure email templates, notification rules, and system alerts.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="rules">Notification Rules</TabsTrigger>
          <TabsTrigger value="system">System Notifications</TabsTrigger>
        </TabsList>

        {/* Email Templates Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Manage email templates for automated guest communications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add New Email Template */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Add New Email Template</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        placeholder="e.g., Welcome Email"
                        value={newEmailTemplate.name || ''}
                        onChange={(e) => setNewEmailTemplate({ ...newEmailTemplate, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-type">Template Type</Label>
                      <Select
                        value={newEmailTemplate.type || 'custom'}
                        onValueChange={(value: EmailTemplate['type']) => 
                          setNewEmailTemplate({ ...newEmailTemplate, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="booking_confirmation">Booking Confirmation</SelectItem>
                          <SelectItem value="check_in_reminder">Check-in Reminder</SelectItem>
                          <SelectItem value="check_out_reminder">Check-out Reminder</SelectItem>
                          <SelectItem value="cancellation">Cancellation</SelectItem>
                          <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                          <SelectItem value="welcome">Welcome</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="template-subject">Email Subject</Label>
                    <Input
                      id="template-subject"
                      placeholder="e.g., Welcome to {{hotelName}}"
                      value={newEmailTemplate.subject || ''}
                      onChange={(e) => setNewEmailTemplate({ ...newEmailTemplate, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-content">Email Content</Label>
                    <Textarea
                      id="template-content"
                      placeholder="Enter your email template content here. Use {{variableName}} for dynamic content."
                      rows={8}
                      value={newEmailTemplate.content || ''}
                      onChange={(e) => setNewEmailTemplate({ ...newEmailTemplate, content: e.target.value })}
                    />
                  </div>
                  <Button onClick={addEmailTemplate} className="w-full sm:w-auto">
                    Add Email Template
                  </Button>
                </div>

                {/* Existing Email Templates */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Current Email Templates</h3>
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant={template.isActive ? 'default' : 'secondary'}>
                              {template.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {template.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Subject: {template.subject}
                          </p>
                          <div className="text-sm text-muted-foreground max-w-2xl">
                            <p className="line-clamp-3">{template.content}</p>
                          </div>
                          {template.variables.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {template.variables.map((variable, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {variable}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTemplateStatus(template.id)}
                          >
                            {template.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
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

        {/* Notification Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Rules</CardTitle>
              <CardDescription>
                Configure when and how notifications are sent for different events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add New Notification Rule */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Add New Notification Rule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rule-name">Rule Name</Label>
                      <Input
                        id="rule-name"
                        placeholder="e.g., New Booking Alert"
                        value={newNotificationRule.name || ''}
                        onChange={(e) => setNewNotificationRule({ ...newNotificationRule, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rule-event">Event Trigger</Label>
                      <Select
                        value={newNotificationRule.event || 'new_booking'}
                        onValueChange={(value: NotificationRule['event']) => 
                          setNewNotificationRule({ ...newNotificationRule, event: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new_booking">New Booking</SelectItem>
                          <SelectItem value="cancellation">Cancellation</SelectItem>
                          <SelectItem value="check_in">Check-in</SelectItem>
                          <SelectItem value="check_out">Check-out</SelectItem>
                          <SelectItem value="payment_due">Payment Due</SelectItem>
                          <SelectItem value="maintenance_request">Maintenance Request</SelectItem>
                          <SelectItem value="guest_complaint">Guest Complaint</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rule-timing">Notification Timing</Label>
                      <Select
                        value={newNotificationRule.timing || 'immediate'}
                        onValueChange={(value: 'immediate' | 'scheduled') => 
                          setNewNotificationRule({ ...newNotificationRule, timing: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newNotificationRule.timing === 'scheduled' && (
                      <div>
                        <Label htmlFor="rule-delay">Delay (minutes)</Label>
                        <Input
                          id="rule-delay"
                          type="number"
                          placeholder="e.g., 1440 (24 hours)"
                          value={newNotificationRule.delay || ''}
                          onChange={(e) => setNewNotificationRule({ 
                            ...newNotificationRule, 
                            delay: parseInt(e.target.value) || 0 
                          })}
                        />
                      </div>
                    )}
                  </div>
                  <Button onClick={addNotificationRule} className="w-full sm:w-auto">
                    Add Notification Rule
                  </Button>
                </div>

                {/* Existing Notification Rules */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Current Notification Rules</h3>
                  {notificationRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{rule.name}</h4>
                            <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {rule.event.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {rule.channels.map((channel) => (
                              <Badge key={channel} variant="outline" className="capitalize">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Timing: {rule.timing}
                            {rule.delay && ` (${rule.delay} minutes delay)`}
                          </p>
                          {rule.recipients.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              Recipients: {rule.recipients.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRuleStatus(rule.id)}
                          >
                            {rule.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteRule(rule.id)}
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

        {/* System Notifications Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>
                Manage system-wide notifications and announcements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add New System Notification */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Add New System Notification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="notif-title">Notification Title</Label>
                      <Input
                        id="notif-title"
                        placeholder="e.g., System Maintenance"
                        value={newSystemNotification.title || ''}
                        onChange={(e) => setNewSystemNotification({ ...newSystemNotification, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notif-type">Notification Type</Label>
                      <Select
                        value={newSystemNotification.type || 'info'}
                        onValueChange={(value: SystemNotification['type']) => 
                          setNewSystemNotification({ ...newSystemNotification, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Information</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notif-message">Message</Label>
                    <Textarea
                      id="notif-message"
                      placeholder="Enter notification message..."
                      rows={3}
                      value={newSystemNotification.message || ''}
                      onChange={(e) => setNewSystemNotification({ ...newSystemNotification, message: e.target.value })}
                    />
                  </div>
                  <Button onClick={addSystemNotification} className="w-full sm:w-auto">
                    Add System Notification
                  </Button>
                </div>

                {/* Existing System Notifications */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Recent System Notifications</h3>
                  {systemNotifications.map((notification) => (
                    <div key={notification.id} className={`border rounded-lg p-4 ${!notification.isRead ? 'bg-muted/30' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{notification.title}</h4>
                            <Badge 
                              variant={
                                notification.type === 'error' ? 'destructive' :
                                notification.type === 'warning' ? 'default' :
                                notification.type === 'success' ? 'default' : 'secondary'
                              }
                            >
                              {notification.type}
                            </Badge>
                            {!notification.isRead && (
                              <Badge variant="outline">Unread</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
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