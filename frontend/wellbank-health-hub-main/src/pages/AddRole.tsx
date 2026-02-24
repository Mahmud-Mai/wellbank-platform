import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, User, Stethoscope, Building2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/types";

const allRoles: { value: UserRole; label: string; description: string; icon: typeof User; onboardingPath: string }[] = [
  { value: "patient", label: "Patient", description: "Access healthcare services, book consultations", icon: User, onboardingPath: "/onboarding/patient?addingRole=true" },
  { value: "doctor", label: "Doctor", description: "Provide consultations and manage your practice", icon: Stethoscope, onboardingPath: "/onboarding/doctor?addingRole=true" },
  { value: "provider_admin", label: "Provider Admin", description: "Create and manage healthcare organizations", icon: Building2, onboardingPath: "/organization/new?addingRole=true" },
];

export default function AddRole() {
  const [isAdding, setIsAdding] = useState(false);
  const { user, addRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const availableRoles = allRoles.filter((r) => !user?.roles.includes(r.value));

  const handleAddRole = async (role: typeof allRoles[0]) => {
    setIsAdding(true);
    try {
      await addRole(role.value);
      toast({ title: `${role.label} role added! ✅`, description: "Complete your onboarding to get started." });
      navigate(role.onboardingPath);
    } catch {
      toast({ title: "Failed to add role", variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  if (availableRoles.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Check className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h2 className="text-xl font-bold text-foreground">All Roles Active</h2>
          <p className="mt-2 text-muted-foreground">You already have all available roles.</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-6">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="mx-auto w-full max-w-lg px-4 py-12">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Add a New Role</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Expand your WellBank experience by adding another role to your account
        </p>

        <div className="space-y-3">
          {availableRoles.map((role) => (
            <button
              key={role.value}
              onClick={() => handleAddRole(role)}
              disabled={isAdding}
              className="group flex w-full items-start gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:shadow-glow disabled:opacity-50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
                <role.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{role.label}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{role.description}</p>
              </div>
              {isAdding ? (
                <Loader2 className="mt-1 h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              )}
            </button>
          ))}
        </div>

        <Button variant="outline" onClick={() => navigate("/dashboard")} className="mt-8 w-full">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
