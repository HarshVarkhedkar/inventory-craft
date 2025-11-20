import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search, Download } from "lucide-react";

const Inventory = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    productName: "",
    modelname: "",
    pricePerQuantity: "",
    unit: "",
    status: "Available",
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    const filtered = inventory.filter((item) =>
      item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.modelname?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventory(filtered);
  }, [searchTerm, inventory]);

  const fetchInventory = async () => {
    const token = auth.getToken();
    if (!token) return;

    try {
      const data = await api.getInventory(token);
      setInventory(data);
      setFilteredInventory(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = auth.getToken();
    if (!token) return;

    try {
      const itemData = {
        ...formData,
        pricePerQuantity: parseFloat(formData.pricePerQuantity),
        unit: parseInt(formData.unit),
      };

      if (editMode && currentItem) {
        await api.updateInventoryItem(token, currentItem.productId, itemData);
        toast.success("Item updated successfully");
      } else {
        await api.addInventoryItem(token, itemData);
        toast.success("Item added successfully");
      }

      fetchInventory();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const token = auth.getToken();
    if (!token) return;

    try {
      await api.deleteInventoryItem(token, id);
      toast.success("Item deleted successfully");
      fetchInventory();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    }
  };

  const handleEdit = (item: any) => {
    setCurrentItem(item);
    setFormData({
      productName: item.productName,
      modelname: item.modelname || "",
      pricePerQuantity: item.pricePerQuantity?.toString() || "",
      unit: item.unit?.toString() || "",
      status: item.status || "Available",
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      modelname: "",
      pricePerQuantity: "",
      unit: "",
      status: "Available",
    });
    setCurrentItem(null);
    setEditMode(false);
    setDialogOpen(false);
  };

  const handleExport = async () => {
    const token = auth.getToken();
    if (!token) return;

    try {
      const blob = await api.exportInventoryCsv(token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Inventory exported successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to export inventory");
    }
  };

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
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground mt-1">Manage your product inventory</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-primary hover:opacity-90" onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}>
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editMode ? "Edit Item" : "Add New Item"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modelname">Model Name</Label>
                    <Input
                      id="modelname"
                      value={formData.modelname}
                      onChange={(e) => setFormData({ ...formData, modelname: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price per Unit</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.pricePerQuantity}
                        onChange={(e) => setFormData({ ...formData, pricePerQuantity: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Quantity</Label>
                      <Input
                        id="unit"
                        type="number"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                      {editMode ? "Update" : "Add"} Item
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by product or model name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Product Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Price/Unit</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.productId} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.modelname || "-"}</TableCell>
                      <TableCell>${item.pricePerQuantity?.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.unit < 10
                              ? "bg-destructive/20 text-destructive"
                              : item.unit < 50
                              ? "bg-warning/20 text-warning"
                              : "bg-success/20 text-success"
                          }`}
                        >
                          {item.unit} units
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${item.totalPrice?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-success/20 text-success">
                          {item.status || "Available"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            className="hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(item.productId)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
