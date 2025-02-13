import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '../../../components/Admin/Providers/AdminProvider';
import { 
  Users, 
  UserMinus, 
  UserX, 
  User,
  RefreshCw,
  Search,
  ChevronDown,
  Filter,
  X
} from 'lucide-react';
import adminApi from '@/services/API/adminAxiosConfig';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/functions/features/StateProvider';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stats, setStats] = useState({
    active: 0,
    inactive: 0,
    suspended: 0,
    total: 0
  });
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    user: null, 
    status: '' 
  });
  
  const { hasPermission } = useAdmin();
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/api/admin/users');
      setUsers(data.data);
      
      const statsData = {
        active: data.data.filter(user => user.status === 'ACTIVE').length,
        inactive: data.data.filter(user => user.status === 'INACTIVE').length,
        suspended: data.data.filter(user => user.status === 'SUSPENDED').length,
        total: data.data.length
      };
      setStats(statsData);
    } catch (error) {
      toast({
        title: "Error fetching users",
        description: error.message || "An error occurred while fetching users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!confirmDialog.user || !confirmDialog.status) return;
    
    try {
      await adminApi.patch(
        `${API_URL}/api/admin/users/${confirmDialog.user._id}/status`,
        { status: confirmDialog.status }
      );
      
      toast({
        title: "Status updated",
        description: `User status successfully updated to ${confirmDialog.status.toLowerCase()}.`
      });
      
      fetchUsers();
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update user status.",
        variant: "destructive",
      });
    } finally {
      setConfirmDialog({ open: false, user: null, status: '' });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearch(searchInput);
  };

  const clearFilters = () => {
    setSearchInput('');
    setActiveSearch('');
    setStatusFilter('ALL');
  };

  const getStatusConfig = (status) => {
    const configs = {
      ACTIVE: {
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: Users,
      },
      INACTIVE: {
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: UserMinus,
      },
      SUSPENDED: {
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: UserX,
      }
    };
    return configs[status] || configs.INACTIVE;
  };

  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      // Search matching
      const searchMatches = searchInput === '' || 
        user.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchInput.toLowerCase());
  
      // Status filtering
      const statusMatches = statusFilter === 'ALL' || user.status === statusFilter;
  
      return searchMatches && statusMatches;
    });
  }, [users, searchInput, statusFilter]);

  const StatCard = ({ title, value, status }) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className={`text-2xl font-bold ${config.color}`}>
              {value.toLocaleString()}
            </div>
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const isFiltering = activeSearch || statusFilter !== 'ALL';

  return (
    <div className="min-h-screen bg-gray-50/30 p-8 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-gray-900">Users Management</h1>
        <p className="text-base text-gray-500">
          Total users: {stats.total.toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Active Users" 
          value={stats.active} 
          status="ACTIVE"
        />
        <StatCard 
          title="Inactive Users" 
          value={stats.inactive} 
          status="INACTIVE"
        />
        <StatCard 
          title="Suspended Users" 
          value={stats.suspended} 
          status="SUSPENDED"
        />
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              User Accounts
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 w-[240px]"
                />
              </form>
              <div className="flex gap-2">
                {isFiltering && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsers}
                  disabled={loading}
                  className="hover:bg-gray-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-sm font-semibold text-gray-600">User</TableHead>
                <TableHead className="text-sm font-semibold text-gray-600">Email</TableHead>
                <TableHead className="text-sm font-semibold text-gray-600">Status</TableHead>
                {hasPermission('users', 'update') && (
                  <TableHead className="text-sm font-semibold text-gray-600">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => {
                const statusConfig = getStatusConfig(user.status);
                return (
                  <TableRow key={user._id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name || 'No Name'}</div>
                          <div className="text-sm text-gray-500">ID: {user._id.slice(-6)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border} px-2 py-1`}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    {hasPermission('users', 'update') && (
                      <TableCell>
                        <Select
                          value={user.status}
                          onValueChange={(value) => setConfirmDialog({
                            open: true,
                            user,
                            status: value
                          })}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Set Active</SelectItem>
                            <SelectItem value="SUSPENDED">Set Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog 
        open={confirmDialog.open} 
        onOpenChange={() => setConfirmDialog({ open: false, user: null, status: '' })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription className="text-gray-500">
              Are you sure you want to change the status of user{" "}
              <span className="font-medium text-gray-900">{confirmDialog.user?.name}</span>{" "}
              to{" "}
              <span className="font-medium text-gray-900">{confirmDialog.status}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, user: null, status: '' })}
              className="border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;