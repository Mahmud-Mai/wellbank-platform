import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Droplets,
  Shield,
  Heart,
  Pill,
  AlertTriangle,
  Edit2,
  Save,
  X,
  FileText,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { mockApi, USE_REAL_API, patientsApi } from "@/lib/auth-context";
import { formatDate, BLOOD_TYPES, GENOTYPES, GENDERS, REGIONS } from "@/lib/constants";
import type { PatientProfile as PatientProfileType } from "@/lib/types";

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(100),
  lastName: z.string().trim().min(1, "Required").max(100),
  dateOfBirth: z.string().min(1, "Required"),
  gender: z.string().min(1, "Required"),
  phoneNumber: z.string().trim().min(10).max(15),
  nationality: z.string().optional(),
  lga: z.string().optional(),
  bloodType: z.string().optional(),
  genotype: z.string().optional(),
  street: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().optional(),
  currentMedications: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  nextOfKinName: z.string().trim().optional(),
  nextOfKinPhone: z.string().trim().optional(),
  nextOfKinRelationship: z.string().trim().optional(),
  emergencyName: z.string().trim().optional(),
  emergencyPhone: z.string().trim().optional(),
  emergencyRelationship: z.string().trim().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

const PatientProfilePage = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const getPatientProfile = () => USE_REAL_API 
    ? patientsApi.getProfile() as Promise<{ data: PatientProfileType }>
    : mockApi.patients.getProfile() as Promise<{ data: PatientProfileType }>;

  const { data, isLoading } = useQuery({
    queryKey: ["patient-profile"],
    queryFn: getPatientProfile,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<PatientProfileType>) => 
      USE_REAL_API 
        ? patientsApi.updateProfile(data) as Promise<{ data: PatientProfileType }>
        : mockApi.patients.updateProfile(data) as Promise<{ data: PatientProfileType }>,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
      setEditing(false);
    },
  });

  const profile = data?.data;

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      firstName: profile.firstName,
      lastName: profile.lastName,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      phoneNumber: profile.phoneNumber,
      nationality: profile.nationality ?? "",
      lga: profile.lga ?? "",
      bloodType: profile.bloodType ?? "",
      genotype: profile.genotype ?? "",
      street: profile.address?.street ?? "",
      city: profile.address?.city ?? "",
      state: profile.address?.state ?? "",
      currentMedications: profile.currentMedications?.join(", ") ?? "",
      allergies: profile.allergies?.join(", ") ?? "",
      chronicConditions: profile.chronicConditions?.join(", ") ?? "",
      nextOfKinName: profile.nextOfKin?.name ?? "",
      nextOfKinPhone: profile.nextOfKin?.phoneNumber ?? "",
      nextOfKinRelationship: profile.nextOfKin?.relationship ?? "",
      emergencyName: profile.emergencyContacts?.[0]?.name ?? "",
      emergencyPhone: profile.emergencyContacts?.[0]?.phoneNumber ?? "",
      emergencyRelationship: profile.emergencyContacts?.[0]?.relationship ?? "",
    } : undefined,
  });

  const onSubmit = (data: ProfileForm) => {
    updateMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender as "male" | "female" | "other",
      phoneNumber: data.phoneNumber,
      nationality: data.nationality,
      lga: data.lga,
      bloodType: data.bloodType,
      genotype: data.genotype,
      currentMedications: data.currentMedications?.split(",").map((s) => s.trim()).filter(Boolean) ?? [],
      allergies: data.allergies?.split(",").map((s) => s.trim()).filter(Boolean) ?? [],
      chronicConditions: data.chronicConditions?.split(",").map((s) => s.trim()).filter(Boolean) ?? [],
      address: { street: data.street ?? "", city: data.city ?? "", state: data.state ?? "", country: "Nigeria" },
      nextOfKin: data.nextOfKinName ? { name: data.nextOfKinName, phoneNumber: data.nextOfKinPhone ?? "", relationship: data.nextOfKinRelationship ?? "" } : undefined,
      emergencyContacts: data.emergencyName ? [{ name: data.emergencyName, phoneNumber: data.emergencyPhone ?? "", relationship: data.emergencyRelationship ?? "" }] : [],
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 pb-24 sm:p-6 lg:pb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) return null;

  // View mode
  if (!editing) {
    return (
      <div className="space-y-6 p-4 pb-24 sm:p-6 lg:pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your personal information</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1">
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </Button>
        </div>

        {/* Identity Card */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <Card className="overflow-hidden border-0 gradient-primary shadow-glow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20 text-2xl font-bold text-primary-foreground">
                  {profile.firstName[0]}{profile.lastName[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary-foreground">{profile.firstName} {profile.lastName}</h2>
                  <p className="text-sm text-primary-foreground/70">{profile.email}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge className={`text-xs ${profile.isKycVerified ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive/20 text-destructive"}`}>
                      KYC Level {profile.kycLevel}
                    </Badge>
                    {profile.nationality && (
                      <span className="text-xs text-primary-foreground/60">{profile.nationality}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Info */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-0 sm:grid-cols-2">
              <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
              <InfoRow icon={User} label="Gender" value={profile.gender} />
              <InfoRow icon={Phone} label="Phone" value={profile.phoneNumber} />
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow icon={FileText} label="Nationality" value={profile.nationality} />
              <InfoRow icon={MapPin} label="LGA" value={profile.lga} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Address */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" /> Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                {[profile.address.street, profile.address.city, profile.address.state, profile.address.country].filter(Boolean).join(", ")}
              </p>
              {profile.address.postalCode && (
                <p className="text-xs text-muted-foreground mt-1">Postal Code: {profile.address.postalCode}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Health Info */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Heart className="h-4 w-4" /> Health Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-0 sm:grid-cols-2">
                <InfoRow icon={Droplets} label="Blood Type" value={profile.bloodType} />
                <InfoRow icon={Droplets} label="Genotype" value={profile.genotype} />
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Medications</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.currentMedications?.length ? profile.currentMedications.map((m) => (
                    <Badge key={m} variant="secondary" className="text-xs"><Pill className="mr-1 h-3 w-3" />{m}</Badge>
                  )) : <span className="text-sm text-muted-foreground">None</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Allergies</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.allergies?.length ? profile.allergies.map((a) => (
                    <Badge key={a} variant="outline" className="text-xs border-destructive/30 text-destructive"><AlertTriangle className="mr-1 h-3 w-3" />{a}</Badge>
                  )) : <span className="text-sm text-muted-foreground">None</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Chronic Conditions</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.chronicConditions?.length ? profile.chronicConditions.map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                  )) : <span className="text-sm text-muted-foreground">None</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next of Kin */}
        {profile.nextOfKin && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Users className="h-4 w-4" /> Next of Kin
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-0 sm:grid-cols-3">
                <InfoRow icon={User} label="Name" value={profile.nextOfKin.name} />
                <InfoRow icon={Phone} label="Phone" value={profile.nextOfKin.phoneNumber} />
                <InfoRow icon={Users} label="Relationship" value={profile.nextOfKin.relationship} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Emergency Contacts */}
        {profile.emergencyContacts?.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" /> Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.emergencyContacts.map((ec, i) => (
                  <div key={i} className="grid gap-0 sm:grid-cols-3">
                    <InfoRow icon={User} label="Name" value={ec.name} />
                    <InfoRow icon={Phone} label="Phone" value={ec.phoneNumber} />
                    <InfoRow icon={Users} label="Relationship" value={ec.relationship} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Insurance */}
        {profile.insurancePolicy && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Shield className="h-4 w-4" /> Insurance
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-0 sm:grid-cols-3">
                <InfoRow icon={Shield} label="Provider" value={profile.insurancePolicy.provider} />
                <InfoRow icon={FileText} label="Policy Number" value={profile.insurancePolicy.policyNumber} />
                <div className="flex items-center gap-2 py-2">
                  <Badge className={profile.insurancePolicy.isActive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}>
                    {profile.insurancePolicy.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-6 p-4 pb-24 sm:p-6 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
          <p className="text-sm text-muted-foreground">Update your personal information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="gap-1">
            <X className="h-3.5 w-3.5" /> Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input className="mt-1.5" {...register("firstName")} />
                {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div>
                <Label>Last Name</Label>
                <Input className="mt-1.5" {...register("lastName")} />
                {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date of Birth</Label>
                <Input type="date" className="mt-1.5" {...register("dateOfBirth")} />
              </div>
              <div>
                <Label>Gender</Label>
                <Select onValueChange={(v) => setValue("gender", v)} defaultValue={profile.gender}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => <SelectItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input className="mt-1.5" {...register("phoneNumber")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nationality</Label>
                <Input className="mt-1.5" {...register("nationality")} />
              </div>
              <div>
                <Label>LGA</Label>
                <Input className="mt-1.5" {...register("lga")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Address</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Street</Label>
              <Input className="mt-1.5" {...register("street")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input className="mt-1.5" {...register("city")} />
              </div>
              <div>
                <Label>State</Label>
                <Select onValueChange={(v) => setValue("state", v)} defaultValue={profile.address.state}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {REGIONS.NG.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Health Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Blood Type</Label>
                <Select onValueChange={(v) => setValue("bloodType", v)} defaultValue={profile.bloodType}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{BLOOD_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Genotype</Label>
                <Select onValueChange={(v) => setValue("genotype", v)} defaultValue={profile.genotype}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{GENOTYPES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Current Medications</Label>
              <Input className="mt-1.5" placeholder="Comma separated" {...register("currentMedications")} />
            </div>
            <div>
              <Label>Allergies</Label>
              <Input className="mt-1.5" placeholder="Comma separated" {...register("allergies")} />
            </div>
            <div>
              <Label>Chronic Conditions</Label>
              <Input className="mt-1.5" placeholder="Comma separated" {...register("chronicConditions")} />
            </div>
          </CardContent>
        </Card>

        {/* Next of Kin */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Next of Kin</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Name" {...register("nextOfKinName")} />
            <Input placeholder="Phone number" {...register("nextOfKinPhone")} />
            <Input placeholder="Relationship" {...register("nextOfKinRelationship")} />
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Emergency Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Name" {...register("emergencyName")} />
            <Input placeholder="Phone number" {...register("emergencyPhone")} />
            <Input placeholder="Relationship" {...register("emergencyRelationship")} />
          </CardContent>
        </Card>

        <Button type="submit" variant="hero" className="w-full gap-2" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
        </Button>
      </form>
    </div>
  );
};

export default PatientProfilePage;
