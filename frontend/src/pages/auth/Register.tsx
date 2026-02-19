import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Droplets,
  Shield,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { BLOOD_TYPES, GENOTYPES, GENDERS, REGIONS } from "@/lib/constants";

// Step schemas
const step1Schema = z
  .object({
    email: z.string().trim().email("Invalid email").max(255),
    phoneNumber: z.string().trim().min(10, "Enter a valid phone number").max(15),
    password: z.string().min(8, "Minimum 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const step2Schema = z.object({
  firstName: z.string().trim().min(1, "Required").max(100),
  lastName: z.string().trim().min(1, "Required").max(100),
  dateOfBirth: z.string().min(1, "Required"),
  gender: z.string().min(1, "Required"),
  state: z.string().min(1, "Required"),
  city: z.string().trim().min(1, "Required").max(100),
  street: z.string().trim().min(1, "Required").max(200),
  emergencyName: z.string().trim().min(1, "Required").max(100),
  emergencyPhone: z.string().trim().min(10, "Enter a valid phone number").max(15),
  emergencyRelationship: z.string().trim().min(1, "Required").max(50),
});

const step3Schema = z.object({
  bloodType: z.string().optional(),
  genotype: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
});

const step4Schema = z.object({
  insuranceProvider: z.string().optional(),
  policyNumber: z.string().optional(),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;
type Step4 = z.infer<typeof step4Schema>;

const steps = [
  { number: 1, title: "Account", icon: Mail },
  { number: 2, title: "Personal", icon: User },
  { number: 3, title: "Health", icon: Droplets },
  { number: 4, title: "Insurance", icon: Shield },
];

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1 & Step2 & Step3 & Step4>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const { toast } = useToast();

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleComplete = async (step4Data: Step4) => {
    setIsSubmitting(true);
    const all = { ...formData, ...step4Data };
    try {
      await authRegister({
        email: all.email!,
        password: all.password!,
        role: "patient",
        firstName: all.firstName!,
        lastName: all.lastName!,
        phoneNumber: all.phoneNumber!,
      });
      toast({
        title: "Welcome to WellBank! 🎉",
        description: "Your account has been created successfully.",
      });
      navigate("/dashboard");
    } catch {
      toast({
        title: "Registration failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel - branding (desktop) */}
      <div className="hidden w-[420px] shrink-0 flex-col justify-between gradient-primary p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/20">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary-foreground">WellBank</span>
        </Link>
        <div>
          <h2 className="mb-3 text-2xl font-bold text-primary-foreground">
            Your health journey starts here
          </h2>
          <p className="text-primary-foreground/80">
            Join thousands of Nigerians accessing quality healthcare through WellBank.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">© 2026 WellBank</p>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">WellBank</span>
          </Link>
          <Link to="/login" className="text-sm text-primary">
            Sign In
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8 sm:px-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, i) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      currentStep > step.number
                        ? "gradient-primary text-primary-foreground"
                        : currentStep === step.number
                        ? "border-2 border-primary text-primary"
                        : "border border-border text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`mx-2 h-[2px] w-8 sm:w-12 transition-colors ${
                        currentStep > step.number ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Step {currentStep} of 4 — {steps[currentStep - 1].title}
            </p>
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <StepOne
                key="s1"
                defaults={formData}
                onNext={(d) => {
                  setFormData((p) => ({ ...p, ...d }));
                  nextStep();
                }}
              />
            )}
            {currentStep === 2 && (
              <StepTwo
                key="s2"
                defaults={formData}
                onNext={(d) => {
                  setFormData((p) => ({ ...p, ...d }));
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            {currentStep === 3 && (
              <StepThree
                key="s3"
                defaults={formData}
                onNext={(d) => {
                  setFormData((p) => ({ ...p, ...d }));
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            {currentStep === 4 && (
              <StepFour
                key="s4"
                defaults={formData}
                onComplete={handleComplete}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Reusable motion wrapper
const StepWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="flex-1"
  >
    {children}
  </motion.div>
);

/* ──── Step 1: Account ──── */
function StepOne({
  defaults,
  onNext,
}: {
  defaults: Partial<Step1>;
  onNext: (d: Step1) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1>({
    resolver: zodResolver(step1Schema),
    defaultValues: defaults as Step1,
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">Create your account</h2>
      <p className="mb-6 text-sm text-muted-foreground">Enter your email and create a password</p>
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@email.com" className="pl-10" {...register("email")} />
          </div>
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <div className="relative mt-1.5">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="phoneNumber" placeholder="+234 801 234 5678" className="pl-10" {...register("phoneNumber")} />
          </div>
          {errors.phoneNumber && <p className="mt-1 text-xs text-destructive">{errors.phoneNumber.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" placeholder="Min 8 characters" className="pl-10" {...register("password")} />
          </div>
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="confirmPassword" type="password" placeholder="Repeat password" className="pl-10" {...register("confirmPassword")} />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" variant="hero" className="w-full">
          Continue <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </form>
    </StepWrapper>
  );
}

/* ──── Step 2: Personal Details ──── */
function StepTwo({
  defaults,
  onNext,
  onBack,
}: {
  defaults: Partial<Step2>;
  onNext: (d: Step2) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Step2>({
    resolver: zodResolver(step2Schema),
    defaultValues: defaults as Step2,
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">Personal Details</h2>
      <p className="mb-6 text-sm text-muted-foreground">Tell us about yourself</p>
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>First Name</Label>
            <Input className="mt-1.5" placeholder="John" {...register("firstName")} />
            {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div>
            <Label>Last Name</Label>
            <Input className="mt-1.5" placeholder="Doe" {...register("lastName")} />
            {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Date of Birth</Label>
            <Input type="date" className="mt-1.5" {...register("dateOfBirth")} />
            {errors.dateOfBirth && <p className="mt-1 text-xs text-destructive">{errors.dateOfBirth.message}</p>}
          </div>
          <div>
            <Label>Gender</Label>
            <Select onValueChange={(v) => setValue("gender", v)} defaultValue={defaults.gender}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && <p className="mt-1 text-xs text-destructive">{errors.gender.message}</p>}
          </div>
        </div>
        <div>
          <Label>State</Label>
          <Select onValueChange={(v) => setValue("state", v)} defaultValue={defaults.state}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.NG.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="mt-1 text-xs text-destructive">{errors.state.message}</p>}
        </div>
        <div>
          <Label>City</Label>
          <Input className="mt-1.5" placeholder="Victoria Island" {...register("city")} />
        </div>
        <div>
          <Label>Street Address</Label>
          <div className="relative mt-1.5">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="12 Ozumba Mbadiwe Ave" className="pl-10" {...register("street")} />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <p className="mb-3 text-sm font-medium text-foreground">Emergency Contact</p>
          <div className="space-y-3">
            <Input placeholder="Contact name" {...register("emergencyName")} />
            <Input placeholder="Phone number" {...register("emergencyPhone")} />
            <Input placeholder="Relationship (e.g. spouse)" {...register("emergencyRelationship")} />
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button type="submit" variant="hero" className="flex-1">
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </form>
    </StepWrapper>
  );
}

/* ──── Step 3: Health Info ──── */
function StepThree({
  defaults,
  onNext,
  onBack,
}: {
  defaults: Partial<Step3>;
  onNext: (d: Step3) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
  } = useForm<Step3>({
    resolver: zodResolver(step3Schema),
    defaultValues: defaults as Step3,
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">Health Information</h2>
      <p className="mb-6 text-sm text-muted-foreground">Optional but helps us serve you better</p>
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Blood Type</Label>
            <Select onValueChange={(v) => setValue("bloodType", v)} defaultValue={defaults.bloodType}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_TYPES.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Genotype</Label>
            <Select onValueChange={(v) => setValue("genotype", v)} defaultValue={defaults.genotype}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {GENOTYPES.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Allergies</Label>
          <Input className="mt-1.5" placeholder="e.g. Penicillin, Peanuts (comma separated)" {...register("allergies")} />
        </div>
        <div>
          <Label>Chronic Conditions</Label>
          <Input className="mt-1.5" placeholder="e.g. Diabetes, Asthma (comma separated)" {...register("chronicConditions")} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button type="submit" variant="hero" className="flex-1">
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </form>
    </StepWrapper>
  );
}

/* ──── Step 4: Insurance ──── */
function StepFour({
  defaults,
  onComplete,
  onBack,
  isSubmitting,
}: {
  defaults: Partial<Step4>;
  onComplete: (d: Step4) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const { register, handleSubmit } = useForm<Step4>({
    resolver: zodResolver(step4Schema),
    defaultValues: defaults as Step4,
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">Insurance</h2>
      <p className="mb-6 text-sm text-muted-foreground">Link your insurance policy (optional)</p>
      <form onSubmit={handleSubmit(onComplete)} className="space-y-4">
        <div>
          <Label>Insurance Provider</Label>
          <Input className="mt-1.5" placeholder="e.g. AXA Mansard" {...register("insuranceProvider")} />
        </div>
        <div>
          <Label>Policy Number</Label>
          <Input className="mt-1.5" placeholder="e.g. POL-12345" {...register("policyNumber")} />
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
          <p>You can always add or update your insurance later from your profile settings.</p>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button type="submit" variant="hero" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              <>
                Complete <Check className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </StepWrapper>
  );
}

export default Register;
