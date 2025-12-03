'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/navigation/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/shared/Loader';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import { Check, X, Clock } from 'lucide-react';

interface Approval {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewerNotes: string | null;
}

export default function ApprovalPage() {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    approval: Approval | null;
    action: 'approve' | 'reject' | null;
  }>({
    open: false,
    approval: null,
    action: null,
  });
  const [reviewerNotes, setReviewerNotes] = useState('');

  useEffect(() => {
    fetchApprovals();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredApprovals(approvals);
    } else {
      setFilteredApprovals(approvals.filter((a) => a.status === activeTab));
    }
  }, [activeTab, approvals]);

  const fetchApprovals = async () => {
    try {
      const response = await apiClient.get('/approval');
      setApprovals(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load approval requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionDialog.approval || !actionDialog.action) return;

    try {
      await apiClient.put(`/approval/${actionDialog.approval.id}`, {
        status: actionDialog.action === 'approve' ? 'approved' : 'rejected',
        reviewerNotes,
      });

      toast({
        title: 'Success',
        description: `Request ${actionDialog.action}d successfully`,
      });

      fetchApprovals();
      setActionDialog({ open: false, approval: null, action: null });
      setReviewerNotes('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to process approval request',
        variant: 'destructive',
      });
    }
  };

  const openActionDialog = (approval: Approval, action: 'approve' | 'reject') => {
    setActionDialog({ open: true, approval, action });
    setReviewerNotes('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approval Requests</h1>
          <p className="text-gray-500">Review and manage approval requests</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="rounded-lg border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApprovals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500">
                        No approval requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApprovals.map((approval) => (
                      <TableRow key={approval.id}>
                        <TableCell className="font-medium">{approval.employeeName}</TableCell>
                        <TableCell className="capitalize">{approval.type}</TableCell>
                        <TableCell className="max-w-xs truncate">{approval.reason}</TableCell>
                        <TableCell>
                          {new Date(approval.startDate).toLocaleDateString()} -{' '}
                          {new Date(approval.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(approval.status)}</TableCell>
                        <TableCell>{new Date(approval.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          {approval.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openActionDialog(approval, 'approve')}
                                className="text-green-600 hover:bg-green-50"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openActionDialog(approval, 'reject')}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {approval.status !== 'pending' && (
                            <span className="text-sm text-gray-500">
                              {approval.reviewedAt
                                ? new Date(approval.reviewedAt).toLocaleDateString()
                                : '-'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ open, approval: null, action: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'approve' ? 'Approve' : 'Reject'} Request
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'approve'
                ? 'Approve this request from'
                : 'Reject this request from'}{' '}
              {actionDialog.approval?.employeeName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Request Details</Label>
              <div className="rounded-lg bg-gray-50 p-3 space-y-1 text-sm">
                <p>
                  <span className="font-medium">Type:</span>{' '}
                  <span className="capitalize">{actionDialog.approval?.type}</span>
                </p>
                <p>
                  <span className="font-medium">Reason:</span> {actionDialog.approval?.reason}
                </p>
                <p>
                  <span className="font-medium">Period:</span>{' '}
                  {actionDialog.approval?.startDate &&
                    new Date(actionDialog.approval.startDate).toLocaleDateString()}{' '}
                  -{' '}
                  {actionDialog.approval?.endDate &&
                    new Date(actionDialog.approval.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Reviewer Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes or comments..."
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, approval: null, action: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              variant={actionDialog.action === 'approve' ? 'default' : 'destructive'}
            >
              {actionDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
