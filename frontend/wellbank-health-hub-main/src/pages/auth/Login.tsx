import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiService } from "@/lib/api-service";
import wellbankLogo from "@/assets/wellbank-logo.jpeg";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(1, "Password is required").max(128),
});

const resumeSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
});

type LoginForm = z.infer<typeof loginSchema>;
type ResumeForm = z.infer<typeof resumeSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerResume,
    handleSubmit: handleResumeSubmit,
    formState: { errors: resumeErrors },
  } = useForm<ResumeForm>({
    resolver: zodResolver(resumeSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({ title: "Welcome back! 👋" });
      navigate("/dashboard");
    } catch {
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResume = async (data: ResumeForm) => {
    setIsResuming(true);
    try {
      const res = await apiService.auth.resumeRegistration({ email: data.email });
      if (res.status === 'success') {
        navigate(`/register?email=${encodeURIComponent(data.email)}`);
      } else {
        toast({
          title: "No registration found",
          description: "Start a new registration instead.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not resume registration.",
        variant: "destructive",
      });
    } finally {
      setIsResuming(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left branding panel */}
      <div className="hidden w-[420px] shrink-0 flex-col justify-between gradient-primary p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <img src={wellbankLogo} alt="WellBank" className="h-9 w-9 rounded-lg object-cover" />
          <span className="text-xl font-bold text-primary-foreground">WellBank</span>
        </Link>
        <div>
          <h2 className="mb-3 text-2xl font-bold text-primary-foreground">
            Welcome back
          </h2>
          <p className="text-primary-foreground/80">
            Access your healthcare dashboard, wallet, and appointments.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">© 2026 WellBank</p>
      </div>

      {/* Form */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <img src={wellbankLogo} alt="WellBank" className="h-7 w-7 rounded object-cover" />
            <span className="font-bold text-foreground">WellBank</span>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-8">
          <h1 className="mb-1 text-2xl font-bold text-foreground">Sign In</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  className="pl-10"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>

          {!showResume && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Started registration before?{" "}
              <button
                type="button"
                onClick={() => setShowResume(true)}
                className="text-primary hover:underline"
              >
                Continue registration
              </button>
            </p>
          )}

          {showResume && (
            <div className="mt-6 rounded-lg border border-border p-4">
              <h3 className="mb-3 text-sm font-medium">Continue your registration</h3>
              <form onSubmit={handleResumeSubmit(onResume)} className="space-y-3">
                <div>
                  <Label htmlFor="resumeEmail">Email used during registration</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="resumeEmail"
                      type="email"
                      placeholder="you@email.com"
                      className="pl-10"
                      {...registerResume("email")}
                    />
                  </div>
                  {resumeErrors.email && (
                    <p className="mt-1 text-xs text-destructive">{resumeErrors.email.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowResume(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="hero"
                    className="flex-1"
                    disabled={isResuming}
                  >
                    {isResuming ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        Continue <ArrowRight className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
