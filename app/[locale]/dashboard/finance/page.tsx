"use client";

import { useTranslations } from "next-intl";
import { Plus, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
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

export default function FinancePage() {
  const t = useTranslations();

  // Mock data
  const transactions = [
    { id: 1, date: "2024-11-24", type: "income", category: "Mango Sales", description: "Export to France", amount: 2500000, farm: "Ferme Bobo" },
    { id: 2, date: "2024-11-23", type: "expense", category: "Labor", description: "Monthly wages", amount: 850000, farm: "All Farms" },
    { id: 3, date: "2024-11-22", type: "expense", category: "Fertilizer", description: "NPK 15-15-15 purchase", amount: 320000, farm: "Plantation Sikasso" },
    { id: 4, date: "2024-11-21", type: "income", category: "Cashew Sales", description: "Local market", amount: 1800000, farm: "Verger Niamey" },
    { id: 5, date: "2024-11-20", type: "expense", category: "Equipment", description: "Drip irrigation parts", amount: 450000, farm: "Ferme Ouaga" },
    { id: 6, date: "2024-11-19", type: "income", category: "Pineapple Sales", description: "Hotel supply contract", amount: 950000, farm: "Ferme Bobo" },
    { id: 7, date: "2024-11-18", type: "expense", category: "Transport", description: "Delivery to Ouagadougou", amount: 180000, farm: "Ferme Bobo" },
  ];

  const sales = [
    { id: 1, date: "2024-11-24", crop: "Mango", quantity: 2500, pricePerKg: 1000, total: 2500000, buyer: "Export Sahel SARL" },
    { id: 2, date: "2024-11-21", crop: "Cashew", quantity: 1200, pricePerKg: 1500, total: 1800000, buyer: "Marche Central Niamey" },
    { id: 3, date: "2024-11-19", crop: "Pineapple", quantity: 950, pricePerKg: 1000, total: 950000, buyer: "Hotel Sofitel" },
    { id: 4, date: "2024-11-15", crop: "Banana", quantity: 800, pricePerKg: 500, total: 400000, buyer: "Supermarche Marina" },
    { id: 5, date: "2024-11-12", crop: "Papaya", quantity: 600, pricePerKg: 750, total: 450000, buyer: "Restaurant La Terrasse" },
  ];

  const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("finance.title")}</h1>
          <p className="text-muted-foreground">Track income, expenses, and sales</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
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
                  <Select>
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
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Price per kg (XOF)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Buyer Name</Label>
                  <Input placeholder="Enter buyer name" />
                </div>
              </div>
              <DialogFooter>
                <Button>{t("common.save")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
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
                  <Select>
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
                  <Select>
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
                  <Input type="number" placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Enter details" />
                </div>
              </div>
              <DialogFooter>
                <Button>{t("common.save")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("finance.income")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)} XOF</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
              <span className="text-green-600">+15%</span>
              <span className="ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("finance.expenses")}</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)} XOF</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
              <span className="text-red-600">+8%</span>
              <span className="ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("finance.netProfit")}</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(netProfit)} XOF
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
              <span className="text-green-600">+22%</span>
              <span className="ml-1">vs last month</span>
            </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Farm</TableHead>
                    <TableHead className="text-right">Amount (XOF)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.date}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === "income" ? "success" : "destructive"}>
                          {tx.type === "income" ? t("finance.income") : t("finance.expenses")}
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.category}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>{tx.farm}</TableCell>
                      <TableCell className={`text-right font-medium ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                      <TableCell>{sale.date}</TableCell>
                      <TableCell className="font-medium">{sale.crop}</TableCell>
                      <TableCell>{formatCurrency(sale.quantity)}</TableCell>
                      <TableCell>{formatCurrency(sale.pricePerKg)}</TableCell>
                      <TableCell>{sale.buyer}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(sale.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
