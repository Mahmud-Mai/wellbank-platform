import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ArrowRight, ArrowLeft, Check, Loader2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAuth, mockApi, USE_REAL_API, doctorsApi } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import StepIndicator from "@/components/onboarding/StepIndicator";
import MultiInput from "@/components/onboarding/MultiInput";
import FileUpload from "@/components/onboarding/FileUpload";
import { NIGERIAN_STATES, STATE_LGAS, SPECIALTIES, GENDERS, NIGERIAN_BANKS, ID_TYPES } from "@/lib/constants";

const steps = [
  { number: 1, title: "Personal" },
  { number: 2, title: "Professional" },
  { number: 3, title: "Certifications" },
  { number: 4, title: "Identity" },
  { number: 5, title: "Banking" },
];

const personalSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(100),
  lastName: z.string().trim().min(1, "Required").max(100),
  phoneNumber: z.string().trim().min(10, "Required").max(15),
  email: z.string().trim().email("Invalid email").max(255),
  gender: z.enum(["male", "female", "other"], { required_error: "Required" }),
  street: z.string().trim().min(1, "Required").max(200),
  city: z.string().trim().min(1, "Required").max(100),
  state: z.string().min(1, "Required"),
  lga: z.string().optional(),
});

const professionalSchema = z.object({
  specialty: z.string().min(1, "Required"),
  subSpecialty: z.string().optional(),
  yearsExperience: z.coerce.number().min(0).max(60),
  consultationFee: z.coerce.number().min(0),
  bio: z.string().trim().min(10, "At least 10 characters").max(1000),
});

const certSchema = z.object({
  mdcnLicenseNumber: z.string().trim().min(1, "Required").max(50),
});

const idSchema = z.object({
  governmentIdType: z.string().min(1, "Required"),
});

const bankSchema = z.object({
  bankName: z.string().min(1, "Required"),
  accountName: z.string().trim().min(1, "Required").max(100),
  accountNumber: z.string().trim().length(10, "Must be 10 digits"),
  bvn: z.string().trim().length(11, "Must be 11 digits"),
});

export default function DoctorOnboarding() {
  const [searchParams] = useSearchParams();
  const isAddingRole = searchParams.get("addingRole") === "true";
  const initialStep = isAddingRole ? 2 : 1; // Skip personal info when adding role
  const [step, setStep] = useState(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consultationTypes, setConsultationTypes] = useState<string[]>([]);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [practicingLicenseExpiry, setPracticingLicenseExpiry] = useState<Date | undefined>();
  const [hospitalAffiliations, setHospitalAffiliations] = useState<string[]>([]);
  // File uploads
  const [mbbsCert, setMbbsCert] = useState<File | null>(null);
  const [mdcnLicense, setMdcnLicense] = useState<File | null>(null);
  const [practicingLicense, setPracticingLicense] = useState<File | null>(null);
  const [nyscCert, setNyscCert] = useState<File | null>(null);
  const [indemnity, setIndemnity] = useState<File | null>(null);
  const [otherCerts, setOtherCerts] = useState<File | null>(null);
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);

  const navigate = useNavigate();
  const { user, switchRole } = useAuth();
  const { toast } = useToast();

  const personalForm = useForm({ resolver: zodResolver(personalSchema), defaultValues: {
    firstName: user?.firstName || "", lastName: user?.lastName || "",
    phoneNumber: "", email: user?.email || "", gender: undefined as any,
    street: "", city: "", state: "", lga: "",
  }});

  const profForm = useForm({ resolver: zodResolver(professionalSchema), defaultValues: {
    specialty: "", subSpecialty: "", yearsExperience: 0, consultationFee: 0, bio: "",
  }});

  const certForm = useForm({ resolver: zodResolver(certSchema), defaultValues: {
    mdcnLicenseNumber: "",
  }});

  const idForm = useForm({ resolver: zodResolver(idSchema), defaultValues: { governmentIdType: "" }});
  const bankForm = useForm({ resolver: zodResolver(bankSchema), defaultValues: {
    bankName: "", accountName: "", accountNumber: "", bvn: "",
  }});

  const watchState = personalForm.watch("state");

  const goNext = async () => {
    let valid = false;
    if (step === 1) valid = await personalForm.trigger();
    else if (step === 2) valid = await profForm.trigger();
    else if (step === 3) valid = await certForm.trigger();
    else if (step === 4) valid = await idForm.trigger();
    else valid = true;
    if (valid) setStep((s) => Math.min(s + 1, 5));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, isAddingRole ? 2 : 1));

  const handleSubmit = async () => {
    const bankValid = await bankForm.trigger();
    if (!bankValid) return;
    setIsSubmitting(true);
    try {
      const p = personalForm.getValues();
      const pr = profForm.getValues();
      const c = certForm.getValues();
      const id = idForm.getValues();
      const b = bankForm.getValues();

      const doctorData = {
        firstName: p.firstName, lastName: p.lastName, phoneNumber: p.phoneNumber, email: p.email,
        dateOfBirth: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : "", gender: p.gender,
        address: { street: p.street, city: p.city, state: p.state, lga: p.lga, country: "Nigeria" },
        specialty: pr.specialty, subSpecialty: pr.subSpecialty, yearsExperience: pr.yearsExperience,
        consultationTypes, hospitalAffiliations, consultationFee: pr.consultationFee, bio: pr.bio,
        mdcnLicenseNumber: c.mdcnLicenseNumber, practicingLicenseExpiry: practicingLicenseExpiry ? format(practicingLicenseExpiry, "yyyy-MM-dd") : "",
        bankName: b.bankName, accountName: b.accountName, accountNumber: b.accountNumber, bvn: b.bvn,
        governmentIdNumber: id.governmentIdNumber,
      };

      if (USE_REAL_API) {
        await doctorsApi.completeProfile(doctorData);
      } else {
        await mockApi.doctors.completeProfile(doctorData);
      }

      toast({ title: "Profile Submitted! ✅", description: "Your profile is under review." });
      if (isAddingRole) {
        await switchRole("doctor");
      }
      navigate("/dashboard");
    } catch {
      toast({ title: "Submission failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleConsultationType = (type: string) => {
    setConsultationTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold text-foreground">{isAddingRole ? "Doctor Profile Setup" : "Doctor Onboarding"}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{isAddingRole ? "Set up your doctor profile to start accepting patients" : "Complete your professional profile to start accepting patients"}</p>

        <StepIndicator steps={steps} currentStep={step} />

        {/* Step 1: Personal */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Personal Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First Name</Label><Input className="mt-1" {...personalForm.register("firstName")} /></div>
              <div><Label>Last Name</Label><Input className="mt-1" {...personalForm.register("lastName")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input className="mt-1" placeholder="+234..." {...personalForm.register("phoneNumber")} /></div>
              <div><Label>Email</Label><Input className="mt-1" type="email" {...personalForm.register("email")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("mt-1 w-full justify-start text-left font-normal", !dateOfBirth && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />{dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateOfBirth} onSelect={setDateOfBirth} disabled={(d: Date) => d > new Date() || d < new Date("1920-01-01")} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Gender</Label>
                <Controller control={personalForm.control} name="gender" render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="mt-2 flex gap-4">
                    {GENDERS.map((g) => (
                      <div key={g} className="flex items-center gap-1.5">
                        <RadioGroupItem value={g} id={`dg-${g}`} />
                        <Label htmlFor={`dg-${g}`} className="capitalize cursor-pointer">{g}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )} />
              </div>
            </div>
            <div><Label>Street</Label><Input className="mt-1" {...personalForm.register("street")} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>City</Label><Input className="mt-1" {...personalForm.register("city")} /></div>
              <div>
                <Label>State</Label>
                <Controller control={personalForm.control} name="state" render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => { field.onChange(v); personalForm.setValue("lga", ""); }}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{NIGERIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <div>
              <Label>LGA</Label>
              <Controller control={personalForm.control} name="lga" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!watchState || !STATE_LGAS[watchState]}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select LGA" /></SelectTrigger>
                  <SelectContent>{(STATE_LGAS[watchState] || []).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
          </div>
        )}

        {/* Step 2: Professional */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Professional Information</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Specialty</Label>
                <Controller control={profForm.control} name="specialty" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{SPECIALTIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {profForm.formState.errors.specialty && <p className="mt-1 text-xs text-destructive">{profForm.formState.errors.specialty.message}</p>}
              </div>
              <div><Label>Sub-specialty <span className="text-xs text-muted-foreground">(optional)</span></Label><Input className="mt-1" {...profForm.register("subSpecialty")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Years of Experience</Label><Input type="number" className="mt-1" {...profForm.register("yearsExperience")} /></div>
              <div><Label>Consultation Fee (₦)</Label><Input type="number" className="mt-1" {...profForm.register("consultationFee")} /></div>
            </div>
            <div>
              <Label>Consultation Types</Label>
              <div className="mt-2 flex gap-4">
                {["Virtual", "Physical"].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Checkbox checked={consultationTypes.includes(t)} onCheckedChange={() => toggleConsultationType(t)} id={`ct-${t}`} />
                    <Label htmlFor={`ct-${t}`} className="cursor-pointer">{t}</Label>
                  </div>
                ))}
              </div>
            </div>
            <MultiInput label="Hospital Affiliations" values={hospitalAffiliations} onChange={setHospitalAffiliations} placeholder="e.g. Lagos University Teaching Hospital" />
            <div>
              <Label>Bio</Label>
              <Textarea className="mt-1" rows={4} placeholder="Tell patients about your experience and approach..." {...profForm.register("bio")} />
              {profForm.formState.errors.bio && <p className="mt-1 text-xs text-destructive">{profForm.formState.errors.bio.message}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Certifications */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Certifications & Documents</h2>
            <p className="text-sm text-muted-foreground">Upload your professional documents (PDF/JPG)</p>
            <FileUpload label="MBBS Certificate" value={mbbsCert} onChange={setMbbsCert} required />
            <FileUpload label="MDCN License" value={mdcnLicense} onChange={setMdcnLicense} required description="Medical and Dental Council of Nigeria" />
            <div>
              <Label>MDCN License Number</Label>
              <Input className="mt-1" placeholder="e.g. MDCN-001234" {...certForm.register("mdcnLicenseNumber")} />
              {certForm.formState.errors.mdcnLicenseNumber && <p className="mt-1 text-xs text-destructive">{certForm.formState.errors.mdcnLicenseNumber.message}</p>}
            </div>
            <FileUpload label="Annual Practicing License" value={practicingLicense} onChange={setPracticingLicense} required />
            <div>
              <Label>Practicing License Expiry</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("mt-1 w-full justify-start text-left font-normal", !practicingLicenseExpiry && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />{practicingLicenseExpiry ? format(practicingLicenseExpiry, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={practicingLicenseExpiry} onSelect={setPracticingLicenseExpiry} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <FileUpload label="NYSC Certificate / Exemption" value={nyscCert} onChange={setNyscCert} required />
            <FileUpload label="Medical Indemnity Insurance" value={indemnity} onChange={setIndemnity} description="Optional" />
            <FileUpload label="Other Certificates" value={otherCerts} onChange={setOtherCerts} description="Optional additional certificates" />
          </div>
        )}

        {/* Step 4: Identity */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Identity Verification</h2>
            <div>
              <Label>Government ID Type</Label>
              <Controller control={idForm.control} name="governmentIdType" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select ID type" /></SelectTrigger>
                  <SelectContent>{ID_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {idForm.formState.errors.governmentIdType && <p className="mt-1 text-xs text-destructive">{idForm.formState.errors.governmentIdType.message}</p>}
            </div>
            <FileUpload label="Government ID Photo" value={idPhoto} onChange={setIdPhoto} required />
            <FileUpload label="Selfie Photo" value={selfiePhoto} onChange={setSelfiePhoto} required description="Clear selfie for identity verification" />
          </div>
        )}

        {/* Step 5: Banking */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Banking Details</h2>
            <p className="text-sm text-muted-foreground">For consultation fee settlement</p>
            <div>
              <Label>Bank Name</Label>
              <Controller control={bankForm.control} name="bankName" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select bank" /></SelectTrigger>
                  <SelectContent>{NIGERIAN_BANKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {bankForm.formState.errors.bankName && <p className="mt-1 text-xs text-destructive">{bankForm.formState.errors.bankName.message}</p>}
            </div>
            <div>
              <Label>Account Name</Label>
              <Input className="mt-1" placeholder="As shown on bank statement" {...bankForm.register("accountName")} />
              {bankForm.formState.errors.accountName && <p className="mt-1 text-xs text-destructive">{bankForm.formState.errors.accountName.message}</p>}
            </div>
            <div>
              <Label>Account Number</Label>
              <Input className="mt-1" placeholder="10 digits" maxLength={10} {...bankForm.register("accountNumber")} />
              {bankForm.formState.errors.accountNumber && <p className="mt-1 text-xs text-destructive">{bankForm.formState.errors.accountNumber.message}</p>}
            </div>
            <div>
              <Label>BVN</Label>
              <Input className="mt-1" placeholder="11 digits" maxLength={11} {...bankForm.register("bvn")} />
              {bankForm.formState.errors.bvn && <p className="mt-1 text-xs text-destructive">{bankForm.formState.errors.bvn.message}</p>}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={goBack} className="flex-1">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          )}
          {step < 5 ? (
            <Button type="button" onClick={goNext} className="flex-1 gradient-primary text-primary-foreground hover:opacity-90">
              Next <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 gradient-primary text-primary-foreground hover:opacity-90">
              {isSubmitting ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Submitting...</> : <>Submit Profile <Check className="ml-1 h-4 w-4" /></>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
