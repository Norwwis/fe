'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/navigation/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/shared/Loader';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import { Plus, Eye, Download, Check } from 'lucide-react';

interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  basicSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: string;
  paymentDate: string | null;
}

export default function PayrollPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [filteredPayrolls, setFilteredPayrolls] = useState<Payroll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPayrolls();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredPayrolls(payrolls);
    } else {
      setFilteredPayrolls(payrolls.filter((p) => p.status === statusFilter));
    }
  }, [statusFilter, payrolls]);

  const fetchPayrolls = async () => {
    try {
      const response = await apiClient.get('/payroll');
      setPayrolls(response.data);
      setFilteredPayrolls(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load payroll records',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await apiClient.put(`/payroll/${id}`, { status: 'paid' });
      toast({
        title: 'Success',
        description: 'Payroll marked as paid',
      });
      fetchPayrolls();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update payroll status',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/payroll/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payroll_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({
        title: 'Success',
        description: 'Payroll exported successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to export payroll',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
            <p className="text-gray-500">Manage employee payroll</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={() => router.push('/payroll/bulk-generate')}>
              Bulk Generate
            </Button>
            <Button onClick={() => router.push('/payroll/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Payroll
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Bonuses</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayrolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    No payroll records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayrolls.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell className="font-medium">{payroll.employeeName}</TableCell>
                    <TableCell>{payroll.period}</TableCell>
                    <TableCell>${payroll.basicSalary.toLocaleString()}</TableCell>
                    <TableCell>${payroll.bonuses.toLocaleString()}</TableCell>
                    <TableCell>${payroll.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">${payroll.netSalary.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={payroll.status === 'paid' ? 'default' : 'secondary'}>
                        {payroll.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/payroll/${payroll.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payroll.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsPaid(payroll.id)}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
