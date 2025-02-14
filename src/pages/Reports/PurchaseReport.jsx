import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Package, DollarSign, ChevronLeft, ChevronRight, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from '@/functions/resources/axiosConfig';
import { formatDate } from '@/components/Admin/ultils/formatDate';

export const PurchaseReport = () => {
  const [orders, setOrders] = useState([]);
  const [adsData, setAdsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersResponse, adsResponse] = await Promise.all([
        api.get('/auth/user/orders'),
        api.get('/auth/db/ads')
      ]);

      setOrders(ordersResponse.data.data || []);
      setAdsData(adsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAdSpendForDate = (date) => {
    const matchingAds = adsData.filter(ad =>
      new Date(ad.createdTime).toDateString() === new Date(date).toDateString()
    );

    return matchingAds.reduce((sum, ad) => {
      return sum + (ad.insights?.spend ? parseFloat(ad.insights.spend) : 0);
    }, 0);
  };

  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <LineChart className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">No Purchase Data Available</h3>
      <p className="text-sm text-gray-500 mb-4">
        There are no purchase records to display at this time.
      </p>
      <Button
        variant="outline"
        onClick={fetchData}
      >
        Refresh Data
      </Button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Daily Purchase Report</h1>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Calendar className="h-4 w-4 mr-2 inline-block" /> Date</TableHead>
                <TableHead><Package className="h-4 w-4 mr-2 inline-block" /> Purchases</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Purchase ID</TableHead>
                <TableHead><DollarSign className="h-4 w-4 mr-2 inline-block" /> Ad Spend</TableHead>
                <TableHead>CPA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex justify-center">
                      <svg className="animate-spin text-blue-500" width="40" height="40" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState />
                  </TableCell>
                </TableRow>
              ) : (
                currentOrders.map((order) => {
                  const adSpend = getAdSpendForDate(order.created_at);
                  const CPA = order.total_price && adSpend > 0 ? (adSpend / order.total_price).toFixed(2) : 'N/A';

                  return (
                    <TableRow key={order.order_id}>
                      <TableCell className="font-medium">{formatDate(order.created_at)}</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>{order.shipping_address?.country || 'Unknown'}</TableCell>
                      <TableCell>{order.order_id}</TableCell>
                      <TableCell>${adSpend.toFixed(2)}</TableCell>
                      <TableCell>${CPA}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {!loading && orders.length > 0 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, orders.length)} of {orders.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};