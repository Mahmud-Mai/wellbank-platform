import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Wallet as WalletIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Building2,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { mockApi } from "@/lib/mock-api";
import { formatCurrency, formatDate } from "@/lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const WalletPage = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [fundAmount, setFundAmount] = useState("");
  const [fundMethod, setFundMethod] = useState("card");
  const [fundOpen, setFundOpen] = useState(false);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => mockApi.wallet.get(),
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["transactions", filter, page],
    queryFn: () => mockApi.wallet.getTransactions({ type: filter, page, perPage: 5 }),
  });

  const fundMutation = useMutation({
    mutationFn: () => mockApi.wallet.fund(Number(fundAmount), fundMethod),
    onSuccess: () => {
      toast.success("Funding initiated! Redirecting to payment gateway...");
      setFundOpen(false);
      setFundAmount("");
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });

  const transactions = txData?.data.transactions ?? [];
  const pagination = txData?.meta?.pagination;

  return (
    <div className="space-y-6 p-4 pb-24 sm:p-6 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
          <p className="text-sm text-muted-foreground">Manage your funds</p>
        </div>
      </div>

      {/* Balance Card */}
      {walletLoading ? (
        <Skeleton className="h-44 w-full rounded-xl" />
      ) : (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <Card className="overflow-hidden border-0 gradient-primary shadow-glow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-primary-foreground/70">Available Balance</p>
                  <p className="mt-1 text-3xl font-bold text-primary-foreground">
                    {formatCurrency(wallet?.data.balance ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-primary-foreground/50">
                    Currency: {wallet?.data.currency}
                  </p>
                </div>
                <WalletIcon className="h-8 w-8 text-primary-foreground/40" />
              </div>
              <div className="mt-6 flex gap-3">
                <Dialog open={fundOpen} onOpenChange={setFundOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Fund Wallet
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Fund Wallet</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Amount (₦)</label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Payment Method</label>
                        <Select value={fundMethod} onValueChange={setFundMethod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">
                              <span className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Debit Card</span>
                            </SelectItem>
                            <SelectItem value="bank_transfer">
                              <span className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Bank Transfer</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        {[5000, 10000, 25000, 50000].map((amt) => (
                          <Button
                            key={amt}
                            variant="outline"
                            size="sm"
                            onClick={() => setFundAmount(String(amt))}
                            className="flex-1 text-xs"
                          >
                            {formatCurrency(amt)}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button
                        onClick={() => fundMutation.mutate()}
                        disabled={!fundAmount || Number(fundAmount) <= 0 || fundMutation.isPending}
                      >
                        {fundMutation.isPending ? "Processing..." : "Proceed"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Transaction History */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Transaction History</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {txLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <WalletIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No transactions found</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-4">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      tx.type === "credit"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {tx.type === "credit" ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        tx.type === "credit" ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{tx.reference}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WalletPage;
