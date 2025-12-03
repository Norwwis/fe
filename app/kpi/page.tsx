'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/navigation/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/shared/Loader';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import { Edit, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPI {
  id: string;
  employeeId: string;
  employeeName: string;
  score: number;
  target: number;
  period: string;
  lastUpdated: string;
}

export default function KPIPage() {
  const { toast } = useToast();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialog, setEditDialog] = useState<{ open: boolean; kpi: KPI | null }>({
    open: false,
    kpi: null,
  });
  const [newScore, setNewScore] = useState('');

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      const response = await apiClient.get('/kpi');
      setKpis(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load KPI data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editDialog.kpi) return;

    try {
      await apiClient.put(`/kpi/${editDialog.kpi.id}`, {
        score: parseFloat(newScore),
      });

      toast({
        title: 'Success',
        description: 'KPI score updated successfully',
      });

      fetchKPIs();
      setEditDialog({ open: false, kpi: null });
      setNewScore('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update KPI score',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (kpi: KPI) => {
    setEditDialog({ open: true, kpi });
    setNewScore(kpi.score.toString());
  };

  const getPerformanceIndicator = (score: number, target: number) => {
    const percentage = (score / target) * 100;
    if (percentage >= 100) return { icon: TrendingUp, color: 'text-green-600', label: 'Exceeding' };
    if (percentage >= 80) return { icon: TrendingUp, color: 'text-blue-600', label: 'On Track' };
    if (percentage >= 60) return { icon: Minus, color: 'text-yellow-600', label: 'Needs Attention' };
    return { icon: TrendingDown, color: 'text-red-600', label: 'Below Target' };
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">KPI Management</h1>
          <p className="text-gray-500">Track employee performance indicators</p>
        </div>

        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Current Score</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpis.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    No KPI data found
                  </TableCell>
                </TableRow>
              ) : (
                kpis.map((kpi) => {
                  const percentage = Math.min((kpi.score / kpi.target) * 100, 100);
                  const indicator = getPerformanceIndicator(kpi.score, kpi.target);
                  const Icon = indicator.icon;

                  return (
                    <TableRow key={kpi.id}>
                      <TableCell className="font-medium">{kpi.employeeName}</TableCell>
                      <TableCell>{kpi.period}</TableCell>
                      <TableCell className="font-semibold">{kpi.score}</TableCell>
                      <TableCell>{kpi.target}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-black transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{percentage.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${indicator.color}`} />
                          <span className={`text-sm ${indicator.color}`}>{indicator.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(kpi.lastUpdated).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(kpi)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, kpi: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update KPI Score</DialogTitle>
            <DialogDescription>
              Update the KPI score for {editDialog.kpi?.employeeName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="score">New Score</Label>
              <Input
                id="score"
                type="number"
                step="0.01"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Target: {editDialog.kpi?.target || 0}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, kpi: null })}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
