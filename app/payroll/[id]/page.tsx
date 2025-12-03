'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/navigation/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/shared/Loader';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import { ArrowLeft, Download, FileText } from 'lucide-react';

interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  period: string;
  basicSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: string;
  paymentDate: string | null;
  createdAt: string;
}

export default function PayrollDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPayroll();
    }
  }, [params.id]);

  const fetchPayroll = async () => {
    try {
      const response = await apiClient.get(`/payroll/${params.id}`);
      setPayroll(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load payroll details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSlip = async () => {
    try {
      const response = await apiClient.get(`/payroll/${params.id}/slip`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${params.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({
        title: 'Success',
        description: 'Payslip downloaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download payslip',
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

  if (!payroll) {
    return (
      <DashboardLayout>
        <div className="text-center text-gray-500">Payroll not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payroll Details</h1>
              <p className="text-gray-500">{payroll.employeeName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadSlip}>
              <Download className="mr-2 h-4 w-4" />
              Download Slip
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{payroll.employeeName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{payroll.employeeEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Period</p>
                <p className="font-medium">{payroll.period}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={payroll.status === 'paid' ? 'default' : 'secondary'}>
                  {payroll.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Date</p>
                <p className="font-medium">
                  {payroll.paymentDate
                    ? new Date(payroll.paymentDate).toLocaleDateString()
                    : 'Not paid yet'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {new Date(payroll.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Salary Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-gray-600">Basic Salary</span>
                <span className="font-medium">${payroll.basicSalary.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-gray-600">Bonuses</span>
                <span className="font-medium text-green-600">
                  +${payroll.bonuses.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-gray-600">Deductions</span>
                <span className="font-medium text-red-600">
                  -${payroll.deductions.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <span className="text-lg font-semibold">Net Salary</span>
                <span className="text-2xl font-bold text-green-600">
                  ${payroll.netSalary.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
