"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, AlertCircle, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTransactions, useCreateTransaction, type TransactionFilters } from "@/lib/hooks/use-transactions";
import { useSales, useCreateSale, type SaleFilters } from "@/lib/hooks/use-sales";
import { useToastContext } from "@/components/toast-provider";
import type { NewTransaction, NewSale } from "@/types";

export default function FinancePage() {
  const t = useTranslations();
  const { toast } = useToastContext();

  // Date range filters
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // Fetch data with filters
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useTransactions({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const { data: salesData, isLoading: salesLoading, error: salesError, refetch: refetchSales } = useSales({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Dialog states
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);

  // Form states
  const [transactionForm, setTransactionForm] = useState<Partial<NewTransaction>>({
    type: "income",
    category: "",
    description: "",
    amount: "0",
    transactionDate: new Date(),
    farmId: undefined,
  });

  const [saleForm, setSaleForm] = useState<Partial<NewSale>>({
    cropType: "mango",
    quantityKg: "0",
    pricePerKg: "0",
    totalAmount: "0",
    buyerName: "",
    buyerContact: "",
    saleDate: new Date(),
    farmId: undefined,
  });

  // Mutations with refetch on success
  const createTransaction = useCreateTransaction(() => {
    toast({
      variant: "success",
      title: "Transaction Recorded",
      description: "Transaction has been added successfully",
    });
    setTransactionDialogOpen(false);
    setTransactionForm({
      type: "income",
      category: "",
      description: "",
      amount: "0",
      transactionDate: new Date(),
      farmId: undefined,
    });
    refetchTransactions();
  });

  const createSale = useCreateSale(() => {
    toast({
      variant: "success",
      title: "Sale Recorded",
      description: "Sale has been added successfully",
    });
    setSaleDialogOpen(false);
    setSaleForm({
      cropType: "mango",
      quantityKg: "0",
      pricePerKg: "0",
      totalAmount: "0",
      buyerName: "",
      buyerContact: "",
      saleDate: new Date(),
      farmId: undefined,
    });
    refetchSales();
  });

  // Handler functions
  const handleCreateTransaction = () => {
    if (!transactionForm.category || !transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
      });
      return;
    }

    try {
      createTransaction.mutate({
        ...transactionForm,
        amount: transactionForm.amount ? String(transactionForm.amount) : "0",
      } as NewTransaction);
    } catch (err) {
      toast({
        variant: "error",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create transaction",
      });
    }
  };

  const handleCreateSale = () => {
    if (!saleForm.buyerName || !saleForm.quantityKg || !saleForm.pricePerKg) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      createSale.mutate({
        farmId: saleForm.farmId || "",
        cropType: saleForm.cropType || "mango",
        quantityKg: parseFloat(String(saleForm.quantityKg)) || 0,
        pricePerKg: parseFloat(String(saleForm.pricePerKg)) || 0,
        totalAmount: parseFloat(String(saleForm.totalAmount)) || 0,
        buyerName: saleForm.buyerName || "",
        buyerContact: saleForm.buyerContact || undefined,
        saleDate: saleForm.saleDate instanceof Date ? saleForm.saleDate.toISOString() : String(saleForm.saleDate),
      });
    } catch (err) {
      toast({
        variant: "error",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create sale",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount);
  };

  const handleDateRangeChange = (field: "startDate" | "endDate", value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const clearDateRange = () => {
    setDateRange({ startDate: "", endDate: "" });
  };

  // Extract data from hooks
  const transactions = transactionsData?.transactions || [];
  const totalIncome = transactionsData?.totals.income || 0;
  const totalExpenses = transactionsData?.totals.expense || 0;
  const netProfit = (transactionsData?.totals.balance !== undefined) ? transactionsData.totals.balance : (totalIncome - totalExpenses);

  const sales = salesData?.sales || [];
  const totalSalesRevenue = salesData?.totals.totalRevenue || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("finance.title")}</h1>
            <p className="text-muted-foreground">Track income, expenses, and sales</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("finance.addSale")}
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("finance.addSale")}</DialogTitle>
                <DialogDescription>Record a new sale transaction</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Crop Type</Label>
                  <Select value={saleForm.cropType} onValueChange={(value) => setSaleForm(prev => ({ ...prev, cropType: value as "pineapple" | "cashew" | "avocado" | "mango" | "banana" | "papaya" }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mango">Mango</SelectItem>
                      <SelectItem value="cashew">Cashew</SelectItem>
                      <SelectItem value="pineapple">Pineapple</SelectItem>
                      <SelectItem value="banana">Banana</SelectItem>
                      <SelectItem value="papaya">Papaya</SelectItem>
                      <SelectItem value="avocado">Avocado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Quantity (kg)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={saleForm.quantityKg || ""}
                      onChange={(e) => {
                        const quantityKg = e.target.value;
                        const qty = parseFloat(quantityKg) || 0;
                        const price = parseFloat(String(saleForm.pricePerKg)) || 0;
                        setSaleForm(prev => ({
                          ...prev,
                          quantityKg,
                          totalAmount: String(qty * price)
                        }));
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Price per kg (XOF)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={saleForm.pricePerKg || ""}
                      onChange={(e) => {
                        const pricePerKg = e.target.value;
                        const price = parseFloat(pricePerKg) || 0;
                        const qty = parseFloat(String(saleForm.quantityKg)) || 0;
                        setSaleForm(prev => ({
                          ...prev,
                          pricePerKg,
                          totalAmount: String(qty * price)
                        }));
                      }}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Total Amount (XOF)</Label>
                  <Input type="number" value={saleForm.totalAmount || 0} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Buyer Name</Label>
                  <Input
                    placeholder="Enter buyer name"
                    value={saleForm.buyerName || ""}
                    onChange={(e) => setSaleForm(prev => ({ ...prev, buyerName: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Buyer Contact (Optional)</Label>
                  <Input
                    placeholder="Enter buyer contact"
                    value={saleForm.buyerContact || ""}
                    onChange={(e) => setSaleForm(prev => ({ ...prev, buyerContact: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Sale Date</Label>
                  <Input
                    type="date"
                    value={saleForm.saleDate instanceof Date ? saleForm.saleDate.toISOString().split('T')[0] : (saleForm.saleDate || "")}
                    onChange={(e) => setSaleForm(prev => ({ ...prev, saleDate: new Date(e.target.value) }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Enter additional notes"
                    value={saleForm.notes || ""}
                    onChange={(e) => setSaleForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateSale} disabled={createSale.isLoading}>
                  {createSale.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("common.save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("finance.addTransaction")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("finance.addTransaction")}</DialogTitle>
                <DialogDescription>Record income or expense</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={transactionForm.type} onValueChange={(value: "income" | "expense") => setTransactionForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">{t("finance.income")}</SelectItem>
                      <SelectItem value="expense">{t("finance.expenses")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={transactionForm.category} onValueChange={(value) => setTransactionForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="labor">Labor</SelectItem>
                      <SelectItem value="fertilizer">Fertilizer</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Amount (XOF)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={transactionForm.amount || ""}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Transaction Date</Label>
                  <Input
                    type="date"
                    value={transactionForm.transactionDate instanceof Date ? transactionForm.transactionDate.toISOString().split('T')[0] : (transactionForm.transactionDate || "")}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, transactionDate: new Date(e.target.value) }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter details"
                    value={transactionForm.description || ""}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateTransaction} disabled={createTransaction.isLoading}>
                  {createTransaction.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("common.save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Date Range:</Label>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
                className="w-40"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
                className="w-40"
              />
            </div>
            {(dateRange.startDate || dateRange.endDate) && (
              <Button variant="ghost" size="sm" onClick={clearDateRange}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error States */}
      {(transactionsError || salesError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{transactionsError?.message || salesError?.message}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchTransactions();
                refetchSales();
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("finance.income")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)} XOF</div>
                <p className="text-xs text-muted-foreground mt-1">Total income</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("finance.expenses")}</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)} XOF</div>
                <p className="text-xs text-muted-foreground mt-1">Total expenses</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("finance.netProfit")}</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(netProfit)} XOF
                </div>
                <p className="text-xs text-muted-foreground mt-1">Net profit/loss</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Transactions and Sales */}
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">{t("finance.transactions")}</TabsTrigger>
          <TabsTrigger value="sales">{t("finance.sales")}</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>All income and expense records</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No transactions found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Create your first transaction to get started
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount (XOF)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{new Date(tx.transactionDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={tx.type === "income" ? "default" : "destructive"}>
                            {tx.type === "income" ? t("finance.income") : t("finance.expenses")}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{tx.category}</TableCell>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell className={`text-right font-medium ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                          {tx.type === "income" ? "+" : "-"}{formatCurrency(Number(tx.amount))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Records</CardTitle>
              <CardDescription>All produce sales transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : sales.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No sales found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Record your first sale to get started
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Crop</TableHead>
                      <TableHead>Quantity (kg)</TableHead>
                      <TableHead>Price/kg (XOF)</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead className="text-right">Total (XOF)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium capitalize">{sale.cropType}</TableCell>
                        <TableCell>{formatCurrency(Number(sale.quantityKg))}</TableCell>
                        <TableCell>{formatCurrency(Number(sale.pricePerKg))}</TableCell>
                        <TableCell>{sale.buyerName}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(Number(sale.totalAmount))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
