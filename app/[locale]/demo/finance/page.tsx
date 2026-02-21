"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  demoTransactions,
  demoSales,
  calculateTransactionTotals,
  calculateSalesTotals,
} from "@/lib/demo-data";
import { useCurrency } from "@/contexts/currency-context";

export default function DemoFinancePage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("transactions");

  const { formatAmount } = useCurrency();
  const txTotals = calculateTransactionTotals(demoTransactions);
  const saleTotals = calculateSalesTotals(demoSales);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            {t("finance.title")}
          </h1>
          <p className="text-muted-foreground">{t("finance.subtitle")}</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Demo Banner */}
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          This is a demo page with sample data. Sign in to manage your real
          finances.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(txTotals.income)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatAmount(txTotals.expense)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-600" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatAmount(txTotals.balance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(saleTotals.totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="transactions">
            {t("finance.transactions")}
          </TabsTrigger>
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
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{formatDate(tx.transactionDate)}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.type === "income" ? "default" : "destructive"
                          }
                        >
                          {tx.type === "income" ? "Income" : "Expense"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatAmount(parseFloat(tx.amount))}
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
                    <TableHead>Buyer</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{formatDate(sale.saleDate)}</TableCell>
                      <TableCell className="capitalize">
                        {sale.cropType}
                      </TableCell>
                      <TableCell>{sale.buyerName}</TableCell>
                      <TableCell>
                        {parseFloat(sale.quantityKg).toLocaleString()} kg
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatAmount(parseFloat(sale.totalAmount))}
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
