import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X, Star, Save } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useProposalStore, Group, Member } from "@/lib/proposalStore";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoanDetails = {
  loanValue: string;
  loanType: string;
  interestRate: string;
  installments: string;
  firstPaymentDate: string;
  gracePeriod: string;
  loanGoal: string;
  otherGoal: string;
  borrowerInsurance: string;
  optionalInsurance1: string;
  optionalInsurance2: string;
  optionalInsurance3: string;
};

type LoanDetailsErrors = Partial<Record<keyof LoanDetails, string>>;

const parseCurrency = (value: string): number => {
  const digits = value.replace(/[^\d.]/g, "");
  return parseFloat(digits) || 0;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDateInput = (d: Date) => d.toISOString().slice(0, 10);

const createEmptyLoanDetails = (): LoanDetails => ({
  loanValue: formatCurrency(0),
  loanType: "working-capital",
  interestRate: "14",
  installments: "",
  firstPaymentDate: "",
  gracePeriod: "0",
  loanGoal: "",
  otherGoal: "",
  borrowerInsurance: "yes",
  optionalInsurance1: "None",
  optionalInsurance2: "None",
  optionalInsurance3: "None",
});

export default function ProductConfigScreen() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const { updateProposal, getProposalById } = useProposalStore();
  const [group, setGroup] = useState<Group | null>(null);
  const [activeMemberId, setActiveMemberId] = useState<number | null>(null);

  const [loanDetails, setLoanDetails] = useState<LoanDetails>(createEmptyLoanDetails());
  const [errors, setErrors] = useState<LoanDetailsErrors>({});

  const proposalId = params.id;
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 60);

  useEffect(() => {
    if (!proposalId) return;
    const proposal = getProposalById(proposalId);
    if (proposal) {
      setGroup(proposal.data.group);
      const leaderId = proposal.data.group.leaderId || proposal.data.group.members[0].id;
      setActiveMemberId(leaderId);
    }
  }, [proposalId, getProposalById]);

  // Sync loan value when active member changes or group loads
  useEffect(() => {
    if (!group || activeMemberId === null) return;
    const member = group.members.find(m => m.id === activeMemberId);
    if (member) {
      const amount = parseCurrency(member.requestedAmount);
      setLoanDetails(prev => ({
        ...prev,
        loanValue: formatCurrency(amount)
      }));
    }
  }, [activeMemberId, group]);

  // Auto-calculate grace period
  useEffect(() => {
    if (!loanDetails.firstPaymentDate) return;
    const selected = new Date(loanDetails.firstPaymentDate + "T00:00:00");
    const diffMs = selected.getTime() - today.getTime();
    const diffDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    setLoanDetails(prev => ({
      ...prev,
      gracePeriod: String(diffDays),
    }));
  }, [loanDetails.firstPaymentDate]);

  const handleLoanFieldChange = (field: keyof LoanDetails, value: string) => {
    setLoanDetails(prev => {
      const next = { ...prev, [field]: value };
      
      // Conditional logic for goals
      if (field === "loanGoal" && value !== "other") {
        next.otherGoal = "";
      }

      // Conditional logic for insurances
      if (field === "optionalInsurance1" && value === "None") {
        next.optionalInsurance2 = "None";
        next.optionalInsurance3 = "None";
      }
      if (field === "optionalInsurance2" && value === "None") {
        next.optionalInsurance3 = "None";
      }

      return next;
    });
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const adjustLoanValue = (delta: number) => {
    const current = parseCurrency(loanDetails.loanValue || "0");
    let next = current + delta;
    if (next < 500) next = 500;
    if (next > 50000) next = 50000;
    setLoanDetails(prev => ({
      ...prev,
      loanValue: formatCurrency(next),
    }));
    setErrors(prev => ({ ...prev, loanValue: undefined }));
  };

  const validateLoanDetails = (): boolean => {
    const newErrors: LoanDetailsErrors = {};
    const amount = parseCurrency(loanDetails.loanValue);

    if (amount < 500 || amount > 50000) {
      newErrors.loanValue = "Loan value must be between $500 and $50,000";
    }

    if (!loanDetails.loanType) newErrors.loanType = "This field is required";
    if (!loanDetails.installments) newErrors.installments = "This field is required";
    if (!loanDetails.loanGoal) newErrors.loanGoal = "This field is required";
    if (loanDetails.loanGoal === "other" && !loanDetails.otherGoal) {
      newErrors.otherGoal = "Please specify the goal";
    }
    if (!loanDetails.borrowerInsurance) newErrors.borrowerInsurance = "This field is required";

    if (!loanDetails.firstPaymentDate) {
      newErrors.firstPaymentDate = "This field is required";
    } else {
      const selected = new Date(loanDetails.firstPaymentDate + "T00:00:00");
      const day = selected.getDate();
      const diffMs = selected.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 0 || diffDays > 60 || day > 15) {
        newErrors.firstPaymentDate = "First payment date must be within 60 days from today and on or before the 15th of the month.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveExit = () => {
    if (!validateLoanDetails()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Proposal Saved",
      description: "You can resume this proposal later from the dashboard.",
    });
    setLocation("/");
  };

  if (!group) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display font-bold text-slate-900 tracking-tight">ARTEMIS <span className="text-slate-400 font-medium">HUNTING MVP</span></span>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <h1 className="text-lg font-semibold text-slate-900">Product Configuration</h1>
          </div>
          <Button onClick={handleSaveExit} variant="outline" size="sm" className="gap-2">
            <Save className="w-4 h-4" /> Save & Exit
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-slate-900 text-white rounded-xl p-4 mb-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-widest">Group ID</p>
              <p className="font-mono font-medium">{group.groupId}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-widest">Leader</p>
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 text-secondary fill-secondary" />
                <p className="font-semibold">
                  {group.members.find(m => m.id === group.leaderId)?.firstName} {group.members.find(m => m.id === group.leaderId)?.lastName}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 pb-0">
          {group.members.map((member, index) => (
            <div
              key={member.id}
              onClick={() => setActiveMemberId(member.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-t-xl cursor-pointer transition-all border-b-2 font-semibold text-sm relative group",
                activeMemberId === member.id ? "bg-white text-primary border-primary shadow-sm" : "text-slate-500 border-transparent hover:bg-slate-100/50"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="opacity-50">{index + 1}.</span>
                <span>{member.firstName} {member.lastName}</span>
                {member.id === group.leaderId && <Star className="w-3 h-3 text-secondary fill-secondary" />}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4 border-b border-slate-200 flex gap-4">
          <button className="px-4 py-2 text-sm font-semibold border-b-2 border-primary text-primary">
            Loan Details
          </button>
          <button className="px-4 py-2 text-sm text-slate-400 cursor-not-allowed">
            Personal Data
          </button>
          <button className="px-4 py-2 text-sm text-slate-400 cursor-not-allowed">
            Business Data
          </button>
          <button className="px-4 py-2 text-sm text-slate-400 cursor-not-allowed">
            Financials (P&L)
          </button>
        </div>

        <Card className="border-none shadow-xl bg-white">
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Loan Value */}
              <div className="space-y-4 col-span-1 md:col-span-2">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Loan Value</Label>
                <div className="flex flex-col md:flex-row gap-3 items-start">
                  <div className="flex-1 w-full">
                    <Input
                      type="text"
                      value={loanDetails.loanValue}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        handleLoanFieldChange("loanValue", formatCurrency(parseInt(val) || 0));
                      }}
                      className={cn("h-12 text-lg font-semibold", errors.loanValue && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {errors.loanValue && <p className="text-xs text-red-500 mt-1 font-medium">{errors.loanValue}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" onClick={() => adjustLoanValue(500)}>+ $500</Button>
                    <Button variant="outline" size="sm" onClick={() => adjustLoanValue(1000)}>+ $1,000</Button>
                    <Button variant="outline" size="sm" onClick={() => adjustLoanValue(-500)}>- $500</Button>
                    <Button variant="outline" size="sm" onClick={() => adjustLoanValue(-1000)}>- $1,000</Button>
                  </div>
                </div>
              </div>

              {/* Loan Type */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Loan Type</Label>
                <select
                  value={loanDetails.loanType}
                  onChange={e => handleLoanFieldChange("loanType", e.target.value)}
                  className="w-full h-12 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60"
                >
                  <option value="working-capital">Working capital</option>
                  <option value="investment">Investment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Interest rate (APR, % per year)</Label>
                <Input
                  type="text"
                  value={loanDetails.interestRate}
                  readOnly
                  className="h-12 bg-slate-50 cursor-not-allowed font-semibold"
                />
              </div>

              {/* Installments */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Number of Installments</Label>
                <select
                  value={loanDetails.installments}
                  onChange={e => handleLoanFieldChange("installments", e.target.value)}
                  className={cn(
                    "w-full h-12 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60",
                    errors.installments && "border-red-500 ring-red-500"
                  )}
                >
                  <option value="">Select installments</option>
                  {Array.from({ length: 9 }, (_, i) => i + 4).map(n => (
                    <option key={n} value={String(n)}>{n}</option>
                  ))}
                </select>
                {errors.installments && <p className="text-xs text-red-500 mt-1 font-medium">{errors.installments}</p>}
              </div>

              {/* First Payment Date */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">First Payment Date</Label>
                <Input
                  type="date"
                  min={formatDateInput(today)}
                  max={formatDateInput(maxDate)}
                  value={loanDetails.firstPaymentDate}
                  onChange={(e) => handleLoanFieldChange("firstPaymentDate", e.target.value)}
                  className={cn("h-12", errors.firstPaymentDate && "border-red-500 focus-visible:ring-red-500")}
                />
                {errors.firstPaymentDate && <p className="text-xs text-red-500 mt-1 font-medium">{errors.firstPaymentDate}</p>}
                <p className="text-[10px] text-slate-400 font-medium italic">Must be within 60 days and on/before 15th.</p>
              </div>

              {/* Grace Period */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Grace Period (Days)</Label>
                <Input
                  type="text"
                  value={loanDetails.gracePeriod}
                  readOnly
                  className="h-12 bg-slate-50 cursor-not-allowed font-semibold"
                />
              </div>

              {/* Loan Goal */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Loan Goal</Label>
                <select
                  value={loanDetails.loanGoal}
                  onChange={e => handleLoanFieldChange("loanGoal", e.target.value)}
                  className={cn(
                    "w-full h-12 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60",
                    errors.loanGoal && "border-red-500"
                  )}
                >
                  <option value="">Select a goal</option>
                  <option value="inventory">Purchase Inventory</option>
                  <option value="equipment">Purchase Equipment</option>
                  <option value="expansion">Business Expansion</option>
                  <option value="other">Other</option>
                </select>
                {errors.loanGoal && <p className="text-xs text-red-500 mt-1 font-medium">{errors.loanGoal}</p>}
              </div>

              {/* Other Goal (Conditional) */}
              {loanDetails.loanGoal === "other" && (
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Other Goal (optional)</Label>
                  <Input
                    value={loanDetails.otherGoal}
                    onChange={(e) => handleLoanFieldChange("otherGoal", e.target.value)}
                    className={cn("h-12", errors.otherGoal && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {errors.otherGoal && <p className="text-xs text-red-500 mt-1 font-medium">{errors.otherGoal}</p>}
                </div>
              )}

              {/* Borrower's Insurance */}
              <div className="space-y-4">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Borrower's Insurance</Label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="borrowerInsurance"
                      value="yes"
                      checked={loanDetails.borrowerInsurance === "yes"}
                      onChange={(e) => handleLoanFieldChange("borrowerInsurance", e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Yes (Recommended)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="borrowerInsurance"
                      value="no"
                      checked={loanDetails.borrowerInsurance === "no"}
                      onChange={(e) => handleLoanFieldChange("borrowerInsurance", e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">No</span>
                  </label>
                </div>
              </div>

              {/* Optional Insurances */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Optional Insurance 1</Label>
                  <select
                    value={loanDetails.optionalInsurance1}
                    onChange={e => handleLoanFieldChange("optionalInsurance1", e.target.value)}
                    className="w-full h-12 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60"
                  >
                    <option value="None">None</option>
                    <option value="Life">Life Insurance</option>
                    <option value="Health">Health Insurance</option>
                    <option value="Property">Property Insurance</option>
                  </select>
                </div>

                {loanDetails.optionalInsurance1 !== "None" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Optional Insurance 2</Label>
                    <select
                      value={loanDetails.optionalInsurance2}
                      onChange={e => handleLoanFieldChange("optionalInsurance2", e.target.value)}
                      className="w-full h-12 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60"
                    >
                      <option value="None">None</option>
                      <option value="Life">Life Insurance</option>
                      <option value="Health">Health Insurance</option>
                      <option value="Property">Property Insurance</option>
                    </select>
                  </div>
                )}

                {loanDetails.optionalInsurance2 !== "None" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Optional Insurance 3</Label>
                    <select
                      value={loanDetails.optionalInsurance3}
                      onChange={e => handleLoanFieldChange("optionalInsurance3", e.target.value)}
                      className="w-full h-12 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60"
                    >
                      <option value="None">None</option>
                      <option value="Life">Life Insurance</option>
                      <option value="Health">Health Insurance</option>
                      <option value="Property">Property Insurance</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-between items-center">
          <Link href="/">
            <Button variant="outline" className="h-12 px-8">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
          <Button onClick={handleSaveExit} className="h-12 px-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20">
            Next Step
          </Button>
        </div>
      </main>
    </div>
  );
}
