import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Users,
  DollarSign,
  CreditCard,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useAdmin } from "../Providers/AdminProvider";
import { formatDate } from "../ultils/formatDate";

export function AdminDashboard() {
  const { users } = useAdmin();

  const RecentSignups =
    users &&
    users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Dashboard
        </h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,350</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  +180 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Subscriptions
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,890</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  +25% conversion rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Now
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">573</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                  -2% from last hour
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Revenue Chart Coming Soon
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Signups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {RecentSignups.map((user, i) => (
                    <div key={i} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                        {user?.lastLogin && (
                          <p className="text-sm text-muted-foreground">{formatDate(user.lastLogin)}</p>
                        )}
                      </div>
                      <div className="ml-auto font-medium">
                        {user?.plan}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
