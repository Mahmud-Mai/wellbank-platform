import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Stethoscope,
  FlaskConical,
  Pill,
  Ambulance,
  Shield,
  Wallet,
  Star,
  Bell,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { mockApi } from "@/lib/mock-api";
import { formatCurrency, formatDate } from "@/lib/constants";
import type { WalletInfo, Consultation, Transaction, WellPointsBalance } from "@/lib/types";

const quickActions = [
  { icon: Stethoscope, label: "Book Doctor", href: "/doctors", color: "bg-primary/10 text-primary" },
  { icon: FlaskConical, label: "Lab Tests", href: "/labs", color: "bg-blue-500/10 text-blue-400" },
  { icon: Pill, label: "Pharmacy", href: "/pharmacy", color: "bg-purple-500/10 text-purple-400" },
  { icon: Ambulance, label: "Emergency", href: "/emergency", color: "bg-destructive/10 text-destructive", emergency: true },
  { icon: Shield, label: "Insurance", href: "/insurance", color: "bg-accent/10 text-accent" },
  { icon: Star, label: "WellPoints", href: "/wellpoints", color: "bg-accent/10 text-accent" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const Dashboard = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wellpoints, setWellpoints] = useState<WellPointsBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [w, c, t, wp] = await Promise.all([
        mockApi.wallet.get(),
        mockApi.consultations.list(),
        mockApi.wallet.getTransactions(),
        mockApi.wellpoints.getBalance(),
      ]);
      setWallet(w.data);
      setConsultations(c.data.consultations);
      setTransactions(t.data.transactions);
      setWellpoints(wp.data);
      setLoading(false);
    };
    load();
  }, []);

  const upcomingConsultations = consultations.filter(
    (c) => c.status === "scheduled"
  );

  return (
    <div className="space-y-6 p-4 pb-24 sm:p-6 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hello, {user?.firstName || "there"} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            How are you feeling today?
          </p>
        </div>
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link to="/notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              2
            </span>
          </Link>
        </Button>
      </div>

      {/* Wallet Card */}
      {loading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <Card className="overflow-hidden border-0 gradient-primary shadow-glow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-primary-foreground/70">Wallet Balance</p>
                  <p className="mt-1 text-3xl font-bold text-primary-foreground">
                    {formatCurrency(wallet?.balance ?? 0)}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-primary-foreground/40" />
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  size="sm"
                  className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Fund
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  History
                </Button>
              </div>
              {wellpoints && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-3 py-2">
                  <Star className="h-4 w-4 text-accent" />
                  <span className="text-sm text-primary-foreground/90">
                    {wellpoints.balance.toLocaleString()} WellPoints
                  </span>
                  <span className="ml-auto rounded bg-accent/20 px-2 py-0.5 text-xs font-medium capitalize text-accent">
                    {wellpoints.tier}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions - Bento Grid */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:shadow-glow ${
                action.emergency
                  ? "animate-pulse-glow border-destructive/30 bg-destructive/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Upcoming Appointments */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Upcoming Appointments</h2>
          <Link to="/consultations" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : upcomingConsultations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Calendar className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No upcoming appointments</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to="/doctors">Book a Doctor</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingConsultations.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{c.doctorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(c.scheduledAt)} · {c.type === "telehealth" ? "Video" : "In-person"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{formatCurrency(c.fee)}</p>
                    <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">
                      {c.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Transactions */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Recent Activity</h2>
          <Link to="/wallet" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
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
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === "credit" ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Health Tip */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Health Tip</p>
              <p className="text-xs text-muted-foreground">
                Stay hydrated! Drink at least 8 glasses of water daily for optimal health.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
