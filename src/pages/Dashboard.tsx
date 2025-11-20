import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalOrders: 0,
    totalValue: 0,
    lowStock: 0,
  });
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = auth.getToken();
    if (!token) return;

    try {
      const [inventoryData, ordersData] = await Promise.all([
        api.getInventory(token),
        api.getOrders(token),
      ]);

      setInventory(inventoryData);
      setOrders(ordersData);

      const totalValue = inventoryData.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0);
      const lowStockCount = inventoryData.filter((item: any) => item.unit < 10).length;

      setStats({
        totalItems: inventoryData.length,
        totalOrders: ordersData.length,
        totalValue: Math.round(totalValue),
        lowStock: lowStockCount,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const chartData = inventory.slice(0, 5).map((item) => ({
    name: item.productName?.substring(0, 10) || "Unknown",
    stock: item.unit || 0,
    value: item.totalPrice || 0,
  }));

  const orderStatusData = [
    { name: "Placed", value: orders.filter((o) => o.orderStatus === "PLACED").length, color: "#10b981" },
    { name: "Insufficient", value: orders.filter((o) => o.orderStatus === "INSUFFICIENT_STOCK").length, color: "#f59e0b" },
    { name: "Cancelled", value: orders.filter((o) => o.orderStatus === "CANCELLED").length, color: "#ef4444" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            icon={Package}
            gradient="primary"
            trend={{ value: "12%", positive: true }}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingCart}
            gradient="secondary"
            trend={{ value: "8%", positive: true }}
          />
          <StatCard
            title="Total Value"
            value={`$${stats.totalValue.toLocaleString()}`}
            icon={TrendingUp}
            gradient="success"
            trend={{ value: "15%", positive: true }}
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStock}
            icon={AlertTriangle}
            gradient="warning"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 animate-slide-up">
            <h3 className="text-lg font-semibold mb-4">Top 5 Products by Stock</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="stock" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 animate-slide-up">
            <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 animate-slide-up">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.orderId}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order.productName}</p>
                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    ${(order.totalAmount || 0).toFixed(2)}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.orderStatus === "PLACED"
                        ? "bg-success/20 text-success"
                        : order.orderStatus === "INSUFFICIENT_STOCK"
                        ? "bg-warning/20 text-warning"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
