import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bell,
  BellOff,
  Calendar,
  FlaskConical,
  Star,
  CreditCard,
  Pill,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";

const typeIcons: Record<string, typeof Bell> = {
  appointment_reminder: Calendar,
  lab_result: FlaskConical,
  wellpoints: Star,
  payment: CreditCard,
  prescription: Pill,
  medication_reminder: Pill,
};

const priorityDot: Record<string, string> = {
  high: "bg-destructive",
  normal: "bg-primary",
  low: "bg-muted-foreground",
};

function groupByDate(
  notifications: { createdAt: string; [key: string]: any }[],
) {
  const groups: Record<string, typeof notifications> = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const n of notifications) {
    const d = new Date(n.createdAt).toDateString();
    const label =
      d === today
        ? "Today"
        : d === yesterday
          ? "Yesterday"
          : new Date(n.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }
  return groups;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => apiService.notifications.list({ page, perPage: 10 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiService.notifications.markRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => apiService.notifications.markAllRead(),
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = data?.data.notifications ?? [];
  const unreadCount = data?.data.meta?.unreadCount ?? 0;
  const pagination = data?.data.meta?.pagination;
  const grouped = groupByDate(notifications);

  return (
    <div className="space-y-6 p-4 pb-24 sm:p-6 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="gap-1 text-xs"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <BellOff className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No notifications yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial="hidden" animate="visible" className="space-y-5">
          {Object.entries(grouped).map(([date, items], groupIdx) => (
            <div key={date}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {date}
              </h3>
              <div className="space-y-2">
                {items.map((n, i) => {
                  const Icon = typeIcons[n.type] ?? Bell;
                  return (
                    <motion.div
                      key={n.id}
                      variants={fadeUp}
                      custom={groupIdx * 3 + i}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:border-primary/30 ${
                          !n.isRead ? "border-primary/20 bg-primary/[0.03]" : ""
                        }`}
                        onClick={() => {
                          if (!n.isRead) markReadMutation.mutate(n.id);
                        }}
                      >
                        <CardContent className="flex items-start gap-3 p-4">
                          <div className="relative mt-0.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                              <Icon className="h-4 w-4" />
                            </div>
                            {!n.isRead && (
                              <span
                                className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ${priorityDot[n.priority] ?? priorityDot.normal}`}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${!n.isRead ? "font-semibold" : "font-medium"} text-foreground`}
                            >
                              {n.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                              {n.message}
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground/60">
                              {new Date(n.createdAt).toLocaleTimeString(
                                "en-NG",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
    </div>
  );
};

export default NotificationsPage;
