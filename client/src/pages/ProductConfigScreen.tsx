import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X, Star, Save, Info } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

const INSURANCE_PRICES: Record<string, number> = {
  "Work Loss Insurance": 20,
  "Health Premium": 40,
  "Income Insurance": 30,
  "Personal Accident": 25,
  "Inventory Protection": 35,
  "Family Support": 15,
};

const INSURANCE_DESCRIPTIONS: Record<string, string> = {
  "Work Loss Insurance": "Helps cover your loan payments if you lose your job.",
  "Health Premium": "Provides extra protection in case of major medical events.",
  "Income Insurance": "Protects your monthly income against unexpected shocks.",
  "Personal Accident": "Covers medical expenses and provides support in case of accidents.",
  "Inventory Protection": "Protects your business inventory against theft or damage.",
  "Family Support": "Provides financial assistance to your family during difficult times.",
};

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
    validateField("loanValue", formatCurrency(next));
  };

  const validateField = (field: keyof LoanDetails, value: string) => {
    if (!activeMemberId) return;
    let error: string | undefined = undefined;

    if (field === "loanValue") {
      const amount = parseCurrency(value);
      if (amount < 500 || amount > 50000) {
        error = "Loan value must be between $500 and $50,000";
      }
    } else if (field === "firstPaymentDate") {
      if (value) {
        const selected = new Date(value + "T00:00:00");
        const day = selected.getDate();
        const diffMs = selected.getTime() - today.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 0 || diffDays > 60 || day > 15) {
          error = "First payment date must be within 60 days and on or before the 15th of the month.";
        }
      }
    }

    setLoanErrorsByMember(prev => ({
      ...prev,
      [activeMemberId]: { ...prev[activeMemberId], [field]: error }
    }));
  };

  const calculateInstallment = useMemo(() => {
    const P = parseCurrency(activeLoanDetails.loanValue);
    const n = parseInt(activeLoanDetails.installments);
    if (!P || !n || activeErrors.loanValue) return 0;
    
    const APR = 0.14;
    const r = APR / 12;
    return (P * r) / (1 - Math.pow(1 + r, -n));
  }, [activeLoanDetails.loanValue, activeLoanDetails.installments, activeErrors.loanValue]);

  const insuranceTotal = useMemo(() => {
    let total = 0;
    [activeLoanDetails.optionalInsurance1, activeLoanDetails.optionalInsurance2, activeLoanDetails.optionalInsurance3].forEach(ins => {
      if (ins !== "None") {
        const key = Object.keys(INSURANCE_PRICES).find(k => ins.startsWith(k));
        if (key) total += INSURANCE_PRICES[key];
      }
    });
    return total;
  }, [activeLoanDetails.optionalInsurance1, activeLoanDetails.optionalInsurance2, activeLoanDetails.optionalInsurance3]);

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
        errors.firstPaymentDate = "First payment date must be within 60 days and on or before the 15th of the month.";
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
          <div className="text-right">
            <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-widest">Base credit rate</p>
            <p className="text-sm font-semibold">14% APR (fixed)</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Row 1 */}
              <div className="space-y-2">
                <Label>Loan value</Label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={activeLoanDetails.loanValue}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const formatted = formatCurrency(parseInt(val || "0") / 100);
                        handleLoanFieldChange("loanValue", formatted);
                      }}
                      onBlur={(e) => validateField("loanValue", e.target.value)}
                      className={cn("h-10 text-slate-900 font-medium", activeErrors.loanValue && "border-red-500")}
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => adjustLoanValue(500)} className="h-10 px-2 font-bold">+500</Button>
                    <Button variant="outline" size="sm" onClick={() => adjustLoanValue(1000)} className="h-10 px-2 font-bold">+1k</Button>
                    <Button variant="outline" size="sm" onClick={() => adjustLoanValue(-500)} className="h-10 px-2 font-bold">-500</Button>
                    <Button variant="outline" size="sm" onClick={() => adjustLoanValue(-1000)} className="h-10 px-2 font-bold">-1k</Button>
                  </div>
                </div>
                {activeErrors.loanValue && <p className="text-xs text-red-500 font-medium">{activeErrors.loanValue}</p>}
              </div>

              <div className="space-y-2">
                <Label>First payment date</Label>
                <Input
                  type="date"
                  min={formatDateInput(today)}
                  max={formatDateInput(maxDate)}
                  value={activeLoanDetails.firstPaymentDate}
                  onChange={(e) => {
                    handleLoanFieldChange("firstPaymentDate", e.target.value);
                    validateField("firstPaymentDate", e.target.value);
                  }}
                  className={cn("h-10", activeErrors.firstPaymentDate && "border-red-500")}
                />
                {activeErrors.firstPaymentDate && <p className="text-xs text-red-500 font-medium">{activeErrors.firstPaymentDate}</p>}
              </div>

              {/* Row 2 */}
              <div className="space-y-2">
                <Label>Loan type</Label>
                <Select value={activeLoanDetails.loanType} onValueChange={(v) => handleLoanFieldChange("loanType", v)}>
                  <SelectTrigger className="h-10 bg-white text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="working-capital">Working capital</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Grace period (days)</Label>
                <Input value={activeLoanDetails.gracePeriod} readOnly className="h-10 bg-slate-50 cursor-not-allowed" />
              </div>

              {/* Row 3 */}
              <div className="space-y-2">
                <Label>Interest rate (APR, % per year)</Label>
                <Input value={`${activeLoanDetails.interestRate}%`} readOnly className="h-10 bg-slate-50 cursor-not-allowed text-slate-500" />
              </div>

              <div className="space-y-2">
                <Label>Loan goal</Label>
                <Select value={activeLoanDetails.loanGoal} onValueChange={(v) => handleLoanFieldChange("loanGoal", v)}>
                  <SelectTrigger className="h-10 bg-white text-slate-900">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="inventory">Inventory purchase</SelectItem>
                    <SelectItem value="equipment">Equipment purchase</SelectItem>
                    <SelectItem value="working-capital">Working capital</SelectItem>
                    <SelectItem value="debt">Debt consolidation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Row 4 */}
              <div className="space-y-2">
                <Label>Number of installments</Label>
                <Select value={activeLoanDetails.installments} onValueChange={(v) => handleLoanFieldChange("installments", v)}>
                  <SelectTrigger className={cn("h-10 bg-white text-slate-900", activeErrors.installments && "border-red-500")}>
                    <SelectValue placeholder="Select installments" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {[4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} months</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Installment amount (per month)</Label>
                <Input 
                  value={calculateInstallment ? formatCurrency(calculateInstallment) : "--"} 
                  readOnly 
                  className="h-10 bg-slate-50 cursor-not-allowed text-slate-900 font-semibold" 
                />
              </div>

              {/* Full Width Row for Other Goal */}
              {activeLoanDetails.loanGoal === "other" && (
                <div className="col-span-1 md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label>Other goal (optional)</Label>
                  <Input
                    value={activeLoanDetails.otherGoal}
                    onChange={(e) => handleLoanFieldChange("otherGoal", e.target.value)}
                    placeholder="Describe your goal"
                    className="h-10"
                  />
                </div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Insurances</h3>
                <div className="bg-slate-50 p-6 rounded-xl flex items-center justify-between">
                  <Label className="font-semibold text-slate-700">Borrower's Insurance (Credit Life)</Label>
                  <RadioGroup value={activeLoanDetails.borrowerInsurance} onValueChange={(v) => handleLoanFieldChange("borrowerInsurance", v)} className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="ins-yes" />
                      <Label htmlFor="ins-yes" className="font-medium cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="ins-no" />
                      <Label htmlFor="ins-no" className="font-medium cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(num => {
                  const field = `optionalInsurance${num}` as keyof LoanDetails;
                  const value = activeLoanDetails[field];
                  const isVisible = num === 1 || activeLoanDetails[`optionalInsurance${num-1}` as keyof LoanDetails] !== "None";
                  
                  if (!isVisible) return null;

                  const descriptionKey = Object.keys(INSURANCE_PRICES).find(k => value.startsWith(k));

                  return (
                    <div key={num} className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between">
                        <Label>Optional insurance {num}</Label>
                        {value !== "None" && descriptionKey && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:text-primary/80">
                                <Info className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white">
                              <DialogHeader>
                                <DialogTitle>{descriptionKey}</DialogTitle>
                              </DialogHeader>
                              <p className="text-slate-600 mt-4">{INSURANCE_DESCRIPTIONS[descriptionKey]}</p>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                      <Select value={value} onValueChange={(v) => handleLoanFieldChange(field, v)}>
                        <SelectTrigger className="h-10 bg-white text-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Work Loss Insurance ($20/month)">Work Loss ($20/mo)</SelectItem>
                          <SelectItem value="Health Premium ($40/month)">Health Plus ($40/mo)</SelectItem>
                          <SelectItem value="Income Insurance ($30/month)">Income Prot ($30/mo)</SelectItem>
                        </SelectContent>
                      </Select>
                      {value !== "None" && descriptionKey && (
                        <p className="text-[11px] text-slate-500 leading-tight italic px-1">
                          {INSURANCE_DESCRIPTIONS[descriptionKey]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Card */}
            <div className="mt-12 bg-primary/5 border border-primary/10 rounded-2xl p-8 space-y-6">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Base monthly installment:</span>
                  <span className="text-lg font-bold text-slate-900">{calculateInstallment ? formatCurrency(calculateInstallment) : "--"}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Interest rate:</span>
                  <span className="font-bold text-slate-900">14% APR</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-200 md:border-none pt-4 md:pt-1">
                  <span className="text-slate-500 font-medium">Optional insurances:</span>
                  <span className="text-slate-900 font-bold">{formatCurrency(insuranceTotal)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">First payment date:</span>
                  <span className="text-slate-900 font-bold">{activeLoanDetails.firstPaymentDate || "--"}</span>
                </div>
                <div className="flex justify-between items-center py-1 col-span-1 md:col-span-2 mt-4 pt-6 border-t-2 border-primary/20">
                  <span className="text-xl font-bold text-primary">Total monthly payment:</span>
                  <span className="text-2xl font-black text-primary">
                    {calculateInstallment ? formatCurrency(calculateInstallment + insuranceTotal) : "--"}
                  </span>
                </div>
                {activeLoanDetails.firstPaymentDate && (
                   <div className="flex justify-between items-center py-1 col-span-1 md:col-span-2">
                    <span className="text-xs text-slate-400 font-medium">Due day of month:</span>
                    <span className="text-xs text-slate-500 font-bold">{new Date(activeLoanDetails.firstPaymentDate + "T00:00:00").getDate()}th of the month</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-between items-center">
          <Link href="/">
            <Button variant="outline" className="h-12 px-8 font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
          <Button 
            onClick={handleSaveExit}
            className="h-12 px-12 bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20"
          >
            Next Step
          </Button>
        </div>
      </main>
    </div>
  );
}
