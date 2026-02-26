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

// Dynamic steps based on role
const getSteps = (role: string | null) => {
  const baseSteps = [
    { number: 1, title: "Role" },
    { number: 2, title: "Verify" },
    { number: 3, title: "OTP" },
    { number: 4, title: "Account" },
  ];

  if (role === "patient") {
    return [
      ...baseSteps,
      { number: 5, title: "Personal" },
      { number: 6, title: "Next of Kin" },
      { number: 7, title: "Health" },
      { number: 8, title: "Insurance" },
      { number: 9, title: "Verify ID" },
    ];
  } else if (role === "doctor") {
    return [
      ...baseSteps,
      { number: 5, title: "Personal" },
      { number: 6, title: "Professional" },
      { number: 7, title: "Certifications" },
      { number: 8, title: "Identity" },
      { number: 9, title: "Banking" },
      { number: 10, title: "Review" },
    ];
  } else if (role === "provider_admin") {
    return [
      ...baseSteps,
      { number: 5, title: "Org Type" },
      { number: 6, title: "Organization" },
      { number: 7, title: "Services" },
      { number: 8, title: "Documents" },
      { number: 9, title: "Banking" },
      { number: 10, title: "Verify ID" },
    ];
  }

  return baseSteps;
};

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

  // Role-specific form data
  const [accountData, setAccountData] = useState<AccountForm | null>(null);
  
  // Patient-specific data
  const [patientPersonalData, setPatientPersonalData] = useState<Record<string, unknown>>({});
  const [patientNextOfKinData, setPatientNextOfKinData] = useState<Record<string, unknown>>({});
  const [patientHealthData, setPatientHealthData] = useState<Record<string, unknown>>({});
  const [patientInsuranceData, setPatientInsuranceData] = useState<Record<string, unknown>>({});
  const [patientVerificationData, setPatientVerificationData] = useState<{selfie?: File; idDocument?: File}>({});
  
  // Doctor-specific data
  const [doctorPersonalData, setDoctorPersonalData] = useState<Record<string, unknown>>({});
  const [doctorProfessionalData, setDoctorProfessionalData] = useState<Record<string, unknown>>({});
  const [doctorCertificationsData, setDoctorCertificationsData] = useState<Record<string, unknown>>({});
  const [doctorIdentityData, setDoctorIdentityData] = useState<{selfie?: File; idDocument?: File}>({});
  const [doctorBankingData, setDoctorBankingData] = useState<Record<string, unknown>>({});
  
  // Provider Admin-specific data
  const [providerOrgData, setProviderOrgData] = useState<Record<string, unknown>>({});

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

  const steps = getSteps(selectedRole);
  const totalSteps = steps.length;

  const nextStep = () => {
    setCurrentStep((s) => Math.min(s + 1, totalSteps));
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

  // Step 4: Complete Registration - save data and continue to role-specific steps
  const handleComplete = async (data: AccountForm) => {
    // Save account data and continue to role-specific steps
    setAccountData(data);
    
    // Save step 3 (account details)
    await saveRegistrationStep(3, { 
      firstName: data.firstName, 
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
    });
    
    // Continue to next step (role-specific)
    nextStep();
  };

  // Handle role-specific step completion
  const handleRoleSpecificComplete = async () => {
    if (!accountData || !verificationToken) {
      toast({ title: "Registration error", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Save final step with all role-specific data
      const roleData = {
        patient: {
          personal: patientPersonalData,
          nextOfKin: patientNextOfKinData,
          health: patientHealthData,
          insurance: patientInsuranceData,
          verification: {
            hasSelfie: !!patientVerificationData.selfie,
            hasIdDocument: !!patientVerificationData.idDocument,
          },
        },
        doctor: {
          personal: doctorPersonalData,
          professional: doctorProfessionalData,
          certifications: doctorCertificationsData,
          identity: {
            hasSelfie: !!doctorIdentityData.selfie,
            hasIdDocument: !!doctorIdentityData.idDocument,
          },
          banking: doctorBankingData,
        },
        provider_admin: providerOrgData,
      };

      await saveRegistrationStep(totalSteps, roleData);

      // Complete registration
      await authRegister({
        verificationToken: verificationToken,
        password: accountData.password,
        firstName: accountData.firstName,
        lastName: accountData.lastName,
        phoneNumber: accountData.phoneNumber,
        role: selectedRole!,
      });
      
      // Clear registration state after successful registration
      await apiService.auth.clearRegistrationState({ email: otpDestination });
      
      toast({
        title: "Welcome to WellBank! 🎉",
        description: selectedRole === 'patient' 
          ? "Your account has been created."
          : "Your account has been created and is pending approval.",
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
              Step {currentStep} of {totalSteps} — {steps[currentStep - 1]?.title}
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

            {/* ============================================
                PATIENT STEPS (Steps 5-9)
            ============================================ */}
            
            {/* Step 5: Personal Details */}
            {currentStep === 5 && selectedRole === "patient" && (
              <StepPatientPersonal
                key="s5"
                onComplete={async (data) => {
                  setPatientPersonalData(data);
                  await saveRegistrationStep(5, data);
                  nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 6: Next of Kin */}
            {currentStep === 6 && selectedRole === "patient" && (
              <StepPatientNextOfKin
                key="s6"
                onComplete={async (data) => {
                  setPatientNextOfKinData(data);
                  await saveRegistrationStep(6, data);
                  nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 7: Health Info */}
            {currentStep === 7 && selectedRole === "patient" && (
              <StepPatientHealth
                key="s7"
                onComplete={async (data) => {
                  setPatientHealthData(data);
                  await saveRegistrationStep(7, data);
                  nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 8: Insurance */}
            {currentStep === 8 && selectedRole === "patient" && (
              <StepPatientInsurance
                key="s8"
                onComplete={async (data) => {
                  setPatientInsuranceData(data);
                  await saveRegistrationStep(8, data);
                  nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 9: Verification (Selfie + ID) */}
            {currentStep === 9 && selectedRole === "patient" && (
              <StepVerification
                key="s9"
                onComplete={async (data) => {
                  setPatientVerificationData(data);
                  await saveRegistrationStep(9, { 
                    hasSelfie: !!data.selfie, 
                    hasIdDocument: !!data.idDocument 
                  });
                  await handleRoleSpecificComplete();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* ============================================
                DOCTOR STEPS (Steps 5-10)
            ============================================ */}

            {/* Step 5: Personal Details */}
            {currentStep === 5 && selectedRole === "doctor" && (
              <StepDoctorPersonal
                key="s5"
                onComplete={async (data) => {
                  setDoctorPersonalData(data);
                  await saveRegistrationStep(5, data);
                  nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 6: Professional Info */}
            {currentStep === 6 && selectedRole === "doctor" && (
              <StepDoctorProfessional
                key="s6"
                onComplete={async (data) => {
                  setDoctorProfessionalData(data);
                  await saveRegistrationStep(6, data);
                  nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 7: Certifications */}
            {currentStep === 7 && selectedRole === "doctor" && (
              <StepDoctorCertifications
                key="s7"
                onComplete={async (data) => {
                  setDoctorCertificationsData(data);
                  await saveRegistrationStep(7, data);
                  nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 8: Identity */}
            {currentStep === 8 && selectedRole === "doctor" && (
              <StepVerification
                key="s8"
                onComplete={async (data) => {
                  setDoctorIdentityData(data);
                  await saveRegistrationStep(8, { 
                    hasSelfie: !!data.selfie, 
                    hasIdDocument: !!data.idDocument 
                  });
                  nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 9: Banking */}
            {currentStep === 9 && selectedRole === "doctor" && (
              <StepDoctorBanking
                key="s9"
                onComplete={async (data) => {
                  setDoctorBankingData(data);
                  await saveRegistrationStep(9, data);
                  nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 10: Review (Submit for admin approval) */}
            {currentStep === 10 && selectedRole === "doctor" && (
              <StepReview
                key="s10"
                onComplete={async () => {
                  await handleRoleSpecificComplete();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* ============================================
                PROVIDER ADMIN STEPS (Steps 5-10)
            ============================================ */}

            {/* Step 5: Organization Type */}
            {currentStep === 5 && selectedRole === "provider_admin" && (
              <StepProviderOrgType
                key="s5"
                onComplete={async (data) => {
                  setProviderOrgData((prev) => ({ ...prev, ...data }));
                  await saveRegistrationStep(5, data);
                  nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 6: Organization Info (Dynamic based on type) */}
            {currentStep === 6 && selectedRole === "provider_admin" && (
              <StepProviderOrgInfo
                key="s6"
                orgType={(providerOrgData.organizationType as string) || ""}
                onComplete={async (data) => {
                  setProviderOrgData((prev) => ({ ...prev, ...data }));
                  await saveRegistrationStep(6, data);
                  nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 7: Services/Ops */}
            {currentStep === 7 && selectedRole === "provider_admin" && (
              <StepProviderServices
                key="s7"
                orgType={(providerOrgData.organizationType as string) || ""}
                onComplete={async (data) => {
                  setProviderOrgData((prev) => ({ ...prev, ...data }));
                  await saveRegistrationStep(7, data);
                  nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 8: Documents/Certifications */}
            {currentStep === 8 && selectedRole === "provider_admin" && (
              <StepProviderCertifications
                key="s8"
                orgType={(providerOrgData.organizationType as string) || ""}
                onComplete={async (data) => {
                  setProviderOrgData((prev) => ({ ...prev, ...data }));
                  await saveRegistrationStep(8, data);
                  nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 9: Banking */}
            {currentStep === 9 && selectedRole === "provider_admin" && (
              <StepProviderBanking
                key="s9"
                onComplete={async (data) => {
                  setProviderOrgData((prev) => ({ ...prev, ...data }));
                  await saveRegistrationStep(9, data);
                  nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 10: Verification */}
            {currentStep === 10 && selectedRole === "provider_admin" && (
              <StepVerification
                key="s10"
                onComplete={async (data) => {
                  setProviderOrgData((prev) => ({ ...prev, verification: data }));
                  await saveRegistrationStep(10, { 
                    hasSelfie: !!data.selfie, 
                    hasIdDocument: !!data.idDocument 
                  });
                  await handleRoleSpecificComplete();
                }}
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

// Step 7: Patient Health Info (Optional - enhanced with medications)
function StepPatientHealth({
  onComplete,
  onBack,
  isSubmitting,
}: {
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    bloodType: "",
    genotype: "",
    allergies: [] as string[],
    chronicConditions: [] as string[],
    currentMedications: [] as string[],
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Health Information (Optional)
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Help us personalize your care by sharing health details
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Blood Type</Label>
            <select
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
              value={formData.bloodType}
              onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
            >
              <option value="">Select</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div>
            <Label>Genotype</Label>
            <select
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
              value={formData.genotype}
              onChange={(e) => setFormData({ ...formData, genotype: e.target.value })}
            >
              <option value="">Select</option>
              <option value="AA">AA</option>
              <option value="AS">AS</option>
              <option value="SS">SS</option>
              <option value="AC">AC</option>
              <option value="CC">CC</option>
            </select>
          </div>
        </div>

        <div>
          <Label>Known Allergies (comma separated)</Label>
          <Input
            placeholder="e.g., Penicillin, Pollen"
            className="mt-1.5"
            value={formData.allergies.join(", ")}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
          />
        </div>

        <div>
          <Label>Chronic Conditions (comma separated)</Label>
          <Input
            placeholder="e.g., Diabetes, Hypertension"
            className="mt-1.5"
            value={formData.chronicConditions.join(", ")}
            onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
          />
        </div>

        <div>
          <Label>Current Medications (comma separated)</Label>
          <Input
            placeholder="e.g., Aspirin, Metformin"
            className="mt-1.5"
            value={formData.currentMedications.join(", ")}
            onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button type="button" variant="hero" onClick={() => onComplete(formData)} className="flex-1">
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

// Step 6: Doctor Professional Info
function StepDoctorProfessional({
  onComplete,
  onBack,
  isSubmitting,
}: {
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    specialty: "",
    yearsExperience: "",
    consultationFee: "",
    consultationTypes: [] as string[],
    hospitalAffiliation: "",
    bio: "",
  });

  const toggleConsultationType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      consultationTypes: prev.consultationTypes.includes(type)
        ? prev.consultationTypes.filter((t) => t !== type)
        : [...prev.consultationTypes, type],
    }));
  };

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Professional Information
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Tell us about your practice
      </p>

      <div className="space-y-4">
        <div>
          <Label>Specialty</Label>
          <Input
            placeholder="e.g., General Practice, Cardiology"
            className="mt-1.5"
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Years of Experience</Label>
            <Input
              type="number"
              placeholder="e.g., 5"
              className="mt-1.5"
              value={formData.yearsExperience}
              onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
            />
          </div>
          <div>
            <Label>Consultation Fee (₦)</Label>
            <Input
              type="number"
              placeholder="e.g., 5000"
              className="mt-1.5"
              value={formData.consultationFee}
              onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label>Consultation Types</Label>
          <div className="mt-2 flex gap-4">
            {["Virtual", "Physical"].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`ct-${t}`}
                  checked={formData.consultationTypes.includes(t)}
                  onChange={() => toggleConsultationType(t)}
                  className="h-4 w-4"
                />
                <label htmlFor={`ct-${t}`} className="cursor-pointer text-sm">
                  {t}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Bio</Label>
          <textarea
            placeholder="Brief description of your practice..."
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button 
            type="button" 
            variant="hero" 
            onClick={() => onComplete(formData)} 
            className="flex-1"
            disabled={!formData.specialty || !formData.yearsExperience}
          >
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

// Step 6: Doctor Credentials
function StepDoctorCredentials({
  onComplete,
  onBack,
  isSubmitting,
}: {
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    mdcnLicenseNumber: "",
    practicingLicenseNumber: "",
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Credentials (Required)
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Provide your professional license information
      </p>

      <div className="space-y-4">
        <div>
          <Label>MDCN License Number</Label>
          <Input
            placeholder="e.g., MDCN/12345"
            className="mt-1.5"
            value={formData.mdcnLicenseNumber}
            onChange={(e) => setFormData({ ...formData, mdcnLicenseNumber: e.target.value })}
          />
        </div>

        <div>
          <Label>Practice License Number</Label>
          <Input
            placeholder="e.g., PRACT/67890"
            className="mt-1.5"
            value={formData.practicingLicenseNumber}
            onChange={(e) => setFormData({ ...formData, practicingLicenseNumber: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button 
            type="button" 
            variant="hero" 
            onClick={() => onComplete(formData)} 
            className="flex-1"
            disabled={!formData.mdcnLicenseNumber || isSubmitting}
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
      </div>
    </StepWrapper>
  );
}

// Step 5: Provider Organization Info
function StepProviderOrg({
  onComplete,
  onBack,
  isSubmitting,
}: {
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "",
    cacNumber: "",
    description: "",
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Organization Information
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Create your healthcare organization
      </p>

      <div className="space-y-4">
        <div>
          <Label>Organization Name</Label>
          <Input
            placeholder="e.g., Lagos General Hospital"
            className="mt-1.5"
            value={formData.organizationName}
            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
          />
        </div>

        <div>
          <Label>Organization Type</Label>
          <select
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
            value={formData.organizationType}
            onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
          >
            <option value="">Select type</option>
            <option value="hospital">Hospital</option>
            <option value="clinic">Clinic</option>
            <option value="laboratory">Laboratory</option>
            <option value="pharmacy">Pharmacy</option>
          </select>
        </div>

        <div>
          <Label>CAC Number</Label>
          <Input
            placeholder="e.g., RC1234567"
            className="mt-1.5"
            value={formData.cacNumber}
            onChange={(e) => setFormData({ ...formData, cacNumber: e.target.value })}
          />
        </div>

        <div>
          <Label>Description</Label>
          <textarea
            placeholder="Brief description of your organization..."
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button 
            type="button" 
            variant="hero" 
            onClick={() => onComplete(formData)} 
            className="flex-1"
            disabled={!formData.organizationName || !formData.organizationType || isSubmitting}
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
      </div>
    </StepWrapper>
  );
}

// ============================================
// NEW STEP COMPONENTS
// ============================================

// Step 5: Patient Personal Details
function StepPatientPersonal({
  onComplete,
  onBack,
  isSubmitting,
}: {
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "",
    residentialAddress: "",
    state: "",
    lga: "",
    nationality: "Nigerian",
    nin: "",
  });

  const [states] = useState([
    "Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu", "Abuja", 
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
    "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Gombe", "Imo",
    "Jigawa", "Kaduna", "Katsina", "Kebbi", "Kogi", "Kwara", "Nasarawa", "Niger",
    "Ogun", "Ondo", "Osun", "Oyo", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ]);

  const lgas: Record<string, string[]> = {
    "Lagos": ["Alimosho", "Ajeromi-Ifelodun", "Kosofe", "Mushin", "Oshodi-Isolo", "Eti-Osa", "Surulere", "Ifako-Ijaye", "Shomolu", "Maja"],
  };

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Personal Details
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Tell us more about yourself
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Date of Birth</Label>
            <Input
              type="date"
              className="mt-1.5"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>
          <div>
            <Label>Gender</Label>
            <select
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <Label>Residential Address</Label>
          <Input
            placeholder="Street address"
            className="mt-1.5"
            value={formData.residentialAddress}
            onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>State</Label>
            <select
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value, lga: "" })}
            >
              <option value="">Select</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <Label>LGA</Label>
            <select
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
              value={formData.lga}
              onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
              disabled={!formData.state}
            >
              <option value="">Select</option>
              {(lgas[formData.state] || []).map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nationality</Label>
            <Input
              className="mt-1.5"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            />
          </div>
          <div>
            <Label>NIN (Optional)</Label>
            <Input
              placeholder="11-digit NIN"
              className="mt-1.5"
              value={formData.nin}
              onChange={(e) => setFormData({ ...formData, nin: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button type="button" variant="hero" onClick={() => onComplete(formData)} className="flex-1">
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

// Step 6: Patient Next of Kin
function StepPatientNextOfKin({
  onComplete,
  onBack,
  isSubmitting,
}: {
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    nokName: "",
    nokPhone: "",
    nokRelationship: "",
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Next of Kin
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Who should we contact in case of emergency?
      </p>

      <div className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input
            placeholder="Emergency contact name"
            className="mt-1.5"
            value={formData.nokName}
            onChange={(e) => setFormData({ ...formData, nokName: e.target.value })}
          />
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input
            placeholder="+234 801 234 5678"
            className="mt-1.5"
            value={formData.nokPhone}
            onChange={(e) => setFormData({ ...formData, nokPhone: e.target.value })}
          />
        </div>

        <div>
          <Label>Relationship</Label>
          <select
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
            value={formData.nokRelationship}
            onChange={(e) => setFormData({ ...formData, nokRelationship: e.target.value })}
          >
            <option value="">Select</option>
            <option value="spouse">Spouse</option>
            <option value="parent">Parent</option>
            <option value="sibling">Sibling</option>
            <option value="child">Child</option>
            <option value="relative">Relative</option>
            <option value="friend">Friend</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button type="button" variant="hero" onClick={() => onComplete(formData)} className="flex-1">
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

// Step 8: Patient Insurance (Optional)
function StepPatientInsurance({
  onComplete,
  onBack,
  isSubmitting,
}: {
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [hasInsurance, setHasInsurance] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    provider: "",
    policyNumber: "",
    expiryDate: "",
    cardImage: null as File | null,
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Insurance (Optional)
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Do you have health insurance coverage?
      </p>

      {hasInsurance === null ? (
        <div className="space-y-4">
          <Button variant="hero" className="w-full py-6" onClick={() => setHasInsurance(true)}>
            Yes, I have insurance
          </Button>
          <Button variant="outline" className="w-full py-6" onClick={() => setHasInsurance(false)}>
            No, I'll pay out of pocket
          </Button>
        </div>
      ) : hasInsurance ? (
        <div className="space-y-4">
          <div>
            <Label>Insurance Provider</Label>
            <Input
              placeholder="e.g., AXA, Leadway, AIICO"
              className="mt-1.5"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            />
          </div>

          <div>
            <Label>Policy Number</Label>
            <Input
              placeholder="Your policy number"
              className="mt-1.5"
              value={formData.policyNumber}
              onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
            />
          </div>

          <div>
            <Label>Expiry Date</Label>
            <Input
              type="date"
              className="mt-1.5"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />
          </div>

          <div>
            <Label>Upload Insurance Card (Optional)</Label>
            <Input
              type="file"
              accept="image/*,.pdf"
              className="mt-1.5"
              onChange={(e) => setFormData({ ...formData, cardImage: e.target.files?.[0] || null })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setHasInsurance(null)} className="flex-1">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button type="button" variant="hero" onClick={() => onComplete(formData)} className="flex-1">
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You can add insurance later from your profile settings.
          </p>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setHasInsurance(null)} className="flex-1">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button type="button" variant="hero" onClick={() => onComplete({ hasInsurance: false })} className="flex-1">
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </StepWrapper>
  );
}

// Step 9: Verification (Selfie + ID) - Shared by Patient, Doctor, Provider Admin
function StepVerification({
  onComplete,
  onBack,
  isSubmitting,
}: {
  onComplete: (d: { selfie?: File; idDocument?: File }) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [selfie, setSelfie] = useState<File | null>(null);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [idType, setIdType] = useState("");

  const idTypes = [
    { value: "national_id", label: "National ID (NIN)" },
    { value: "voters_card", label: "Voter's Card" },
    { value: "drivers_license", label: "Driver's License" },
    { value: "international_passport", label: "International Passport" },
  ];

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Verify Your Identity
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Upload a selfie and valid ID for verification
      </p>

      <div className="space-y-4">
        <div>
          <Label>ID Type</Label>
          <select
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
            value={idType}
            onChange={(e) => setIdType(e.target.value)}
          >
            <option value="">Select ID type</option>
            {idTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <Label>Upload ID Document</Label>
          <Input
            type="file"
            accept="image/*,.pdf"
            className="mt-1.5"
            onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
          />
          {idDocument && <p className="mt-1 text-xs text-green-600">✓ {idDocument.name}</p>}
        </div>

        <div>
          <Label>Take a Selfie</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Take a clear photo of yourself for verification
          </p>
          <Input
            type="file"
            accept="image/*"
            capture="user"
            className="mt-1.5"
            onChange={(e) => setSelfie(e.target.files?.[0] || null)}
          />
          {selfie && <p className="mt-1 text-xs text-green-600">✓ {selfie.name}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button 
            type="button" 
            variant="hero" 
            onClick={() => onComplete({ selfie: selfie || undefined, idDocument: idDocument || undefined })} 
            className="flex-1"
            disabled={!selfie || !idDocument || !idType}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                Submit <Check className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

// Step 5: Doctor Personal Details
function StepDoctorPersonal({
  onComplete,
  onBack,
  isSubmitting,
}: {
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "",
    residentialAddress: "",
    state: "",
    nationality: "Nigerian",
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Personal Details
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Your personal information
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Date of Birth</Label>
            <Input
              type="date"
              className="mt-1.5"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>
          <div>
            <Label>Gender</Label>
            <select
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div>
          <Label>Residential Address</Label>
          <Input
            placeholder="Your address"
            className="mt-1.5"
            value={formData.residentialAddress}
            onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>State</Label>
            <Input
              className="mt-1.5"
              placeholder="State of residence"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>
          <div>
            <Label>Nationality</Label>
            <Input
              className="mt-1.5"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button type="button" variant="hero" onClick={() => onComplete(formData)} className="flex-1">
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

// Step 7: Doctor Certifications
function StepDoctorCertifications({
  onComplete,
  onBack,
  isSubmitting,
}: {
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    mbbsCertificate: null as File | null,
    mdcnLicenseNumber: "",
    practicingLicenseNumber: "",
    practicingLicenseExpiry: "",
    nyscCertificate: null as File | null,
    medicalIndemnity: null as File | null,
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Certifications (Required)
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Upload your medical certifications and licenses
      </p>

      <div className="space-y-4">
        <div>
          <Label>MBBS Certificate</Label>
          <Input
            type="file"
            accept="image/*,.pdf"
            className="mt-1.5"
            onChange={(e) => setFormData({ ...formData, mbbsCertificate: e.target.files?.[0] || null })}
          />
        </div>

        <div>
          <Label>MDCN License Number</Label>
          <Input
            placeholder="e.g., MDCN/12345"
            className="mt-1.5"
            value={formData.mdcnLicenseNumber}
            onChange={(e) => setFormData({ ...formData, mdcnLicenseNumber: e.target.value })}
          />
        </div>

        <div>
          <Label>Annual Practicing License Number</Label>
          <Input
            placeholder="License number"
            className="mt-1.5"
            value={formData.practicingLicenseNumber}
            onChange={(e) => setFormData({ ...formData, practicingLicenseNumber: e.target.value })}
          />
        </div>

        <div>
          <Label>Practicing License Expiry Date</Label>
          <Input
            type="date"
            className="mt-1.5"
            value={formData.practicingLicenseExpiry}
            onChange={(e) => setFormData({ ...formData, practicingLicenseExpiry: e.target.value })}
          />
        </div>

        <div>
          <Label>NYSC Certificate (or Exemption)</Label>
          <Input
            type="file"
            accept="image/*,.pdf"
            className="mt-1.5"
            onChange={(e) => setFormData({ ...formData, nyscCertificate: e.target.files?.[0] || null })}
          />
        </div>

        <div>
          <Label>Medical Indemnity Insurance (Optional)</Label>
          <Input
            type="file"
            accept="image/*,.pdf"
            className="mt-1.5"
            onChange={(e) => setFormData({ ...formData, medicalIndemnity: e.target.files?.[0] || null })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button 
            type="button" 
            variant="hero" 
            onClick={() => onComplete(formData)} 
            className="flex-1"
            disabled={!formData.mbbsCertificate || !formData.mdcnLicenseNumber || !formData.practicingLicenseNumber}
          >
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

// Step 9: Doctor Banking
function StepDoctorBanking({
  onComplete,
  onBack,
  isSubmitting,
}: {
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    bvn: "",
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Banking Details
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Your bank details for receiving payments
      </p>

      <div className="space-y-4">
        <div>
          <Label>Bank Name</Label>
          <Input
            placeholder="e.g., Guaranty Trust Bank"
            className="mt-1.5"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          />
        </div>

        <div>
          <Label>Account Name</Label>
          <Input
            placeholder="As it appears on your bank account"
            className="mt-1.5"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
          />
        </div>

        <div>
          <Label>Account Number</Label>
          <Input
            placeholder="10-digit account number"
            className="mt-1.5"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
          />
        </div>

        <div>
          <Label>BVN</Label>
          <Input
            placeholder="11-digit BVN"
            className="mt-1.5"
            value={formData.bvn}
            onChange={(e) => setFormData({ ...formData, bvn: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button 
            type="button" 
            variant="hero" 
            onClick={() => onComplete(formData)} 
            className="flex-1"
            disabled={!formData.bankName || !formData.accountName || !formData.accountNumber || !formData.bvn}
          >
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

// Step 10: Review and Submit (for Doctor/Provider Admin)
function StepReview({
  onComplete,
  onBack,
  isSubmitting,
}: {
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Review & Submit
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Your application will be reviewed by our team
      </p>

      <div className="space-y-4">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            <strong>Pending Approval:</strong> Your account has been created but requires 
            admin verification before you can start using the platform. This usually 
            takes 24-48 hours.
          </p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold text-foreground mb-2">What's next?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ We'll verify your documents</li>
            <li>✓ You'll receive an email once approved</li>
            <li>✓ You can then set up your profile and availability</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button 
            type="button" 
            variant="hero" 
            onClick={onComplete} 
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                Submit for Review <Check className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

// Step 5: Provider Admin - Organization Type Selection
function StepProviderOrgType({
  onComplete,
  onBack,
  isSubmitting,
}: {
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [orgType, setOrgType] = useState("");

  const orgTypes = [
    { value: "hospital", label: "Hospital", description: "General hospital, specialist hospital, or primary care clinic" },
    { value: "laboratory", label: "Laboratory", description: "Diagnostic lab, testing center" },
    { value: "pharmacy", label: "Pharmacy", description: "Community pharmacy, drug store" },
    { value: "insurance", label: "Insurance Provider", description: "Health insurance company or HMO" },
    { value: "ambulance", label: "Ambulance Service", description: "Emergency medical services" },
    { value: "logistics", label: "Logistics/Delivery", description: "Medical delivery and logistics" },
  ];

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Organization Type
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        What type of organization are you registering?
      </p>

      <div className="space-y-3">
        {orgTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setOrgType(type.value)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              orgType === type.value
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <h3 className="font-semibold text-foreground">{type.label}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{type.description}</p>
          </button>
        ))}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button 
            type="button" 
            variant="hero" 
            onClick={() => onComplete({ organizationType: orgType })} 
            className="flex-1"
            disabled={!orgType}
          >
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

// Step 6: Provider Organization Info (Dynamic based on type)
function StepProviderOrgInfo({
  orgType,
  onComplete,
  onBack,
  isSubmitting,
}: {
  orgType: string;
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const getFields = () => {
    const baseFields = [
      { key: "organizationName", label: "Organization Name", placeholder: "Name" },
      { key: "cacNumber", label: "CAC Number", placeholder: "RC1234567" },
      { key: "contactPerson", label: "Contact Person", placeholder: "Full name" },
      { key: "address", label: "Business Address", placeholder: "Full address" },
      { key: "phone", label: "Phone Number", placeholder: "+234 801 234 5678" },
      { key: "email", label: "Email Address", placeholder: "org@email.com" },
    ];

    const hospitalFields = [
      { key: "yearEstablished", label: "Year Established", placeholder: "e.g., 2010" },
      { key: "tin", label: "TIN", placeholder: "Tax Identification Number" },
      { key: "medicalDirectorName", label: "Medical Director Name", placeholder: "Full name" },
      { key: "medicalDirectorMdcn", label: "Medical Director MDCN Number", placeholder: "MDCN/12345" },
      { key: "ownershipType", label: "Ownership Type", type: "select", options: ["Private", "Public", "Faith-based", "NGO"] },
    ];

    const labFields = [
      { key: "chiefScientistName", label: "Chief Lab Scientist Name", placeholder: "Full name" },
      { key: "mlscnNumber", label: "MLSCN Registration Number", placeholder: "MLSCN/12345" },
    ];

    const pharmacyFields = [
      { key: "superIntendentName", label: "Superintendent Pharmacist Name", placeholder: "Full name" },
      { key: "pcnNumber", label: "PCN License Number", placeholder: "PCN/12345" },
    ];

    const insuranceFields = [
      { key: "naicomNumber", label: "NAICOM Registration Number", placeholder: "NAICOM/12345" },
      { key: "contactPersonRole", label: "Contact Person Role", placeholder: "e.g., CEO, Manager" },
    ];

    const ambulanceFields = [
      { key: "stateCoverage", label: "State Coverage", placeholder: "e.g., Lagos, Ogun" },
    ];

    const logisticsFields = [
      { key: "coverageArea", label: "Coverage Area", placeholder: "e.g., Lagos Island" },
    ];

    let fields = [...baseFields];
    switch (orgType) {
      case "hospital": fields = [...fields, ...hospitalFields]; break;
      case "laboratory": fields = [...fields, ...labFields]; break;
      case "pharmacy": fields = [...fields, ...pharmacyFields]; break;
      case "insurance": fields = [...fields, ...insuranceFields]; break;
      case "ambulance": fields = [...fields, ...ambulanceFields]; break;
      case "logistics": fields = [...fields, ...logisticsFields]; break;
    }
    return fields;
  };

  const fields = getFields();

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const getOrgTypeLabel = () => {
    const labels: Record<string, string> = {
      hospital: "Hospital/Clinic",
      laboratory: "Laboratory",
      pharmacy: "Pharmacy",
      insurance: "Insurance Provider",
      ambulance: "Ambulance Service",
      logistics: "Logistics/Delivery",
    };
    return labels[orgType] || "Organization";
  };

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        {getOrgTypeLabel()} Information
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Tell us about your {getOrgTypeLabel().toLowerCase()}
      </p>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <Label>{field.label}</Label>
            {field.type === "select" ? (
              <select
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
              >
                <option value="">Select</option>
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <Input
                placeholder={field.placeholder}
                className="mt-1.5"
                value={formData[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            )}
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button 
            type="button" 
            variant="hero" 
            onClick={() => onComplete({ ...formData, organizationType: orgType })} 
            className="flex-1"
            disabled={!formData.organizationName || !formData.cacNumber}
          >
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

// Step 7: Provider Services/Ops (Dynamic based on type)
function StepProviderServices({
  orgType,
  onComplete,
  onBack,
  isSubmitting,
}: {
  orgType: string;
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const getFields = () => {
    switch (orgType) {
      case "hospital":
        return [
          { key: "facilityType", label: "Facility Type", type: "select", options: ["Primary Care Clinic", "Secondary Hospital", "Tertiary Hospital", "Specialist Hospital"] },
          { key: "bedCapacity", label: "Bed Capacity", placeholder: "e.g., 50" },
          { key: "operatingHours", label: "Operating Hours", placeholder: "e.g., 8AM - 8PM" },
          { key: "is247", label: "24/7 Service?", type: "select", options: ["Yes", "No"] },
          { key: "servicesOffered", label: "Services Offered (comma separated)", placeholder: "General Practice, Pediatrics, Emergency" },
        ];
      case "laboratory":
        return [
          { key: "testsOffered", label: "Tests Offered (comma separated)", placeholder: "Blood test, X-ray, MRI" },
          { key: "homeCollection", label: "Home Sample Collection?", type: "select", options: ["Yes", "No"] },
          { key: "operatingHours", label: "Operating Hours", placeholder: "e.g., 7AM - 7PM" },
        ];
      case "pharmacy":
        return [
          { key: "deliveryAvailable", label: "Delivery Available?", type: "select", options: ["Yes", "No"] },
          { key: "operatingHours", label: "Operating Hours", placeholder: "e.g., 8AM - 10PM" },
          { key: "coldChain", label: "Cold-chain Capability?", type: "select", options: ["Yes", "No"] },
        ];
      case "insurance":
        return [
          { key: "plansOffered", label: "Insurance Plans (comma separated)", placeholder: "Basic, Premium, Family" },
          { key: "coverageScope", label: "Coverage Scope", placeholder: "e.g., Lagos, Abuja" },
          { key: "apiEnabled", label: "API Integration Available?", type: "select", options: ["Yes", "No"] },
          { key: "claimsTurnaround", label: "Claims Turnaround (days)", placeholder: "e.g., 7" },
        ];
      case "ambulance":
        return [
          { key: "ambulanceCount", label: "Number of Ambulances", placeholder: "e.g., 5" },
          { key: "alsAvailable", label: "Advanced Life Support?", type: "select", options: ["Yes", "No"] },
          { key: "gpsTracking", label: "GPS Tracking?", type: "select", options: ["Yes", "No"] },
          { key: "avgResponseTime", label: "Average Response Time (mins)", placeholder: "e.g., 15" },
        ];
      case "logistics":
        return [
          { key: "vehicleTypes", label: "Vehicle Types (comma separated)", placeholder: "Bike, Van, Truck" },
          { key: "coldChain", label: "Cold-chain Delivery?", type: "select", options: ["Yes", "No"] },
          { key: "gpsTracking", label: "GPS Tracking?", type: "select", options: ["Yes", "No"] },
          { key: "sameDayDelivery", label: "Same-day Delivery?", type: "select", options: ["Yes", "No"] },
        ];
      default:
        return [];
    }
  };

  const fields = getFields();
  const isRequired = fields.length > 0;

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Services & Operations
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Tell us about your services
      </p>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <Label>{field.label}</Label>
            {field.type === "select" ? (
              <select
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2"
                value={(formData[field.key] as string) || ""}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
              >
                <option value="">Select</option>
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <Input
                placeholder={field.placeholder}
                className="mt-1.5"
                value={(formData[field.key] as string) || ""}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
              />
            )}
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button 
            type="button" 
            variant="hero" 
            onClick={() => onComplete(formData)} 
            className="flex-1"
            disabled={isRequired && fields.some(f => !formData[f.key])}
          >
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

// Step 8: Provider Certifications (Dynamic based on type)
function StepProviderCertifications({
  orgType,
  onComplete,
  onBack,
  isSubmitting,
}: {
  orgType: string;
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState<Record<string, File | null>>({});

  const getRequiredDocs = () => {
    switch (orgType) {
      case "hospital":
        return [
          { key: "stateLicense", label: "State Ministry of Health License" },
          { key: "operatingLicense", label: "Hospital Operating License" },
          { key: "cacCertificate", label: "CAC Certificate" },
          { key: "taxClearance", label: "Tax Clearance Certificate" },
          { key: "mdcnLicense", label: "Medical Director MDCN License" },
        ];
      case "laboratory":
        return [
          { key: "mlscnLicense", label: "MLSCN License" },
          { key: "practiceLicense", label: "Practice License (Current Year)" },
          { key: "cacCertificate", label: "CAC Certificate" },
          { key: "tin", label: "Tax Identification Number" },
        ];
      case "pharmacy":
        return [
          { key: "pcnLicense", label: "PCN License" },
          { key: "superIntendentLicense", label: "Superintendent Pharmacist License" },
          { key: "premisesLicense", label: "Annual Premises License" },
          { key: "cacCertificate", label: "CAC Certificate" },
          { key: "tin", label: "Tax Identification Number" },
        ];
      case "insurance":
        return [
          { key: "naicomLicense", label: "NAICOM License" },
          { key: "cacCertificate", label: "CAC Certificate" },
          { key: "taxClearance", label: "Tax Clearance Certificate" },
        ];
      case "ambulance":
        return [
          { key: "stateApproval", label: "State Ministry of Health Approval" },
          { key: "ambulanceLicense", label: "Ambulance Service License" },
          { key: "vehicleRegistration", label: "Vehicle Registration Papers" },
        ];
      case "logistics":
        return [
          { key: "cacCertificate", label: "CAC Certificate" },
          { key: "tin", label: "Tax Identification Number" },
          { key: "companyInsurance", label: "Company Insurance (Public Liability)" },
        ];
      default:
        return [];
    }
  };

  const docs = getRequiredDocs();

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Certifications & Documents
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Upload your required certifications
      </p>

      <div className="space-y-4">
        {docs.map((doc) => (
          <div key={doc.key}>
            <Label>{doc.label}</Label>
            <Input
              type="file"
              accept="image/*,.pdf"
              className="mt-1.5"
              onChange={(e) => setFormData({ ...formData, [doc.key]: e.target.files?.[0] || null })}
            />
            {formData[doc.key] && <p className="mt-1 text-xs text-green-600">✓ {formData[doc.key]?.name}</p>}
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button 
            type="button" 
            variant="hero" 
            onClick={() => onComplete(formData)} 
            className="flex-1"
            disabled={docs.length > 0 && docs.some(d => !formData[d.key])}
          >
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

// Step 9: Provider Banking
function StepProviderBanking({
  onComplete,
  onBack,
  isSubmitting,
}: {
  onComplete: (d: Record<string, unknown>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    bvn: "",
  });

  return (
    <StepWrapper>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Banking Details
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Your bank details for receiving payments
      </p>

      <div className="space-y-4">
        <div>
          <Label>Bank Name</Label>
          <Input
            placeholder="e.g., Guaranty Trust Bank"
            className="mt-1.5"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          />
        </div>

        <div>
          <Label>Account Name</Label>
          <Input
            placeholder="As it appears on your bank account"
            className="mt-1.5"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
          />
        </div>

        <div>
          <Label>Account Number</Label>
          <Input
            placeholder="10-digit account number"
            className="mt-1.5"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
          />
        </div>

        <div>
          <Label>BVN (for corporate signatory)</Label>
          <Input
            placeholder="11-digit BVN"
            className="mt-1.5"
            value={formData.bvn}
            onChange={(e) => setFormData({ ...formData, bvn: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button 
            type="button" 
            variant="hero" 
            onClick={() => onComplete(formData)} 
            className="flex-1"
            disabled={!formData.bankName || !formData.accountName || !formData.accountNumber}
          >
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

export default Register;
