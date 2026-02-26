import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Search,
  Video,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiService } from "@/lib/api-service";
import { formatCurrency, formatDate } from "@/lib/constants";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  in_progress: "bg-accent/10 text-accent border-accent/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const ConsultationsPage = () => {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["consultations", tab, search, page],
    queryFn: () =>
      apiService.consultations.list({
        status: tab,
        search,
        page,
        perPage: 5,
      }),
  });

  const consultations = data?.data.consultations ?? [];
  const pagination = data?.meta?.pagination;

  return (
    <div className="space-y-6 p-4 pb-24 sm:p-6 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Consultations</h1>
        <p className="text-sm text-muted-foreground">
          Your appointments and consultations
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by doctor name..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          setPage(1);
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex-1">
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Completed
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-1">
            Cancelled
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : consultations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Calendar className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No consultations found
            </p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link to="/doctors">Book a Doctor</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial="hidden" animate="visible" className="space-y-3">
          {consultations.map((c, i) => (
            <motion.div key={c.id} variants={fadeUp} custom={i}>
              <Link to={`/consultations/${c.id}`}>
                <Card className="transition-all hover:border-primary/30 hover:shadow-glow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-foreground">
                              {c.doctorName}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              {c.type === "telehealth" ? (
                                <Video className="h-3 w-3" />
                              ) : (
                                <MapPin className="h-3 w-3" />
                              )}
                              <span>
                                {c.type === "telehealth"
                                  ? "Video"
                                  : "In-person"}
                              </span>
                              <span>·</span>
                              <span>{formatDate(c.scheduledAt)}</span>
                            </div>
                            {c.reason && (
                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {c.reason}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge
                            className={`text-[10px] ${statusColors[c.status] ?? ""}`}
                          >
                            {c.status}
                          </Badge>
                          <span className="text-sm font-medium text-foreground">
                            {formatCurrency(c.fee)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
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

export default ConsultationsPage;
