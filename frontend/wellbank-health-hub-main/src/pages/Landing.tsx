import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Stethoscope,
  FlaskConical,
  Pill,
  Shield,
  Ambulance,
  ArrowRight,
  Wallet,
  Star,
  Zap,
  User,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import wellbankLogo from "@/assets/wellbank-logo.jpeg";

const roles = [
  {
    title: "Patient",
    description: "Find doctors, book tests, order medication",
    icon: User,
    href: "/register?role=patient",
  },
  {
    title: "Doctor",
    description: "Manage consultations and grow your practice",
    icon: Stethoscope,
    href: "/register?role=doctor",
  },
  {
    title: "Provider Admin",
    description: "Create and manage healthcare organizations",
    icon: Building2,
    href: "/register?role=provider_admin",
  },
];

const features = [
  { icon: Stethoscope, title: "Doctor Discovery", description: "Find specialists, book video or in-person consultations" },
  { icon: FlaskConical, title: "Lab Tests", description: "Order tests with home sample collection" },
  { icon: Pill, title: "Pharmacy", description: "Order medication with doorstep delivery" },
  { icon: Wallet, title: "Digital Wallet", description: "One wallet for all healthcare payments" },
  { icon: Shield, title: "Insurance", description: "Link policies for seamless coverage" },
  { icon: Ambulance, title: "Emergency", description: "One-tap ambulance dispatch with GPS tracking" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={wellbankLogo} alt="WellBank" className="h-9 w-9 rounded-lg object-cover" />
            <span className="text-xl font-bold text-foreground">
              Well<span className="text-wellbank-navy dark:text-primary">Bank</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="Healthcare network across Africa" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
                <Zap className="h-3.5 w-3.5" />
                Healthcare, reimagined for Africa
              </div>
            </motion.div>
            <motion.h1
              className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
            >
              Your Health,{" "}<span className="text-gradient">One Platform</span>
            </motion.h1>
            <motion.p
              className="mb-10 text-lg text-muted-foreground sm:text-xl"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            >
              Connect with doctors, labs, pharmacies, and emergency services — all coordinated through a single digital wallet.
            </motion.p>
            <motion.div
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45 }}
            >
              <Button variant="hero" size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/register">Create Free Account <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button variant="hero-outline" size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="mb-14 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              Everything you need, <span className="text-primary">in one place</span>
            </h2>
            <p className="text-muted-foreground">From consultation to medication delivery — WellBank coordinates it all.</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:gradient-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="mb-14 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              Join as a <span className="text-gradient">Patient or Provider</span>
            </h2>
            <p className="text-muted-foreground">Select your role to get started</p>
          </motion.div>
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
            {roles.map((role, i) => (
              <motion.div key={role.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Link
                  to={role.href}
                  className="group flex items-start gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-glow"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
                    <role.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold text-foreground">{role.title}</h3>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-t border-border py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8 flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-5 w-5 fill-accent text-accent" />
            ))}
          </div>
          <p className="mx-auto max-w-md text-muted-foreground">
            Trusted by patients and healthcare providers across Nigeria.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-10 text-muted-foreground/60">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">5,000+</p>
              <p className="text-xs">Patients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">200+</p>
              <p className="text-xs">Providers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">₦50M+</p>
              <p className="text-xs">Transactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex items-center justify-between px-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={wellbankLogo} alt="WellBank" className="h-6 w-6 rounded object-cover" />
            <span>WellBank © 2026</span>
          </div>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
