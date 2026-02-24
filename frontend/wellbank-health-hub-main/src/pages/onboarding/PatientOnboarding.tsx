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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { mockApi } from "@/lib/mock-api";
import { cn } from "@/lib/utils";
import StepIndicator from "@/components/onboarding/StepIndicator";
import MultiInput from "@/components/onboarding/MultiInput";
import FileUpload from "@/components/onboarding/FileUpload";
import {
  NIGERIAN_STATES, STATE_LGAS, BLOOD_TYPES, GENOTYPES,
  GENDERS, RELATIONSHIPS, ID_TYPES, COMMON_CONDITIONS,
} from "@/lib/constants";

const steps = [
  { number: 1, title: "Personal" },
  { number: 2, title: "Next of Kin" },
  { number: 3, title: "Health" },
  { number: 4, title: "Insurance" },
  { number: 5, title: "Verification" },
];

// ─── Schemas ───
const personalSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(100),
  lastName: z.string().trim().min(1, "Required").max(100),
  phoneNumber: z.string().trim().min(10, "Required").max(15),
  email: z.string().trim().email("Invalid email").max(255),
  gender: z.enum(["male", "female", "other"], { required_error: "Required" }),
  nationality: z.string().default("Nigerian"),
  nin: z.string().optional(),
  street: z.string().trim().min(1, "Required").max(200),
  city: z.string().trim().min(1, "Required").max(100),
  state: z.string().min(1, "Required"),
  lga: z.string().optional(),
});

const nokSchema = z.object({
  nokName: z.string().trim().min(1, "Required").max(100),
  nokPhone: z.string().trim().min(10, "Required").max(15),
  nokRelationship: z.string().min(1, "Required"),
});

const healthSchema = z.object({
  bloodType: z.string().optional(),
  genotype: z.string().optional(),
});

const insuranceSchema = z.object({
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceExpiryDate: z.date().optional(),
});

const verificationSchema = z.object({
  idType: z.string().optional(),
});

export default function PatientOnboarding() {
  const [searchParams] = useSearchParams();
  const isAddingRole = searchParams.get("addingRole") === "true";
  const initialStep = isAddingRole ? 2 : 1; // Skip personal info when adding role
  const [step, setStep] = useState(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [insuranceCardFile, setInsuranceCardFile] = useState<File | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState<Date | undefined>();

  const navigate = useNavigate();
  const { user, switchRole } = useAuth();
  const { toast } = useToast();

  const personalForm = useForm({ resolver: zodResolver(personalSchema), defaultValues: {
    firstName: user?.firstName || "", lastName: user?.lastName || "",
    phoneNumber: "", email: user?.email || "", gender: undefined as any,
    nationality: "Nigerian", nin: "", street: "", city: "", state: "", lga: "",
  }});

  const nokForm = useForm({ resolver: zodResolver(nokSchema), defaultValues: {
    nokName: "", nokPhone: "", nokRelationship: "",
  }});

  const healthForm = useForm({ resolver: zodResolver(healthSchema), defaultValues: {
    bloodType: "", genotype: "",
  }});

  const insuranceForm = useForm({ resolver: zodResolver(insuranceSchema), defaultValues: {
    insuranceProvider: "", insurancePolicyNumber: "",
  }});

  const verificationForm = useForm({ resolver: zodResolver(verificationSchema), defaultValues: {
    idType: "",
  }});

  const watchState = personalForm.watch("state");

  const goNext = async () => {
    let valid = false;
    if (step === 1) valid = await personalForm.trigger();
    else if (step === 2) valid = await nokForm.trigger();
    else if (step === 3) valid = true; // optional
    else if (step === 4) valid = true; // optional
    else valid = true;
    if (valid) setStep((s) => Math.min(s + 1, 5));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, isAddingRole ? 2 : 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const p = personalForm.getValues();
      const n = nokForm.getValues();
      const h = healthForm.getValues();
      const ins = insuranceForm.getValues();
      const v = verificationForm.getValues();

      await mockApi.patients.completeProfile({
        firstName: p.firstName, lastName: p.lastName,
        phoneNumber: p.phoneNumber, email: p.email,
        dateOfBirth: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : "",
        gender: p.gender, nationality: p.nationality, nin: p.nin,
        address: { street: p.street, city: p.city, state: p.state, lga: p.lga, country: "Nigeria" },
        nextOfKin: { name: n.nokName, phoneNumber: n.nokPhone, relationship: n.nokRelationship },
        bloodType: h.bloodType, genotype: h.genotype,
        allergies, chronicConditions: conditions, currentMedications: medications,
        insuranceProvider: ins.insuranceProvider, insurancePolicyNumber: ins.insurancePolicyNumber,
        insuranceExpiryDate: insuranceExpiryDate ? format(insuranceExpiryDate, "yyyy-MM-dd") : undefined,
        idType: v.idType as any,
      });

      toast({ title: "Profile Completed! ✅", description: "Your patient profile is approved." });
      if (isAddingRole) {
        await switchRole("patient");
      }
      navigate("/dashboard");
    } catch {
      toast({ title: "Submission failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold text-foreground">{isAddingRole ? "Patient Profile Setup" : "Complete Your Profile"}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{isAddingRole ? "Set up your patient profile to access healthcare services" : "Fill in your details to get started with WellBank"}</p>

        <StepIndicator steps={steps} currentStep={step} />

        {/* Step 1: Personal */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input className="mt-1" {...personalForm.register("firstName")} />
                {personalForm.formState.errors.firstName && <p className="mt-1 text-xs text-destructive">{personalForm.formState.errors.firstName.message}</p>}
              </div>
              <div>
                <Label>Last Name</Label>
                <Input className="mt-1" {...personalForm.register("lastName")} />
                {personalForm.formState.errors.lastName && <p className="mt-1 text-xs text-destructive">{personalForm.formState.errors.lastName.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Phone Number</Label>
                <Input className="mt-1" placeholder="+234..." {...personalForm.register("phoneNumber")} />
              </div>
              <div>
                <Label>Email</Label>
                <Input className="mt-1" type="email" {...personalForm.register("email")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("mt-1 w-full justify-start text-left font-normal", !dateOfBirth && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateOfBirth} onSelect={setDateOfBirth}
                      disabled={(d: Date) => d > new Date() || d < new Date("1920-01-01")}
                      initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Gender</Label>
                <Controller control={personalForm.control} name="gender" render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="mt-2 flex gap-4">
                    {GENDERS.map((g) => (
                      <div key={g} className="flex items-center gap-1.5">
                        <RadioGroupItem value={g} id={`gender-${g}`} />
                        <Label htmlFor={`gender-${g}`} className="capitalize cursor-pointer">{g}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )} />
              </div>
            </div>

            <div>
              <Label>Street Address</Label>
              <Input className="mt-1" placeholder="12 Main Street" {...personalForm.register("street")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input className="mt-1" {...personalForm.register("city")} />
              </div>
              <div>
                <Label>State</Label>
                <Controller control={personalForm.control} name="state" render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => { field.onChange(v); personalForm.setValue("lga", ""); }}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>{NIGERIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>LGA</Label>
                <Controller control={personalForm.control} name="lga" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!watchState || !STATE_LGAS[watchState]}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={watchState && STATE_LGAS[watchState] ? "Select LGA" : "Select state first"} /></SelectTrigger>
                    <SelectContent>{(STATE_LGAS[watchState] || []).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </div>
              <div>
                <Label>NIN <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input className="mt-1" placeholder="11-digit NIN" maxLength={11} {...personalForm.register("nin")} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Next of Kin */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Next of Kin</h2>
            <div>
              <Label>Full Name</Label>
              <Input className="mt-1" placeholder="Enter full name" {...nokForm.register("nokName")} />
              {nokForm.formState.errors.nokName && <p className="mt-1 text-xs text-destructive">{nokForm.formState.errors.nokName.message}</p>}
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input className="mt-1" placeholder="+234..." {...nokForm.register("nokPhone")} />
              {nokForm.formState.errors.nokPhone && <p className="mt-1 text-xs text-destructive">{nokForm.formState.errors.nokPhone.message}</p>}
            </div>
            <div>
              <Label>Relationship</Label>
              <Controller control={nokForm.control} name="nokRelationship" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select relationship" /></SelectTrigger>
                  <SelectContent>{RELATIONSHIPS.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
          </div>
        )}

        {/* Step 3: Health */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Health Information</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Blood Type</Label>
                <Controller control={healthForm.control} name="bloodType" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{BLOOD_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </div>
              <div>
                <Label>Genotype</Label>
                <Controller control={healthForm.control} name="genotype" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{GENOTYPES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <MultiInput label="Allergies" values={allergies} onChange={setAllergies} placeholder="e.g. Penicillin" suggestions={["Penicillin", "Aspirin", "Peanuts", "Latex", "Sulfa drugs"]} />
            <MultiInput label="Chronic Conditions" values={conditions} onChange={setConditions} placeholder="e.g. Diabetes" suggestions={COMMON_CONDITIONS} />
            <MultiInput label="Current Medications" values={medications} onChange={setMedications} placeholder="e.g. Metformin 500mg" />
          </div>
        )}

        {/* Step 4: Insurance */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Insurance <span className="text-sm text-muted-foreground font-normal">(Optional)</span></h2>
            <p className="text-sm text-muted-foreground">Add your health insurance details if you have one</p>
            <div>
              <Label>Insurance Provider</Label>
              <Input className="mt-1" placeholder="e.g. AXA Mansard" {...insuranceForm.register("insuranceProvider")} />
            </div>
            <div>
              <Label>Policy Number</Label>
              <Input className="mt-1" placeholder="e.g. POL-12345" {...insuranceForm.register("insurancePolicyNumber")} />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("mt-1 w-full justify-start text-left font-normal", !insuranceExpiryDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {insuranceExpiryDate ? format(insuranceExpiryDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={insuranceExpiryDate} onSelect={setInsuranceExpiryDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <FileUpload label="Insurance Card" value={insuranceCardFile} onChange={setInsuranceCardFile} accept=".jpg,.jpeg,.png,.pdf" />
          </div>
        )}

        {/* Step 5: Verification */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Identity Verification (KYC)</h2>
            <p className="text-sm text-muted-foreground">Upload your documents for verification</p>
            <FileUpload label="Selfie Photo" value={selfieFile} onChange={setSelfieFile} required description="Take a clear selfie for identity verification" />
            <div>
              <Label>ID Type</Label>
              <Controller control={verificationForm.control} name="idType" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select ID type" /></SelectTrigger>
                  <SelectContent>{ID_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
            <FileUpload label="ID Photo (Front)" value={idFrontFile} onChange={setIdFrontFile} required />
            <FileUpload label="ID Photo (Back)" value={idBackFile} onChange={setIdBackFile} description="Required for Voter's Card, Driver's License" />
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
              {isSubmitting ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Submitting...</> : <>Complete Profile <Check className="ml-1 h-4 w-4" /></>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
