import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  MapPin,
  Shield,
  Clock,
  Globe,
  GraduationCap,
  Video,
  Building2,
  Calendar,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";
import { formatCurrency } from "@/lib/constants";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const bookingSchema = z.object({
  type: z.enum(["telehealth", "in_person"]),
  scheduledAt: z.string().min(1, "Select a date and time"),
  reason: z.string().min(1, "Provide a reason").max(500),
  symptoms: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

const DoctorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [bookOpen, setBookOpen] = useState(false);
  const [useInsurance, setUseInsurance] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => apiService.doctors.getById(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      type: "telehealth",
      scheduledAt: "",
      reason: "",
      symptoms: "",
    },
  });

  const bookMutation = useMutation({
    mutationFn: (data: BookingForm) =>
      apiService.bookConsultation({
        doctorId: id!,
        type: data.type,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        reason: data.reason,
        symptoms: data.symptoms
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        useInsurance,
      }),
    onSuccess: (res) => {
      toast.success(
        `Consultation booked! Fee: ${formatCurrency(res.data.fee)}`,
      );
      setBookOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
  });

  const doctor = (data as any)?.data;

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 pb-24 sm:p-6 lg:pb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Stethoscope className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Doctor not found</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => navigate("/doctors")}
        >
          Back to Search
        </Button>
      </div>
    );
  }

  const consultType = watch("type");

  return (
    <div className="space-y-6 p-4 pb-24 sm:p-6 lg:pb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/doctors")}
        className="gap-1 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Doctor Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-0 gradient-primary shadow-glow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 text-xl font-bold text-primary-foreground">
                {doctor.firstName[0]}
                {doctor.lastName[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-primary-foreground">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h2>
                <p className="text-sm text-primary-foreground/70">
                  {doctor.specialties.join(" · ")}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1 text-sm text-primary-foreground/90">
                    <Star className="h-3.5 w-3.5 fill-current text-accent" />
                    {doctor.rating} ({doctor.reviewCount} reviews)
                  </span>
                  {doctor.location && (
                    <span className="flex items-center gap-1 text-sm text-primary-foreground/70">
                      <MapPin className="h-3.5 w-3.5" />
                      {doctor.location.city}, {doctor.location.state}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {formatCurrency(doctor.consultationFee)}
                  </span>
                  <span className="text-xs text-primary-foreground/50">
                    per consultation
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bio */}
      {doctor.bio && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">
                {doctor.bio}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Details Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center gap-1.5 p-4 text-center">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-foreground">
                {doctor.yearsExperience}
              </span>
              <span className="text-xs text-muted-foreground">
                Years Experience
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-1.5 p-4 text-center">
              <Globe className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-foreground">
                {doctor.languages.join(", ")}
              </span>
              <span className="text-xs text-muted-foreground">Languages</span>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex flex-wrap gap-2">
          {doctor.acceptsInsurance && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Shield className="mr-1 h-3 w-3" /> Accepts Insurance
            </Badge>
          )}
          {doctor.licenseNumber && (
            <Badge variant="outline" className="text-xs">
              MDCN: {doctor.mdcnLicenseNumber || doctor.licenseNumber}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Qualifications */}
      {doctor.qualifications && doctor.qualifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <GraduationCap className="h-4 w-4" /> Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {doctor.qualifications.map((q, i) => (
                <div key={i} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium text-foreground">
                    {q.degree}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {q.institution} · {q.year}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Availability */}
      {doctor.availability && doctor.availability.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" /> Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {doctor.availability
                  .filter((a) => a.isAvailable)
                  .map((slot) => (
                    <div
                      key={slot.dayOfWeek}
                      className="rounded-lg border border-border bg-muted/30 p-2.5 text-center"
                    >
                      <p className="text-xs font-medium text-foreground">
                        {dayNames[slot.dayOfWeek]}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {slot.startTime} – {slot.endTime}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Book CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        <Button
          className="w-full gap-2 h-12 text-base"
          onClick={() => setBookOpen(true)}
        >
          <Calendar className="h-5 w-5" /> Book Consultation
        </Button>
      </motion.div>

      {/* Booking Dialog */}
      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Book with Dr. {doctor.firstName} {doctor.lastName}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((data) => bookMutation.mutate(data))}
            className="space-y-4 py-2"
          >
            {/* Type */}
            <div>
              <Label>Consultation Type</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={consultType === "telehealth" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setValue("type", "telehealth")}
                >
                  <Video className="h-4 w-4" /> Video Call
                </Button>
                <Button
                  type="button"
                  variant={consultType === "in_person" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setValue("type", "in_person")}
                >
                  <Building2 className="h-4 w-4" /> In-Person
                </Button>
              </div>
            </div>

            {/* Date/Time */}
            <div>
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                className="mt-1.5"
                min={new Date().toISOString().slice(0, 16)}
                {...register("scheduledAt")}
              />
              {errors.scheduledAt && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.scheduledAt.message}
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <Label>Reason for Visit</Label>
              <Textarea
                className="mt-1.5"
                placeholder="Describe your concern..."
                rows={2}
                {...register("reason")}
              />
              {errors.reason && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.reason.message}
                </p>
              )}
            </div>

            {/* Symptoms */}
            <div>
              <Label>Symptoms (optional, comma-separated)</Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. headache, fever"
                {...register("symptoms")}
              />
            </div>

            {/* Insurance toggle */}
            {doctor.acceptsInsurance && (
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground">Use Insurance</span>
                </div>
                <Switch
                  checked={useInsurance}
                  onCheckedChange={setUseInsurance}
                />
              </div>
            )}

            <Separator />

            {/* Fee summary */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Consultation Fee
              </span>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(doctor.consultationFee)}
              </span>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={bookMutation.isPending}>
                {bookMutation.isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorProfilePage;
