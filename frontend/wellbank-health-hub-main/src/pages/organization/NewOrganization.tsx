import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, ArrowLeft, Check, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { mockApi } from "@/lib/mock-api";
import StepIndicator from "@/components/onboarding/StepIndicator";
import MultiInput from "@/components/onboarding/MultiInput";
import FileUpload from "@/components/onboarding/FileUpload";
import {
  NIGERIAN_STATES, STATE_LGAS, NIGERIAN_BANKS, ORGANIZATION_TYPES,
  FACILITY_TYPES, OWNERSHIP_TYPES, AMBULANCE_TYPES, VEHICLE_TYPES,
} from "@/lib/constants";
import type { OrganizationType } from "@/lib/types";

const steps = [
  { number: 1, title: "Basic Info" },
  { number: 2, title: "Details" },
  { number: 3, title: "Documents" },
  { number: 4, title: "Banking" },
  { number: 5, title: "Compliance" },
];

const basicSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  type: z.string().min(1, "Required"),
  description: z.string().trim().min(10, "Describe your organization").max(1000),
  email: z.string().trim().email("Invalid email").max(255),
  phoneNumber: z.string().trim().min(10, "Required").max(15),
  contactPerson: z.string().trim().min(1, "Required").max(100),
  street: z.string().trim().min(1, "Required").max(200),
  city: z.string().trim().min(1, "Required").max(100),
  state: z.string().min(1, "Required"),
  lga: z.string().optional(),
  cacNumber: z.string().trim().min(1, "Required").max(50),
  tin: z.string().trim().min(1, "Required").max(50),
});

const bankSchema = z.object({
  bankName: z.string().min(1, "Required"),
  accountName: z.string().trim().min(1, "Required").max(100),
  accountNumber: z.string().trim().length(10, "10 digits"),
  bvn: z.string().trim().length(11, "11 digits"),
  settlementFrequency: z.enum(["daily", "weekly"], { required_error: "Required" }),
});

const complianceSchema = z.object({
  dataPrivacyAgreed: z.boolean().refine((v) => v, "Required"),
  termsAccepted: z.boolean().refine((v) => v, "Required"),
  antiFraudDeclared: z.boolean().refine((v) => v, "Required"),
  slaAccepted: z.boolean().refine((v) => v, "Required"),
});

export default function NewOrganization() {
  const [searchParams] = useSearchParams();
  const isAddingRole = searchParams.get("addingRole") === "true";
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Type-specific state
  const [services, setServices] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [hmosAccepted, setHmosAccepted] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [ambulanceTypes, setAmbulanceTypes] = useState<string[]>([]);

  // Toggles for hospital
  const [hasOperatingTheatre, setHasOperatingTheatre] = useState(false);
  const [hasICU, setHasICU] = useState(false);
  const [hasPharmacy, setHasPharmacy] = useState(false);
  const [hasLaboratory, setHasLaboratory] = useState(false);
  const [hasAmbulance, setHasAmbulance] = useState(false);
  const [hasEmergencyRoom, setHasEmergencyRoom] = useState(false);
  const [is24Hours, setIs24Hours] = useState(false);
  const [acceptsInsurance, setAcceptsInsurance] = useState(false);

  // Lab/Pharmacy/Logistics toggles
  const [homeSampleCollection, setHomeSampleCollection] = useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [coldChainCapability, setColdChainCapability] = useState(false);
  const [handlesControlledDrugs, setHandlesControlledDrugs] = useState(false);
  const [gpsTracking, setGpsTracking] = useState(false);
  const [coldChainDelivery, setColdChainDelivery] = useState(false);
  const [sameDayDelivery, setSameDayDelivery] = useState(false);
  const [apiEnabled, setApiEnabled] = useState(false);

  // Document uploads
  const [docs, setDocs] = useState<Record<string, File | null>>({});
  const setDoc = (key: string, file: File | null) => setDocs((prev) => ({ ...prev, [key]: file }));

  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const { toast } = useToast();

  const basicForm = useForm({ resolver: zodResolver(basicSchema), defaultValues: {
    name: "", type: "", description: "", email: "", phoneNumber: "", contactPerson: "",
    street: "", city: "", state: "", lga: "", cacNumber: "", tin: "",
  }});
  const bankForm = useForm({ resolver: zodResolver(bankSchema), defaultValues: {
    bankName: "", accountName: "", accountNumber: "", bvn: "", settlementFrequency: undefined as any,
  }});
  const complianceForm = useForm({ resolver: zodResolver(complianceSchema), defaultValues: {
    dataPrivacyAgreed: false, termsAccepted: false, antiFraudDeclared: false, slaAccepted: false,
  }});

  const orgType = basicForm.watch("type") as OrganizationType;
  const watchState = basicForm.watch("state");

  const goNext = async () => {
    let valid = false;
    if (step === 1) valid = await basicForm.trigger();
    else if (step === 2) valid = true;
    else if (step === 3) valid = true;
    else if (step === 4) valid = await bankForm.trigger();
    else valid = true;
    if (valid) setStep((s) => Math.min(s + 1, 5));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    const compValid = await complianceForm.trigger();
    if (!compValid) return;
    setIsSubmitting(true);
    try {
      const b = basicForm.getValues();
      const bank = bankForm.getValues();
      const comp = complianceForm.getValues();

      await mockApi.organizations.create({
        name: b.name, type: b.type as OrganizationType, description: b.description,
        email: b.email, phoneNumber: b.phoneNumber, contactPerson: b.contactPerson,
        address: { street: b.street, city: b.city, state: b.state, lga: b.lga, country: "Nigeria" },
        cacNumber: b.cacNumber, tin: b.tin,
        bankName: bank.bankName, accountName: bank.accountName,
        accountNumber: bank.accountNumber, bvn: bank.bvn,
        settlementFrequency: bank.settlementFrequency,
        dataPrivacyAgreed: comp.dataPrivacyAgreed, termsAccepted: comp.termsAccepted,
        antiFraudDeclared: comp.antiFraudDeclared, slaAccepted: comp.slaAccepted,
        services, departments, hmosAccepted,
        hasOperatingTheatre, hasICU, hasPharmacy, hasLaboratory, hasAmbulance,
        hasEmergencyRoom, is24Hours, acceptsInsurance,
        homeSampleCollection, deliveryAvailable, coldChainCapability, handlesControlledDrugs,
        gpsTracking, coldChainDelivery, sameDayDelivery, apiEnabled,
        productTypes, vehicleTypes, ambulanceTypes,
      });

      toast({ title: "Organization Created! 🏥", description: "Status: Pending Review" });
      if (isAddingRole) {
        await switchRole("provider_admin");
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
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Organization</h1>
            <p className="text-sm text-muted-foreground">Register your healthcare organization on WellBank</p>
          </div>
        </div>

        <StepIndicator steps={steps} currentStep={step} />

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Organization Information</h2>
            <div>
              <Label>Organization Name</Label>
              <Input className="mt-1" placeholder="e.g. Lagos General Hospital" {...basicForm.register("name")} />
              {basicForm.formState.errors.name && <p className="mt-1 text-xs text-destructive">{basicForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label>Type</Label>
              <Controller control={basicForm.control} name="type" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{ORGANIZATION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {basicForm.formState.errors.type && <p className="mt-1 text-xs text-destructive">{basicForm.formState.errors.type.message}</p>}
            </div>
            <div><Label>Description</Label><Textarea className="mt-1" rows={3} {...basicForm.register("description")} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input className="mt-1" type="email" {...basicForm.register("email")} /></div>
              <div><Label>Phone</Label><Input className="mt-1" {...basicForm.register("phoneNumber")} /></div>
            </div>
            <div><Label>Contact Person</Label><Input className="mt-1" {...basicForm.register("contactPerson")} /></div>
            <div><Label>Street Address</Label><Input className="mt-1" {...basicForm.register("street")} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>City</Label><Input className="mt-1" {...basicForm.register("city")} /></div>
              <div>
                <Label>State</Label>
                <Controller control={basicForm.control} name="state" render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => { field.onChange(v); basicForm.setValue("lga", ""); }}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{NIGERIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>LGA</Label>
                <Controller control={basicForm.control} name="lga" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!watchState || !STATE_LGAS[watchState]}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select LGA" /></SelectTrigger>
                    <SelectContent>{(STATE_LGAS[watchState] || []).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </div>
              <div><Label>CAC Number</Label><Input className="mt-1" {...basicForm.register("cacNumber")} /></div>
            </div>
            <div><Label>TIN</Label><Input className="mt-1" {...basicForm.register("tin")} /></div>
          </div>
        )}

        {/* Step 2: Type-specific Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              {orgType === "hospital" && "Hospital Details"}
              {orgType === "laboratory" && "Laboratory Details"}
              {orgType === "pharmacy" && "Pharmacy Details"}
              {orgType === "insurance" && "Insurance Details"}
              {orgType === "emergency" && "Emergency Service Details"}
              {orgType === "logistics" && "Logistics Details"}
              {(orgType === "clinic" || !orgType) && "Additional Details"}
            </h2>

            {/* Hospital */}
            {(orgType === "hospital" || orgType === "clinic") && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Ownership Type</Label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{OWNERSHIP_TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Facility Type</Label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{FACILITY_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Bed Capacity</Label><Input type="number" className="mt-1" /></div>
                  <div><Label>Consulting Rooms</Label><Input type="number" className="mt-1" /></div>
                  <div><Label>Avg Daily Patients</Label><Input type="number" className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Operating Theatre", hasOperatingTheatre, setHasOperatingTheatre],
                    ["ICU", hasICU, setHasICU],
                    ["Pharmacy", hasPharmacy, setHasPharmacy],
                    ["Laboratory", hasLaboratory, setHasLaboratory],
                    ["Ambulance", hasAmbulance, setHasAmbulance],
                    ["Emergency Room", hasEmergencyRoom, setHasEmergencyRoom],
                    ["24 Hours", is24Hours, setIs24Hours],
                    ["Accepts Insurance", acceptsInsurance, setAcceptsInsurance],
                  ].map(([label, val, setter]) => (
                    <div key={label as string} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <Label>{label as string}</Label>
                      <Switch checked={val as boolean} onCheckedChange={setter as (v: boolean) => void} />
                    </div>
                  ))}
                </div>
                <MultiInput label="Services" values={services} onChange={setServices} placeholder="e.g. Emergency, Surgery" />
                <MultiInput label="Departments" values={departments} onChange={setDepartments} placeholder="e.g. Cardiology" />
                {acceptsInsurance && <MultiInput label="HMOs Accepted" values={hmosAccepted} onChange={setHmosAccepted} placeholder="e.g. AXA Mansard" />}
              </>
            )}

            {/* Laboratory */}
            {orgType === "laboratory" && (
              <>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <Label>Home Sample Collection</Label>
                  <Switch checked={homeSampleCollection} onCheckedChange={setHomeSampleCollection} />
                </div>
                <MultiInput label="Tests/Services Offered" values={services} onChange={setServices} placeholder="e.g. Complete Blood Count" />
                <div><Label>Chief Lab Scientist Name</Label><Input className="mt-1" /></div>
                <div><Label>Chief Lab Scientist MLSN Number</Label><Input className="mt-1" /></div>
              </>
            )}

            {/* Pharmacy */}
            {orgType === "pharmacy" && (
              <>
                <div><Label>Superintendent Pharmacist Name</Label><Input className="mt-1" /></div>
                <div><Label>Superintendent Pharmacist License</Label><Input className="mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Delivery Available", deliveryAvailable, setDeliveryAvailable],
                    ["Cold Chain", coldChainCapability, setColdChainCapability],
                    ["Controlled Drugs", handlesControlledDrugs, setHandlesControlledDrugs],
                  ].map(([label, val, setter]) => (
                    <div key={label as string} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <Label>{label as string}</Label>
                      <Switch checked={val as boolean} onCheckedChange={setter as (v: boolean) => void} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Insurance */}
            {orgType === "insurance" && (
              <>
                <div><Label>NAICOM Number</Label><Input className="mt-1" /></div>
                <MultiInput label="Product Types" values={productTypes} onChange={setProductTypes} placeholder="e.g. Health Insurance" />
                <div><Label>Coverage Scope</Label><Textarea className="mt-1" rows={3} /></div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <Label>API Enabled</Label>
                  <Switch checked={apiEnabled} onCheckedChange={setApiEnabled} />
                </div>
                <div><Label>Claims Turnaround (Days)</Label><Input type="number" className="mt-1" /></div>
              </>
            )}

            {/* Emergency */}
            {orgType === "emergency" && (
              <>
                <div><Label>Coverage Area</Label><Input className="mt-1" placeholder="e.g. Lagos Mainland" /></div>
                <div><Label>Ambulance Count</Label><Input type="number" className="mt-1" /></div>
                <div>
                  <Label>Ambulance Types</Label>
                  <div className="mt-2 flex gap-4">
                    {AMBULANCE_TYPES.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Checkbox checked={ambulanceTypes.includes(t)} onCheckedChange={() => setAmbulanceTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])} />
                        <Label className="cursor-pointer">{t}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <Label>GPS Tracking</Label>
                  <Switch checked={gpsTracking} onCheckedChange={setGpsTracking} />
                </div>
                <div><Label>Average Response Time</Label><Input className="mt-1" placeholder="e.g. 15 minutes" /></div>
              </>
            )}

            {/* Logistics */}
            {orgType === "logistics" && (
              <>
                <div><Label>Coverage Area</Label><Input className="mt-1" /></div>
                <div>
                  <Label>Vehicle Types</Label>
                  <div className="mt-2 flex gap-4">
                    {VEHICLE_TYPES.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Checkbox checked={vehicleTypes.includes(t)} onCheckedChange={() => setVehicleTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])} />
                        <Label className="cursor-pointer">{t}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Cold Chain Delivery", coldChainDelivery, setColdChainDelivery],
                    ["GPS Tracking", gpsTracking, setGpsTracking],
                    ["Same-Day Delivery", sameDayDelivery, setSameDayDelivery],
                  ].map(([label, val, setter]) => (
                    <div key={label as string} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <Label>{label as string}</Label>
                      <Switch checked={val as boolean} onCheckedChange={setter as (v: boolean) => void} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Document Uploads</h2>
            <FileUpload label="CAC Certificate" value={docs.cacCert || null} onChange={(f) => setDoc("cacCert", f)} required />
            <FileUpload label="Tax Clearance" value={docs.taxClearance || null} onChange={(f) => setDoc("taxClearance", f)} required />
            <FileUpload label="Logo" value={docs.logo || null} onChange={(f) => setDoc("logo", f)} accept=".jpg,.jpeg,.png" description="Optional" />

            {(orgType === "hospital" || orgType === "clinic") && (
              <>
                <FileUpload label="State Health License" value={docs.healthLicense || null} onChange={(f) => setDoc("healthLicense", f)} required />
                <FileUpload label="Operating License" value={docs.operatingLicense || null} onChange={(f) => setDoc("operatingLicense", f)} required />
                <FileUpload label="Environmental Permit" value={docs.envPermit || null} onChange={(f) => setDoc("envPermit", f)} />
                <FileUpload label="Medical Director License" value={docs.mdLicense || null} onChange={(f) => setDoc("mdLicense", f)} required />
                <div><Label>Medical Director Name</Label><Input className="mt-1" /></div>
                <div><Label>Medical Director MDCN</Label><Input className="mt-1" /></div>
              </>
            )}

            {orgType === "laboratory" && (
              <>
                <FileUpload label="MLSCN License" value={docs.mlscn || null} onChange={(f) => setDoc("mlscn", f)} required description="Medical Laboratory Science Council" />
                <FileUpload label="Practice License" value={docs.practiceLicense || null} onChange={(f) => setDoc("practiceLicense", f)} required />
                <FileUpload label="Environmental Permit" value={docs.envPermit || null} onChange={(f) => setDoc("envPermit", f)} />
                <FileUpload label="ISO Certification" value={docs.iso || null} onChange={(f) => setDoc("iso", f)} description="Optional" />
              </>
            )}

            {orgType === "pharmacy" && (
              <>
                <FileUpload label="PCN License" value={docs.pcn || null} onChange={(f) => setDoc("pcn", f)} required description="Pharmacists Council of Nigeria" />
                <FileUpload label="Superintendent License" value={docs.superLicense || null} onChange={(f) => setDoc("superLicense", f)} required />
                <FileUpload label="Premises License" value={docs.premises || null} onChange={(f) => setDoc("premises", f)} required />
              </>
            )}

            {orgType === "insurance" && (
              <>
                <FileUpload label="NAICOM License" value={docs.naicom || null} onChange={(f) => setDoc("naicom", f)} required />
                <FileUpload label="HMO License" value={docs.hmo || null} onChange={(f) => setDoc("hmo", f)} description="If applicable" />
              </>
            )}

            {orgType === "emergency" && (
              <>
                <FileUpload label="State Ministry Approval" value={docs.stateApproval || null} onChange={(f) => setDoc("stateApproval", f)} required />
                <FileUpload label="Ambulance Service License" value={docs.ambulanceLicense || null} onChange={(f) => setDoc("ambulanceLicense", f)} required />
                <FileUpload label="Vehicle Registrations" value={docs.vehicleReg || null} onChange={(f) => setDoc("vehicleReg", f)} required />
                <FileUpload label="Road Worthiness" value={docs.roadWorthiness || null} onChange={(f) => setDoc("roadWorthiness", f)} />
                <FileUpload label="Paramedic Certification" value={docs.paramedic || null} onChange={(f) => setDoc("paramedic", f)} />
              </>
            )}

            {orgType === "logistics" && (
              <>
                <FileUpload label="Company Insurance" value={docs.companyInsurance || null} onChange={(f) => setDoc("companyInsurance", f)} required />
                <FileUpload label="Driver License (sample)" value={docs.driverLicense || null} onChange={(f) => setDoc("driverLicense", f)} />
                <FileUpload label="Vehicle Registration" value={docs.vehicleReg || null} onChange={(f) => setDoc("vehicleReg", f)} />
              </>
            )}
          </div>
        )}

        {/* Step 4: Banking */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Banking & Settlement</h2>
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
            <div><Label>Account Name</Label><Input className="mt-1" {...bankForm.register("accountName")} />
              {bankForm.formState.errors.accountName && <p className="mt-1 text-xs text-destructive">{bankForm.formState.errors.accountName.message}</p>}
            </div>
            <div><Label>Account Number</Label><Input className="mt-1" maxLength={10} {...bankForm.register("accountNumber")} />
              {bankForm.formState.errors.accountNumber && <p className="mt-1 text-xs text-destructive">{bankForm.formState.errors.accountNumber.message}</p>}
            </div>
            <div><Label>BVN (Corporate Signatory)</Label><Input className="mt-1" maxLength={11} {...bankForm.register("bvn")} />
              {bankForm.formState.errors.bvn && <p className="mt-1 text-xs text-destructive">{bankForm.formState.errors.bvn.message}</p>}
            </div>
            <div>
              <Label>Settlement Frequency</Label>
              <Controller control={bankForm.control} name="settlementFrequency" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>
        )}

        {/* Step 5: Compliance */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Compliance & Declaration</h2>
            <p className="text-sm text-muted-foreground">Please review and accept the following agreements</p>
            {[
              { name: "dataPrivacyAgreed" as const, label: "I agree to the Data Privacy Agreement (NDPR Compliance)" },
              { name: "termsAccepted" as const, label: "I accept the Terms & Conditions" },
              { name: "antiFraudDeclared" as const, label: "I declare the Anti-Fraud Declaration" },
              { name: "slaAccepted" as const, label: "I accept the Service Level Agreement (SLA)" },
            ].map(({ name, label }) => (
              <Controller key={name} control={complianceForm.control} name={name} render={({ field }) => (
                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} id={name} className="mt-0.5" />
                  <Label htmlFor={name} className="cursor-pointer leading-relaxed">{label}</Label>
                </div>
              )} />
            ))}
            {complianceForm.formState.errors.dataPrivacyAgreed && <p className="text-xs text-destructive">All agreements are required</p>}
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
              {isSubmitting ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Creating...</> : <>Create Organization <Check className="ml-1 h-4 w-4" /></>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
