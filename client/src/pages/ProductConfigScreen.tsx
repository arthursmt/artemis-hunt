import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X, Star, Save } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useState, useEffect } from "react";
import { useProposalStore, Group, Member } from "@/lib/proposalStore";
import { useToast } from "@/hooks/use-toast";
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
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

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
  const amount = parseFloat(digits);
  return isNaN(amount) ? 0 : amount;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDateInput = (d: Date) => d.toISOString().slice(0, 10);

const createEmptyLoanDetails = (): LoanDetails => ({
  loanValue: "",
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

  const [loanDetailsByMember, setLoanDetailsByMember] = useState<Record<number, LoanDetails>>({});
  const [loanErrorsByMember, setLoanErrorsByMember] = useState<Record<number, LoanDetailsErrors>>({});

  const proposalId = params.id;
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 60);

  useEffect(() => {
    if (!proposalId) return;
    const proposal = getProposalById(proposalId);
    if (proposal) {
      const loadedGroup = proposal.data.group;
      setGroup(loadedGroup);
      const initialActiveId = loadedGroup.leaderId || loadedGroup.members[0].id;
      setActiveMemberId(initialActiveId);
    }
  }, [proposalId, getProposalById]);

  useEffect(() => {
    if (!group || activeMemberId === null) return;
    const member = group.members.find(m => m.id === activeMemberId);
    if (member) {
      setLoanDetailsByMember(prev => {
        if (prev[activeMemberId]?.loanValue) return prev;
        const requested = parseCurrency(member.requestedAmount);
        return {
          ...prev,
          [activeMemberId]: {
            ...(prev[activeMemberId] || createEmptyLoanDetails()),
            loanValue: formatCurrency(requested),
          }
        };
      });
    }
  }, [group, activeMemberId]);

  const activeLoanDetails = activeMemberId !== null ? (loanDetailsByMember[activeMemberId] || createEmptyLoanDetails()) : createEmptyLoanDetails();
  const activeErrors = activeMemberId !== null ? (loanErrorsByMember[activeMemberId] || {}) : {};

  useEffect(() => {
    if (!activeMemberId || !activeLoanDetails.firstPaymentDate) return;
    const selected = new Date(activeLoanDetails.firstPaymentDate + "T00:00:00");
    const diffMs = selected.getTime() - today.getTime();
    const diffDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    
    setLoanDetailsByMember(prev => {
      if (prev[activeMemberId]?.gracePeriod === String(diffDays)) return prev;
      return {
        ...prev,
        [activeMemberId]: {
          ...prev[activeMemberId],
          gracePeriod: String(diffDays),
        }
      };
    });
  }, [activeLoanDetails.firstPaymentDate, activeMemberId]);

  const handleLoanFieldChange = (field: keyof LoanDetails, value: string) => {
    if (activeMemberId === null) return;

    setLoanDetailsByMember(prev => {
      const current = prev[activeMemberId] || createEmptyLoanDetails();
      let next = { ...current, [field]: value };

      if (field === "loanGoal" && value !== "other") {
        next.otherGoal = "";
      }

      if (field === "optionalInsurance1" && value === "None") {
        next.optionalInsurance2 = "None";
        next.optionalInsurance3 = "None";
      }
      if (field === "optionalInsurance2" && value === "None") {
        next.optionalInsurance3 = "None";
      }

      return { ...prev, [activeMemberId]: next };
    });

    setLoanErrorsByMember(prev => ({
      ...prev,
      [activeMemberId]: { ...prev[activeMemberId], [field]: undefined }
    }));
  };

  const adjustLoanValue = (delta: number) => {
    if (activeMemberId === null) return;
    const current = parseCurrency(activeLoanDetails.loanValue || "0");
    let next = current + delta;
    if (next < 500) next = 500;
    if (next > 50000) next = 50000;
    
    handleLoanFieldChange("loanValue", formatCurrency(next));
  };

  const validate = () => {
    if (!activeMemberId) return false;
    const errors: LoanDetailsErrors = {};
    const amount = parseCurrency(activeLoanDetails.loanValue);

    if (!activeLoanDetails.loanValue) errors.loanValue = "This field is required";
    else if (amount < 500 || amount > 50000) errors.loanValue = "Loan value must be between $500 and $50,000";

    if (!activeLoanDetails.loanType) errors.loanType = "This field is required";
    if (!activeLoanDetails.interestRate) errors.interestRate = "This field is required";
    if (!activeLoanDetails.installments) errors.installments = "This field is required";
    
    if (!activeLoanDetails.firstPaymentDate) {
      errors.firstPaymentDate = "This field is required";
    } else {
      const selected = new Date(activeLoanDetails.firstPaymentDate + "T00:00:00");
      const day = selected.getDate();
      const diffMs = selected.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 0 || diffDays > 60 || day > 15) {
        errors.firstPaymentDate = "First payment date must be within 60 days from today and on or before the 15th of the month.";
      }
    }

    if (!activeLoanDetails.loanGoal) errors.loanGoal = "This field is required";
    if (!activeLoanDetails.borrowerInsurance) errors.borrowerInsurance = "This field is required";

    setLoanErrorsByMember(prev => ({ ...prev, [activeMemberId]: errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSaveExit = () => {
    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Proposal Saved",
      description: "You can resume this proposal later from the dashboard.",
    });
    setLocation("/");
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center font-display">
        <Card className="max-w-md w-full border-none shadow-xl">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">No Active Proposal</h2>
            <Link href="/new-proposal">
              <Button className="w-full bg-primary text-white">Start New Proposal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-display">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display font-bold text-slate-900 tracking-tight text-xl">ARTEMIS <span className="text-primary">HUNTING</span></span>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <h1 className="text-lg font-semibold text-slate-900 font-display">Product Configuration</h1>
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
                <p className="font-semibold text-sm">
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
          <button className="px-4 py-2 text-sm text-slate-400 cursor-not-allowed" disabled>
            Personal Data
          </button>
          <button className="px-4 py-2 text-sm text-slate-400 cursor-not-allowed" disabled>
            Business Data
          </button>
          <button className="px-4 py-2 text-sm text-slate-400 cursor-not-allowed" disabled>
            Financials (P&L)
          </button>
        </div>

        <Card className="border-none shadow-xl bg-white">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Loan value</Label>
                  <div className="flex flex-col md:flex-row gap-3 items-start">
                    <div className="flex-1 w-full">
                      <Input
                        type="text"
                        value={activeLoanDetails.loanValue}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const num = parseInt(val) || 0;
                          handleLoanFieldChange("loanValue", formatCurrency(num / 100));
                        }}
                        className={cn(activeErrors.loanValue && "border-red-500")}
                      />
                      {activeErrors.loanValue && <p className="text-xs text-red-500 mt-1">{activeErrors.loanValue}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => adjustLoanValue(500)}>+ $500</Button>
                      <Button variant="outline" size="sm" onClick={() => adjustLoanValue(1000)}>+ $1,000</Button>
                      <Button variant="outline" size="sm" onClick={() => adjustLoanValue(-500)}>- $500</Button>
                      <Button variant="outline" size="sm" onClick={() => adjustLoanValue(-1000)}>- $1,000</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Loan type</Label>
                  <Select
                    value={activeLoanDetails.loanType}
                    onValueChange={(val) => handleLoanFieldChange("loanType", val)}
                  >
                    <SelectTrigger className={cn(activeErrors.loanType && "border-red-500")}>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="working-capital">Working capital</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {activeErrors.loanType && <p className="text-xs text-red-500 mt-1">{activeErrors.loanType}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Interest rate (APR, % per year)</Label>
                  <Input value={activeLoanDetails.interestRate} readOnly className="bg-slate-50" />
                </div>

                <div className="space-y-2">
                  <Label>Number of installments</Label>
                  <Select
                    value={activeLoanDetails.installments}
                    onValueChange={(val) => handleLoanFieldChange("installments", val)}
                  >
                    <SelectTrigger className={cn(activeErrors.installments && "border-red-500")}>
                      <SelectValue placeholder="Select installments" />
                    </SelectTrigger>
                    <SelectContent>
                      {[4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {activeErrors.installments && <p className="text-xs text-red-500 mt-1">{activeErrors.installments}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>First payment date</Label>
                  <Input
                    type="date"
                    min={formatDateInput(today)}
                    max={formatDateInput(maxDate)}
                    value={activeLoanDetails.firstPaymentDate}
                    onChange={(e) => handleLoanFieldChange("firstPaymentDate", e.target.value)}
                    className={cn(activeErrors.firstPaymentDate && "border-red-500")}
                  />
                  {activeErrors.firstPaymentDate && <p className="text-xs text-red-500 mt-1">{activeErrors.firstPaymentDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Grace period (days)</Label>
                  <Input value={activeLoanDetails.gracePeriod} readOnly className="bg-slate-50" />
                </div>

                <div className="space-y-2">
                  <Label>Loan goal</Label>
                  <Select
                    value={activeLoanDetails.loanGoal}
                    onValueChange={(val) => handleLoanFieldChange("loanGoal", val)}
                  >
                    <SelectTrigger className={cn(activeErrors.loanGoal && "border-red-500")}>
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inventory">Inventory purchase</SelectItem>
                      <SelectItem value="equipment">Equipment purchase</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {activeErrors.loanGoal && <p className="text-xs text-red-500 mt-1">{activeErrors.loanGoal}</p>}
                </div>

                {activeLoanDetails.loanGoal === "other" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Label>Other goal (optional)</Label>
                    <Input
                      value={activeLoanDetails.otherGoal}
                      onChange={(e) => handleLoanFieldChange("otherGoal", e.target.value)}
                      placeholder="Specify your loan goal"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t space-y-8">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Insurances</Label>
                <div className="space-y-4 bg-slate-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Borrower's Insurance (Credit Life)</Label>
                    <RadioGroup
                      value={activeLoanDetails.borrowerInsurance}
                      onValueChange={(val) => handleLoanFieldChange("borrowerInsurance", val)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ins-yes" />
                        <Label htmlFor="ins-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ins-no" />
                        <Label htmlFor="ins-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Optional insurance 1</Label>
                  <Select
                    value={activeLoanDetails.optionalInsurance1}
                    onValueChange={(val) => handleLoanFieldChange("optionalInsurance1", val)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Home">Home Protection</SelectItem>
                      <SelectItem value="Health">Health Plus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {activeLoanDetails.optionalInsurance1 !== "None" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label>Optional insurance 2</Label>
                    <Select
                      value={activeLoanDetails.optionalInsurance2}
                      onValueChange={(val) => handleLoanFieldChange("optionalInsurance2", val)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Accident">Personal Accident</SelectItem>
                        <SelectItem value="Inventory">Inventory Protection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {activeLoanDetails.optionalInsurance1 !== "None" && activeLoanDetails.optionalInsurance2 !== "None" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label>Optional insurance 3</Label>
                    <Select
                      value={activeLoanDetails.optionalInsurance3}
                      onValueChange={(val) => handleLoanFieldChange("optionalInsurance3", val)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Family">Family Support</SelectItem>
                      </SelectContent>
                    </Select>
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
          <Button 
            onClick={handleSaveExit}
            className="h-12 px-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20"
          >
            Next Step
          </Button>
        </div>
      </main>
    </div>
  );
}
