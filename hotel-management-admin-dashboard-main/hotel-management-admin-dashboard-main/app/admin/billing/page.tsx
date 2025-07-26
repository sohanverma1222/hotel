'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Receipt, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  CreditCard,
  TrendingUp,
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
import { useBilling, useBillingStats, useBillingActions } from '@/hooks/use-billing';
import { useMemo } from 'react';

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Draft', icon: FileText },
  sent: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Sent', icon: Send },
  paid: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Paid', icon: CheckCircle },
  overdue: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Overdue', icon: AlertCircle },
};

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);


  const { bills, isLoading, error, refetch } = useBilling(statusFilter);
  const { updateBillStatus, generateBill } = useBillingActions();
  const stats = useBillingStats(bills);

  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const matchesSearch = bill.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bill.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bill.roomNumber.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [bills, searchTerm, statusFilter]);

  const handleStatusUpdate = async (billId: string, newStatus: string) => {
    try {
      await updateBillStatus(billId, newStatus);
      console.log('Bill status updated to', newStatus);
      refetch();
    } catch (error) {
      console.error('Failed to update bill status:', error);
    }
  };

  const handleGenerateBill = async (reservationId: string) => {
    try {
      await generateBill(reservationId);
      console.log('Bill generated successfully');
      refetch();
    } catch (error) {
      console.error('Failed to generate bill:', error);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Bills</h2>
          <p className="text-muted-foreground mb-4">Failed to load billing data</p>
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
          <h1 className="text-3xl font-bold text-foreground font-heading">Billing & Invoicing</h1>
          <p className="text-muted-foreground font-inter">
            Manage invoices, payments, and billing operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowNewInvoiceModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.paidBills} paid invoices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.sentBills + stats.draftBills} pending invoices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueBills} overdue invoices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBills}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
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
              All Invoices
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatusFilter('draft')}>
              Draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('sent')}>
              Sent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('paid')}>
              Paid
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('overdue')}>
              Overdue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Invoices</CardTitle>
          <CardDescription className="font-inter">
            Manage all billing and invoice operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => {
                  const StatusIcon = statusConfig[bill.status as keyof typeof statusConfig].icon;
                  return (
                    <TableRow key={bill.id}>
                      <TableCell>
                        <div className="font-medium">{bill.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{bill.guestName}</div>
                        <div className="text-sm text-muted-foreground">
                          {bill.checkIn} - {bill.checkOut}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{bill.roomNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {bill.items.length} items
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${bill.total.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          Subtotal: ${bill.subtotal.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[bill.status as keyof typeof statusConfig].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[bill.status as keyof typeof statusConfig].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(bill.dueDate).toLocaleDateString()}
                        </div>
                        {bill.status === 'overdue' && (
                          <div className="text-xs text-red-600 mt-1">
                            {Math.ceil((new Date().getTime() - new Date(bill.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {bill.paidDate ? (
                          <div>
                            <div className="text-sm font-medium text-green-600">Paid</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(bill.paidDate).toLocaleDateString()}
                            </div>
                            {bill.paymentMethod && (
                              <div className="text-xs text-muted-foreground">
                                {bill.paymentMethod}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Pending
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {bill.status === 'draft' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusUpdate(bill.id, 'sent')}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                          )}
                          {(bill.status === 'sent' || bill.status === 'overdue') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusUpdate(bill.id, 'paid')}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Record Payment
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                •••
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2" />
                                Send via Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Duplicate Invoice
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                Edit Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Delete Invoice
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
                <p>Loading bills...</p>
              </div>
            )}
            
            {!isLoading && filteredBills.length === 0 && (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>No invoices found matching your criteria.</p>
              </div>
            )}
          </div>
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
              Create New Invoice
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All Invoices
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Send Payment Reminders
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
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-muted-foreground">INV-2024-001 - $425.70</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Send className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Invoice sent</p>
                  <p className="text-xs text-muted-foreground">INV-2024-002 - Sarah Johnson</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Payment overdue</p>
                  <p className="text-xs text-muted-foreground">INV-2024-003 - 3 days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="font-medium">${stats.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-medium text-yellow-600">${stats.pendingAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Overdue</span>
                <span className="font-medium text-red-600">${stats.overdueAmount.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span>Total Outstanding</span>
                  <span>${(stats.pendingAmount + stats.overdueAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}