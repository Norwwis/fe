'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/navigation/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
}

export default function BulkGeneratePayrollPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [period, setPeriod] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await apiClient.get('/employees?status=active');
      setEmployees(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load employees',
        variant: 'destructive',
      });
    }
  };

  const handleToggleEmployee = (id: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEmployees(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEmployees.size === employees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(employees.map((e) => e.id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEmployees.size === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one employee',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/payroll/bulk-generate', {
        employeeIds: Array.from(selectedEmployees),
        period,
      });

      toast({
        title: 'Success',
        description: `Generated payroll for ${selectedEmployees.size} employees`,
      });

      router.push('/payroll');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to generate payroll',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Generate Payroll</h1>
            <p className="text-gray-500">Generate payroll for multiple employees</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Period</CardTitle>
            <CardDescription>Select the period for payroll generation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="max-w-md space-y-2">
                <Label htmlFor="period">Period *</Label>
                <Input
                  id="period"
                  type="month"
                  required
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Select Employees ({selectedEmployees.size} selected)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedEmployees.size === employees.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>

                <div className="space-y-2 rounded-lg border p-4">
                  {employees.length === 0 ? (
                    <p className="text-center text-gray-500">No active employees found</p>
                  ) : (
                    employees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between rounded-md p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedEmployees.has(employee.id)}
                            onCheckedChange={() => handleToggleEmployee(employee.id)}
                          />
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-gray-500">{employee.position}</p>
                          </div>
                        </div>
                        <div className="text-sm font-semibold">
                          ${employee.salary.toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading || selectedEmployees.size === 0}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    `Generate Payroll (${selectedEmployees.size})`
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
