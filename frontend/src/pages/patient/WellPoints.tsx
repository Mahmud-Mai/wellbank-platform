import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Star,
  Trophy,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Gift,
  Target,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { mockApi } from "@/lib/mock-api";
import { formatDate } from "@/lib/constants";

const tierColors: Record<string, string> = {
  bronze: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  silver: "bg-slate-400/10 text-slate-300 border-slate-400/20",
  gold: "bg-accent/10 text-accent border-accent/20",
  platinum: "bg-purple-400/10 text-purple-300 border-purple-400/20",
};

const tierOrder = ["bronze", "silver", "gold", "platinum"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const WellPointsPage = () => {
  const [txPage, setTxPage] = useState(1);

  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["wellpoints-balance"],
    queryFn: () => mockApi.wellpoints.getBalance(),
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["wellpoints-transactions", txPage],
    queryFn: () => mockApi.wellpoints.getTransactions({ page: txPage, perPage: 5 }),
  });

  const { data: rulesData } = useQuery({
    queryKey: ["wellpoints-rules"],
    queryFn: () => mockApi.wellpoints.getEarningRules(),
  });

  const { data: marketData } = useQuery({
    queryKey: ["wellpoints-marketplace"],
    queryFn: () => mockApi.wellpoints.getMarketplace(),
  });

  const balance = balanceData?.data;
  const transactions = txData?.data.transactions ?? [];
  const pagination = txData?.meta?.pagination;
  const rules = rulesData?.data.rules ?? [];
  const milestones = rulesData?.data.milestones ?? [];
  const rewards = marketData?.data.rewards ?? [];

  // Progress to next tier
  const currentTierIdx = balance ? tierOrder.indexOf(balance.tier) : 0;
  const nextMilestone = milestones.find((m) => tierOrder.indexOf(m.tier) > currentTierIdx);
  const progressPercent = balance && nextMilestone
    ? Math.min((balance.lifetimeEarned / nextMilestone.points) * 100, 100)
    : 100;

  return (
    <div className="space-y-6 p-4 pb-24 sm:p-6 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">WellPoints</h1>
        <p className="text-sm text-muted-foreground">Earn rewards for staying healthy</p>
      </div>

      {/* Balance Card */}
      {balanceLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : balance ? (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-accent/20 via-accent/10 to-background shadow-glow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground/70">Available Points</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">
                    {balance.balance.toLocaleString()}
                  </p>
                </div>
                <Star className="h-8 w-8 text-accent" />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Badge className={`capitalize ${tierColors[balance.tier] ?? ""}`}>
                  <Trophy className="mr-1 h-3 w-3" /> {balance.tier} Tier
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Lifetime: {balance.lifetimeEarned.toLocaleString()} pts
                </span>
              </div>

              {/* Progress to next tier */}
              {nextMilestone && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress to {nextMilestone.tier}</span>
                    <span>{balance.lifetimeEarned.toLocaleString()} / {nextMilestone.points.toLocaleString()}</span>
                  </div>
                  <Progress value={progressPercent} className="mt-1.5 h-2" />
                </div>
              )}

              {/* Expiring points */}
              {balance.expiringPoints > 0 && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
                  <Clock className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-xs text-destructive">
                    {balance.expiringPoints} points expiring {formatDate(balance.expiryDate)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      {/* How to Earn */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">How to Earn</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {rules.map((rule) => (
            <Card key={rule.activity} className="border-border">
              <CardContent className="flex flex-col items-center gap-1.5 p-3 text-center">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold text-accent">+{rule.points}</span>
                <span className="text-[11px] text-muted-foreground leading-tight">{rule.description}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Rewards Marketplace */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Rewards</h2>
        <div className="grid grid-cols-2 gap-3">
          {rewards.map((rw) => (
            <Card key={rw.id} className="border-border hover:border-accent/30 transition-all">
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <Gift className="h-6 w-6 text-accent" />
                <p className="text-sm font-medium text-foreground">{rw.name}</p>
                <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
                  {rw.pointsCost} pts
                </Badge>
                <p className="text-[10px] text-muted-foreground">{rw.stock} left</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Points History */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Points History</h2>
        {txLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Star className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No points activity yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-4">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      tx.type === "earn"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {tx.type === "earn" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === "earn" ? "text-primary" : "text-accent"
                    }`}
                  >
                    {tx.type === "earn" ? "+" : "-"}{tx.points}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={txPage <= 1} onClick={() => setTxPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {txPage} of {pagination.totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={txPage >= pagination.totalPages} onClick={() => setTxPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WellPointsPage;
