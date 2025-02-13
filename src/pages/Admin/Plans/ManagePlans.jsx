import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Plus } from "lucide-react";
import adminApi from "@/services/API/adminAxiosConfig";
import { EditPlanDialog } from "@/components/Admin/Plans/EditPlanDialog";


export const formatPrice = (price, currency) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(price);
};
export const ManagePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState({
    open: false,
    plan: null,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    plan: null,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchPlans = async () => {
    try {
      const { data } = await adminApi.get("/api/plan/plans");
      setPlans(data.data);
    } catch (error) {
      toast({
        title: "Error fetching plans",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await adminApi.put(
        `/api/plan/plans/${editDialog.plan._id}`,
        data
      );
      toast({
        title: "Success",
        description: "Plan updated successfully",
      });
      fetchPlans();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  const handleStatusChange = async (planId, currentStatus) => {
    try {
      await adminApi.patch(`/api/plan/plans/${planId}/status`, {
        status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });

      toast({
        title: "Status updated",
        description: "Plan status has been updated successfully",
      });

      fetchPlans();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.plan) return;

    try {
      await adminApi.delete(
        `/api/plan/plans/${deleteDialog.plan._id}`
      );
      toast({
        title: "Plan deleted",
        description: "Plan has been deleted successfully",
      });
      fetchPlans();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, plan: null });
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Plans
          </h1>
          <p className="text-muted-foreground">
            Manage your subscription plans
          </p>
        </div>
        <Button onClick={() => navigate("/admin/plan/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Popular</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
               <TableRow>
               <TableCell colSpan={6} className="h-96 text-center">
                 <div className="flex flex-col items-center justify-center gap-4 p-8">
                   <div className="relative w-24 h-24 mb-4">
                     <div className="absolute inset-0 bg-gray-100 rounded-full animate-pulse"></div>
                     <div className="absolute inset-4 bg-gray-50 rounded-full"></div>
                     <Plus className="absolute inset-0 m-auto w-8 h-8 text-gray-400" />
                   </div>

                   <div className="space-y-2 max-w-sm">
                     <p className="text-xl font-semibold text-gray-900">
                       No Subscription Plans Yet
                     </p>
                     <p className="text-sm text-gray-500 leading-relaxed">
                       Create your first subscription plan to start managing your product offerings. It only takes a few minutes to get started.
                     </p>
                   </div>
                   <Button
                     onClick={() => navigate("/admin/plan/create")}
                     className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
                   >
                     <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90 duration-200" />
                     Create Your First Plan
                   </Button>
                 </div>
               </TableCell>
             </TableRow>
              ) : (
                <>
                  {plans.map((plan) => (
                    <TableRow key={plan._id}>
                      <TableCell className="font-medium">
                        {plan.name}
                      </TableCell>
                      <TableCell>
                        {formatPrice(plan.price, plan.currency)}
                      </TableCell>
                      <TableCell>
                        {plan.billingCycle.charAt(0) +
                          plan.billingCycle.slice(1).toLowerCase()}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={plan.status === "ACTIVE"}
                          onCheckedChange={() =>
                            handleStatusChange(plan._id, plan.status)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            plan.isPopular ? "default" : "secondary"
                          }
                        >
                          {plan.isPopular ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setEditDialog({ open: true, plan })
                            }
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({ open: true, plan })
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <EditPlanDialog
        open={editDialog.open}
        plan={editDialog.plan}
        onClose={() => setEditDialog({ open: false, plan: null })}
        onUpdate={handleUpdate}
      />
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, plan: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the plan `
              {deleteDialog.plan?.name}`? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ open: false, plan: null })
              }
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
