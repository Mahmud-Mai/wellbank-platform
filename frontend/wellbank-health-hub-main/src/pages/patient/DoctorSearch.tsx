import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  MapPin,
  Shield,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Stethoscope,
  Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockApi, USE_REAL_API, doctorsApi } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/constants";
import { SPECIALTIES } from "@/lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

const DoctorSearchPage = () => {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [maxFee, setMaxFee] = useState("all");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["doctors", search, specialty, maxFee, page],
    queryFn: () => {
      const params = {
        search: search || undefined,
        specialty: specialty !== "all" ? specialty : undefined,
        maxFee: maxFee !== "all" ? Number(maxFee) : undefined,
        page,
        limit: 6,
      };
      return USE_REAL_API 
        ? doctorsApi.search(params) 
        : mockApi.doctors.search(params);
    },
  });

  const doctors = (data as any)?.data?.doctors ?? [];
  const pagination = (data as any)?.meta?.pagination;

  return (
    <div className="space-y-6 p-4 pb-24 sm:p-6 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Find a Doctor</h1>
        <p className="text-sm text-muted-foreground">
          Search specialists and book consultations
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or specialty..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "border-primary text-primary" : ""}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-3"
        >
          <Select
            value={specialty}
            onValueChange={(v) => {
              setSpecialty(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {SPECIALTIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={maxFee}
            onValueChange={(v) => {
              setMaxFee(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Max Fee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Price</SelectItem>
              <SelectItem value="5000">Under ₦5,000</SelectItem>
              <SelectItem value="7500">Under ₦7,500</SelectItem>
              <SelectItem value="10000">Under ₦10,000</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Stethoscope className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No doctors found matching your criteria
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setSearch("");
                setSpecialty("all");
                setMaxFee("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial="hidden" animate="visible" className="space-y-3">
          {doctors.map((doc, i) => (
            <motion.div key={doc.id} variants={fadeUp} custom={i}>
              <Link to={`/doctors/${doc.id}`}>
                <Card className="transition-all hover:border-primary/30 hover:shadow-glow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                        {doc.firstName[0]}
                        {doc.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground">
                              Dr. {doc.firstName} {doc.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {doc.specialties.join(" · ")}
                            </p>
                          </div>
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {/* Rating */}
                          <span className="flex items-center gap-1 text-xs text-accent">
                            <Star className="h-3 w-3 fill-current" />
                            {doc.rating}
                            <span className="text-muted-foreground">
                              ({doc.reviewCount})
                            </span>
                          </span>
                          {/* Location */}
                          {doc.location && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {doc.location.city}
                            </span>
                          )}
                          {/* Insurance */}
                          {doc.acceptsInsurance && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-primary/20 text-primary"
                            >
                              <Shield className="mr-0.5 h-2.5 w-2.5" />{" "}
                              Insurance
                            </Badge>
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            {doc.languages.slice(0, 2).join(", ")}
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(doc.consultationFee)}
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

export default DoctorSearchPage;
