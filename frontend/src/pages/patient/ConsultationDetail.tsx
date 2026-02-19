import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Stethoscope,
  Video,
  MapPin,
  Calendar,
  Clock,
  XCircle,
  Pill,
  FlaskConical,
  FileText,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { mockApi } from "@/lib/mock-api";
import { formatCurrency, formatDate } from "@/lib/constants";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  in_progress: "bg-accent/10 text-accent border-accent/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const ConsultationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["consultation", id],
    queryFn: () => mockApi.consultations.getById(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => mockApi.consultations.cancel(id!),
    onSuccess: (res) => {
      toast.success(`Cancelled. Refund: ${formatCurrency(res.data.refundAmount)}, Fee: ${formatCurrency(res.data.cancellationFee)}`);
      queryClient.invalidateQueries({ queryKey: ["consultation", id] });
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
  });

  const handleJoinVideo = async () => {
    toast.info("Connecting to video session...");
    await mockApi.consultations.startVideo(id!);
    toast.success("Video session ready! (Placeholder)");
  };

  const consultation = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 pb-24 sm:p-6 lg:pb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Stethoscope className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Consultation not found</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/consultations")}>
          Back to Consultations
        </Button>
      </div>
    );
  }

  const canJoinVideo = consultation.type === "telehealth" && ["scheduled", "confirmed"].includes(consultation.status);
  const canCancel = ["scheduled", "confirmed"].includes(consultation.status);

  return (
    <div className="space-y-6 p-4 pb-24 sm:p-6 lg:pb-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/consultations")} className="gap-1 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Doctor Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">{consultation.doctorName}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {consultation.type === "telehealth" ? (
                    <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" /> Video Call</span>
                  ) : (
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> In-person</span>
                  )}
                </div>
                <Badge className={`mt-2 ${statusColors[consultation.status] ?? ""}`}>
                  {consultation.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appointment Details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{formatDate(consultation.scheduledAt)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {new Date(consultation.scheduledAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {consultation.reason && (
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{consultation.reason}</span>
              </div>
            )}
            {consultation.symptoms && consultation.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {consultation.symptoms.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs capitalize">{s}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Diagnosis & Notes (completed only) */}
      {consultation.diagnosis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Diagnosis & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-medium text-foreground">{consultation.diagnosis}</p>
              {consultation.notes && (
                <p className="text-sm text-muted-foreground">{consultation.notes}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Prescriptions */}
      {consultation.prescriptions && consultation.prescriptions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Pill className="h-4 w-4" /> Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {consultation.prescriptions.map((rx) => (
                <div key={rx.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium text-foreground">{rx.medicationName}</p>
                  <p className="text-xs text-muted-foreground">
                    {rx.dosage} · {rx.frequency} · {rx.duration}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Lab Orders */}
      {consultation.labOrders && consultation.labOrders.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FlaskConical className="h-4 w-4" /> Lab Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {consultation.labOrders.map((lo) => (
                <div key={lo.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <p className="text-sm text-foreground">{lo.testName}</p>
                  <Badge variant="outline" className="text-xs capitalize">{lo.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Payment Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CreditCard className="h-4 w-4" /> Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Consultation Fee</span>
              <span className="font-medium text-foreground">{formatCurrency(consultation.fee)}</span>
            </div>
            {consultation.insuranceCoverage != null && consultation.insuranceCoverage > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Insurance Coverage</span>
                  <span className="font-medium text-primary">-{formatCurrency(consultation.insuranceCoverage)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">You Paid</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(consultation.patientResponsibility ?? consultation.fee)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="flex gap-3">
        {canJoinVideo && (
          <Button className="flex-1 gap-2" onClick={handleJoinVideo}>
            <Video className="h-4 w-4" /> Join Video Session
          </Button>
        )}
        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                <XCircle className="h-4 w-4" /> Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                <AlertDialogDescription>
                  A cancellation fee may apply. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => cancelMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </motion.div>
    </div>
  );
};

export default ConsultationDetail;
