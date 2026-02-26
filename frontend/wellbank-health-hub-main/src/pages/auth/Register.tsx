import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  Check,
  Loader2,
  Stethoscope,
  Building2,
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiService } from "@/lib/api-service";
import wellbankLogo from "@/assets/wellbank-logo.jpeg";

// ─── Schemas ───
const roleSchema = z.object({
  role: z.enum(["patient", "doctor", "provider_admin"], {
    required_error: "Select a role",
  }),
});

const otpSendSchema = z.object({
  destination: z
    .string()
    .trim()
    .email("Invalid email address")
    .or(z.literal(""))
    .refine((val) => val !== "", { message: "Email is required" }),
});

const otpVerifySchema = z.object({
  code: z.string().length(6, "Enter the 6-digit code"),
});

const accountSchema = z
  .object({
    firstName: z.string().trim().min(1, "Required").max(100),
    lastName: z.string().trim().min(1, "Required").max(100),
    email: z.string().trim().email("Invalid email").max(255),
    phoneNumber: z
      .string()
      .trim()
      .min(10, "Enter a valid phone number")
      .max(15),
    password: z.string().min(8, "Minimum 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RoleForm = z.infer<typeof roleSchema>;
type OtpSendForm = z.infer<typeof otpSendSchema>;
type OtpVerifyForm = z.infer<typeof otpVerifySchema>;
type AccountForm = z.infer<typeof accountSchema>;

const steps = [
  { number: 1, title: "Role" },
  { number: 2, title: "Verify" },
  { number: 3, title: "OTP" },
  { number: 4, title: "Details" },
];

const roleOptions = [
  {
    value: "patient" as const,
    label: "Patient",
    description: "Find doctors, book tests, order medication",
    icon: User,
  },
  {
    value: "doctor" as const,
    label: "Doctor",
    description: "Manage consultations and grow your practice",
    icon: Stethoscope,
  },
  {
    value: "provider_admin" as const,
    label: "Provider Admin",
    description: "Create and manage healthcare organizations",
    icon: Building2,
  },
];

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") as RoleForm["role"] | null;
  const resumeEmail = searchParams.get("email");

  const [currentStep, setCurrentStep] = useState(initialRole ? 2 : 1);
  const [selectedRole, setSelectedRole] = useState<RoleForm["role"] | null>(
    initialRole,
  );
  const [otpId, setOtpId] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(
    null,
  );
  const [otpDestination, setOtpDestination] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const { toast } = useToast();

  // Check for existing registration on page load
  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (resumeEmail) {
        setIsResuming(true);
        try {
          const res = await apiService.auth.resumeRegistration({ email: resumeEmail });
          if (res.status === 'success' && res.data) {
            const state = res.data as { step: number; data: Record<string, unknown> };
            
            // Restore state
            if (state.data.role) setSelectedRole(state.data.role as RoleForm["role"]);
            if (state.data.email) setOtpDestination(state.data.email as string);
            if (state.data.verificationToken) setVerificationToken(state.data.verificationToken as string);
            
            // Jump to saved step
            const step = Math.max(2, state.step);
            setCurrentStep(step);
            
            toast({
              title: "Welcome back!",
              description: "Continue where you left off.",
            });
          }
        } catch (error) {
          console.error("Failed to resume registration:", error);
        } finally {
          setIsResuming(false);
        }
      }
    };

    checkExistingRegistration();
  }, [resumeEmail, toast]);

  // Save registration step to backend
  const saveRegistrationStep = async (step: number, data: Record<string, unknown>) => {
    if (otpDestination) {
      try {
        await apiService.auth.saveRegistrationStep({
          email: otpDestination,
          step,
          data: { ...data, role: selectedRole, email: otpDestination },
        });
      } catch (error) {
        console.error("Failed to save registration step:", error);
      }
    }
  };

  const nextStep = () => {
    setCurrentStep((s) => Math.min(s + 1, 4));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  // Step 1: Select Role
  const handleRoleSelect = (role: RoleForm["role"]) => {
    setSelectedRole(role);
    nextStep();
  };

  // Step 2: Send OTP
  const handleSendOtp = async (data: OtpSendForm) => {
    setIsSubmitting(true);
    try {
      const res = await apiService.auth.sendOtp({
        type: 'email',
        destination: data.destination,
      });
      const resData = res.data as { otpId: string };
      setOtpId(resData.otpId);
      setOtpDestination(data.destination);
      
      // Save step 1 (role selection)
      await saveRegistrationStep(1, { role: selectedRole });
      
      toast({
        title: "OTP Sent! 📧",
        description: `Check your email for the code.`,
      });
      nextStep();
    } catch {
      toast({ title: "Failed to send OTP", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOtp = async (data: OtpVerifyForm) => {
    setIsSubmitting(true);
    try {
      const res = await apiService.auth.verifyOtp({ otpId: otpId!, code: data.code });
      const vToken = (res.data as { verificationToken: string }).verificationToken;
      setVerificationToken(vToken);
      
      // Save step 2 (email verified)
      await saveRegistrationStep(2, { verificationToken: vToken, email: otpDestination });
      
      toast({ title: "Verified! ✅" });
      nextStep();
    } catch {
      toast({ title: "Invalid OTP", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4: Complete Registration
  const handleComplete = async (data: AccountForm) => {
    setIsSubmitting(true);
    try {
      // Save step 3 (account details) before completing
      await saveRegistrationStep(3, { 
        firstName: data.firstName, 
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      });
      
      await authRegister({
        verificationToken: verificationToken!,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        role: selectedRole!,
      });
      
      // Clear registration state after successful registration
      await apiService.auth.clearRegistrationState({ email: otpDestination });
      
      toast({
        title: "Welcome to WellBank! 🎉",
        description: "Your account has been created.",
      });
      navigate("/dashboard");
    } catch {
      toast({ title: "Registration failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel */}
      <div className="hidden w-[420px] shrink-0 flex-col justify-between gradient-primary p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={wellbankLogo}
            alt="WellBank"
            className="h-9 w-9 rounded-lg object-cover"
          />
          <span className="text-xl font-bold text-primary-foreground">
            WellBank
          </span>
        </Link>
        <div>
          <h2 className="mb-3 text-2xl font-bold text-primary-foreground">
            Your health journey starts here
          </h2>
          <p className="text-primary-foreground/80">
            Join thousands of Nigerians accessing quality healthcare through
            WellBank.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">© 2026 WellBank</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={wellbankLogo}
              alt="WellBank"
              className="h-7 w-7 rounded object-cover"
            />
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
                      className={`mx-2 h-[2px] w-8 sm:w-12 transition-colors ${currentStep > step.number ? "bg-primary" : "bg-border"}`}
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
              <StepWrapper key="s1">
                <h2 className="mb-1 text-xl font-bold text-foreground">
                  Choose your role
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  How will you use WellBank?
                </p>
                <div className="space-y-3">
                  {roleOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleRoleSelect(opt.value)}
                      className="group flex w-full items-start gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:shadow-glow"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
                        <opt.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {opt.label}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {opt.description}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              </StepWrapper>
            )}

            {currentStep === 2 && (
              <StepSendOtp
                key="s2"
                onSend={handleSendOtp}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {currentStep === 3 && (
              <StepVerifyOtp
                key="s3"
                destination={otpDestination}
                onVerify={handleVerifyOtp}
                onBack={prevStep}
                onResend={async () => {
                  if (otpId) {
                    await apiService.auth.sendOtp({
                      type: "phone",
                      destination: otpDestination,
                    });
                    toast({ title: "OTP resent! 📱" });
                  }
                }}
                isSubmitting={isSubmitting}
              />
            )}

            {currentStep === 4 && (
              <StepAccount
                key="s4"
                onComplete={handleComplete}
                onBack={prevStep}
                isSubmitting={isSubmitting}
                prefillEmail={otpDestination}
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

// Step 2: Send OTP
function StepSendOtp({
  onSend,
  onBack,
  isSubmitting,
}: {
  onSend: (d: OtpSendForm) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpSendForm>({
    resolver: zodResolver(otpSendSchema),
    defaultValues: { destination: "" },
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Verify your email
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        We'll send a 6-digit code to verify your email
      </p>
      <form onSubmit={handleSubmit(onSend)} className="space-y-4">
        <div>
          <Label>Email Address</Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder="you@email.com"
              className="pl-10"
              {...register("destination")}
            />
          </div>
          {errors.destination && (
            <p className="mt-1 text-xs text-destructive">
              {errors.destination.message}
            </p>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button
            type="submit"
            variant="hero"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                Send OTP <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </StepWrapper>
  );
}

// Step 3: Verify OTP
function StepVerifyOtp({
  destination,
  onVerify,
  onBack,
  onResend,
  isSubmitting,
}: {
  destination: string;
  onVerify: (d: OtpVerifyForm) => void;
  onBack: () => void;
  onResend: () => void;
  isSubmitting: boolean;
}) {
  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OtpVerifyForm>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { code: "" },
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Enter verification code
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-foreground">{destination}</span>
      </p>
      <form onSubmit={handleSubmit(onVerify)} className="space-y-6">
        <div className="flex justify-center">
          <InputOTP maxLength={6} onChange={(val) => setValue("code", val)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        {errors.code && (
          <p className="text-center text-xs text-destructive">
            {errors.code.message}
          </p>
        )}
        <div className="text-center">
          <button
            type="button"
            onClick={onResend}
            className="text-sm text-primary hover:underline"
          >
            Didn't get the code? Resend
          </button>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button
            type="submit"
            variant="hero"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                Verify <Check className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </StepWrapper>
  );
}

// Step 4: Account Details
function StepAccount({
  onComplete,
  onBack,
  isSubmitting,
  prefillEmail,
}: {
  onComplete: (d: AccountForm) => void;
  onBack: () => void;
  isSubmitting: boolean;
  prefillEmail?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: prefillEmail || "",
    },
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Complete your profile
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Enter your personal information
      </p>
      <form onSubmit={handleSubmit(onComplete)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>First Name</Label>
            <Input
              className="mt-1.5"
              placeholder="John"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              className="mt-1.5"
              placeholder="Doe"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-destructive">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label>Email</Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder="you@email.com"
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <Label>Phone Number</Label>
          <div className="relative mt-1.5">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="+234 801 234 5678"
              className="pl-10"
              {...register("phoneNumber")}
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-xs text-destructive">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>
        <div>
          <Label>Password</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Min 8 characters"
              className="pl-10"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
        <div>
          <Label>Confirm Password</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Repeat password"
              className="pl-10"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button
            type="submit"
            variant="hero"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              <>
                Create Account <Check className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </StepWrapper>
  );
}

export default Register;
