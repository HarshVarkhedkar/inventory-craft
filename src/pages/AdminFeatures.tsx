import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { Mail, AlertTriangle, Send, Package, TrendingDown, History, Clock } from "lucide-react";

interface SentEmail {
  id: string;
  recipient: string;
  subject: string;
  message: string;
  sentAt: string;
  status: "success" | "failed";
}

const AdminFeatures = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailData, setEmailData] = useState({
    recipient: "",
    subject: "",
    message: "",
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);

  // Load sent emails from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("sentEmails");
    if (stored) {
      setSentEmails(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const token = auth.getToken();
    if (!token) return;

    try {
      const data = await api.getInventory(token);
      setInventory(data);
      // Filter items with stock less than 20 units
      const lowStock = data.filter((item: any) => item.unit < 20);
      setLowStockItems(lowStock);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingEmail(true);

    const token = auth.getToken();
    if (!token) {
      toast.error("Authentication required");
      setSendingEmail(false);
      return;
    }

    try {
      // ✅ FIX: Send with correct field name "to" instead of "recipient"
      const emailPayload = {
        to: emailData.recipient,      // ✅ Changed from "recipient" to "to"
        subject: emailData.subject,
        message: emailData.message
      };

      console.log("📧 Sending email with payload:", emailPayload);
      
      await api.sendEmail(token, emailPayload);
      
      // Create email record
      const newEmail: SentEmail = {
        id: Date.now().toString(),
        recipient: emailData.recipient,
        subject: emailData.subject,
        message: emailData.message,
        sentAt: new Date().toISOString(),
        status: "success",
      };

      // Update sent emails list
      const updatedEmails = [newEmail, ...sentEmails];
      setSentEmails(updatedEmails);
      localStorage.setItem("sentEmails", JSON.stringify(updatedEmails));

      toast.success(`Email sent successfully to ${emailData.recipient}`);
      setEmailData({ recipient: "", subject: "", message: "" });
    } catch (error: any) {
      // Save failed email attempt
      const failedEmail: SentEmail = {
        id: Date.now().toString(),
        recipient: emailData.recipient,
        subject: emailData.subject,
        message: emailData.message,
        sentAt: new Date().toISOString(),
        status: "failed",
      };
      
      const updatedEmails = [failedEmail, ...sentEmails];
      setSentEmails(updatedEmails);
      localStorage.setItem("sentEmails", JSON.stringify(updatedEmails));

      toast.error(error.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const sendLowStockAlert = () => {
    if (lowStockItems.length === 0) {
      toast.info("No low stock items to alert about");
      return;
    }

    const itemsList = lowStockItems
      .map(item => `- ${item.productName} (${item.unit} units left)`)
      .join("\n");

    setEmailData({
      recipient: "",
      subject: "Low Stock Alert - Immediate Action Required",
      message: `Dear Team,\n\nThe following items are running low on stock:\n\n${itemsList}\n\nPlease arrange for restocking at your earliest convenience.\n\nBest regards,\nInventory Management System`,
    });
    toast.success("Low stock alert template loaded");
  };

  const totalLowStockValue = lowStockItems.reduce(
    (sum, item) => sum + (item.totalPrice || 0),
    0
  );

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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Tools</h1>
          <p className="text-muted-foreground mt-1">Advanced features for administrators</p>
        </div>

        <Tabs defaultValue="email" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="email" className="gap-2">
              <Mail className="w-4 h-4" />
              Email Center
            </TabsTrigger>
            <TabsTrigger value="lowstock" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Low Stock
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              Email History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Email Communication Center</h2>
                  <p className="text-sm text-muted-foreground">
                    Send emails to staff and suppliers
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Email</Label>
                  <Input
                    id="recipient"
                    type="email"
                    placeholder="recipient@example.com"
                    value={emailData.recipient}
                    onChange={(e) =>
                      setEmailData({ ...emailData, recipient: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Email subject"
                    value={emailData.subject}
                    onChange={(e) =>
                      setEmailData({ ...emailData, subject: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    value={emailData.message}
                    onChange={(e) =>
                      setEmailData({ ...emailData, message: e.target.value })
                    }
                    rows={8}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="bg-gradient-primary hover:opacity-90 gap-2"
                    disabled={sendingEmail}
                  >
                    <Send className="w-4 h-4" />
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={sendLowStockAlert}
                    className="gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Load Low Stock Alert
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="lowstock" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Low Stock Items</p>
                    <p className="text-2xl font-bold">{lowStockItems.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center">
                    <Package className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Units</p>
                    <p className="text-2xl font-bold">
                      {lowStockItems.reduce((sum, item) => sum + item.unit, 0)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">${totalLowStockValue.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Low Stock Alert</h2>
                  <p className="text-sm text-muted-foreground">
                    Items with less than 20 units in stock
                  </p>
                </div>
                <Button
                  onClick={sendLowStockAlert}
                  variant="outline"
                  className="gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Create Alert Email
                </Button>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Product Name</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Price/Unit</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Package className="w-12 h-12 text-muted-foreground/50" />
                            <p>No low stock items - All inventory levels are healthy!</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      lowStockItems.map((item) => (
                        <TableRow
                          key={item.productId}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {item.productName}
                          </TableCell>
                          <TableCell>{item.modelname || "-"}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.unit < 10
                                  ? "bg-destructive/20 text-destructive"
                                  : "bg-warning/20 text-warning"
                              }`}
                            >
                              {item.unit} units
                            </span>
                          </TableCell>
                          <TableCell>${item.pricePerQuantity?.toFixed(2)}</TableCell>
                          <TableCell className="font-semibold">
                            ${item.totalPrice?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                item.unit < 10
                                  ? "bg-destructive/20 text-destructive"
                                  : "bg-warning/20 text-warning"
                              }`}
                            >
                              {item.unit < 10 ? "Critical" : "Low"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <History className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Email History</h2>
                  <p className="text-sm text-muted-foreground">
                    View all sent emails and their status
                  </p>
                </div>
              </div>

              {sentEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mail className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-lg">No emails sent yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Emails you send will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentEmails.map((email) => (
                    <Card
                      key={email.id}
                      className={`p-4 ${
                        email.status === "failed"
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{email.recipient}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                email.status === "success"
                                  ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                  : "bg-destructive/20 text-destructive"
                              }`}
                            >
                              {email.status === "success" ? "Sent" : "Failed"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{email.subject}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {email.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(email.sentAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminFeatures;