'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Printer,
  Mail,
  FileText,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Building
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: string;
  guestName: string;
  guestEmail: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  items: InvoiceItem[];
  subtotal: number;
  taxes: number;
  total: number;
}

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

const hotelInfo = {
  name: 'Grand Hotel & Resort',
  address: '123 Hotel Boulevard',
  city: 'Downtown',
  state: 'CA',
  zipCode: '90210',
  phone: '(555) 123-4567',
  email: 'billing@grandhotel.com',
  website: 'www.grandhotel.com',
  taxId: 'TAX-123456789'
};

export default function InvoicePrintModal({
  isOpen,
  onClose,
  invoice,
}: InvoicePrintModalProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleEmailSend = async () => {
    setIsEmailSending(true);
    try {
      // Generate PDF blob for email attachment
      if (!invoiceRef.current) return;

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      const pdfBlob = pdf.output('blob');

      // In a real application, you would send this to your email service
      // For demonstration, we'll simulate the email sending
      console.log('PDF Blob generated for email:', pdfBlob);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Invoice ${invoice.invoiceNumber} has been sent to ${invoice.guestEmail}`);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    } finally {
      setIsEmailSending(false);
    }
  };

  const statusColors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice {invoice.invoiceNumber}
          </DialogTitle>
          <DialogDescription>
            Print, download, or email this invoice
          </DialogDescription>
        </DialogHeader>

        {/* Invoice Preview */}
        <div 
          ref={invoiceRef}
          className="bg-white p-8 border rounded-lg"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{hotelInfo.name}</h1>
              <div className="text-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span>{hotelInfo.address}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span>{hotelInfo.city}, {hotelInfo.state} {hotelInfo.zipCode}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4" />
                  <span>{hotelInfo.phone}</span>
                </div>
                <div className="mb-1">{hotelInfo.email}</div>
                <div className="mb-1">{hotelInfo.website}</div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">INVOICE</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">Invoice #: </span>
                  <span className="font-semibold">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date: </span>
                  <span className="font-semibold">{new Date(invoice.date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Due Date: </span>
                  <span className="font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>
                    {invoice.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Bill To:</h3>
              <div className="text-gray-700">
                <div className="font-semibold text-lg mb-1">{invoice.guestName}</div>
                <div className="mb-1">{invoice.guestEmail}</div>
                <div className="text-sm text-gray-600">
                  Room {invoice.roomNumber}
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Stay Details:</h3>
              <div className="text-gray-700">
                <div className="mb-1">
                  <span className="text-gray-600">Check-in: </span>
                  <span className="font-semibold">{new Date(invoice.checkIn).toLocaleDateString()}</span>
                </div>
                <div className="mb-1">
                  <span className="text-gray-600">Check-out: </span>
                  <span className="font-semibold">{new Date(invoice.checkOut).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Room: {invoice.roomNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Description</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Qty</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Unit Price</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                      <td className="border border-gray-300 px-4 py-3">
                        <div>
                          <div className="font-medium">{item.description}</div>
                          <div className="text-sm text-gray-500 capitalize">{item.category}</div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-medium">${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${invoice.taxes.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between py-2">
                    <span className="text-lg font-bold text-gray-800">Total:</span>
                    <span className="text-lg font-bold text-gray-800">${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 pt-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Payment Terms:</h4>
                <p className="text-sm text-gray-600">
                  Payment is due within 30 days of invoice date. Late payments may incur additional charges.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Thank You!</h4>
                <p className="text-sm text-gray-600">
                  We appreciate your business and hope you enjoyed your stay with us.
                </p>
              </div>
            </div>
            <div className="mt-4 text-center text-xs text-gray-500">
              Tax ID: {hotelInfo.taxId} | Questions? Contact us at {hotelInfo.email}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Invoice total: <span className="font-semibold">${invoice.total.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={generatePDF}
              disabled={isGeneratingPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </Button>
            <Button
              variant="outline"
              onClick={handleEmailSend}
              disabled={isEmailSending}
            >
              <Mail className="h-4 w-4 mr-2" />
              {isEmailSending ? 'Sending...' : 'Email Invoice'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}