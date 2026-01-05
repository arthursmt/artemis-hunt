import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Member {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  requestedAmount: string;
  documentType: string;
  documentNumber: string;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  ssn: "Social Security Number (SSN)",
  itin: "Individual Taxpayer Identification Number (ITIN)",
  dl_state_id: "US Driver’s License / State ID",
  passport: "Passport",
  foreign_id: "Foreign Government ID",
};

export default function CreditValidationScreen() {
  const [location] = useLocation();
  
  // In a real app, we'd get this from a global state or search params
  // For this MVP, we'll try to retrieve from sessionStorage or use a placeholder
  const storedData = sessionStorage.getItem("pending_proposal");
  const proposalData = storedData ? JSON.parse(storedData) : null;

  if (!proposalData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 space-y-4">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
            <h2 className="text-xl font-bold">No Pending Proposal</h2>
            <p className="text-slate-500">Please start a new proposal first.</p>
            <Link href="/new-proposal">
              <Button className="w-full">Go to New Proposal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (val: string) => {
    const num = parseFloat(val);
    return isNaN(num) ? "$ 0.00" : new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const members: Member[] = proposalData.members;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PageHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/new-proposal">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm border-slate-200">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Credit Validation</h1>
            <p className="text-slate-500">Reviewing internal and external rules before approval.</p>
          </div>
        </div>

        <div className="space-y-6">
          {members.map((member, index) => (
            <Card key={member.id} className="border-none shadow-lg bg-white overflow-hidden">
              <div className="bg-primary/5 px-6 py-3 border-b border-primary/10 flex justify-between items-center">
                <h3 className="font-bold text-primary flex items-center gap-2">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  {member.firstName} {member.middleName} {member.lastName}
                </h3>
                <span className="text-sm font-mono font-bold text-slate-600">
                  {formatCurrency(member.requestedAmount)}
                </span>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="text-sm">
                      <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">ID Document</p>
                      <p className="font-semibold text-slate-900">{DOCUMENT_TYPE_LABELS[member.documentType] || member.documentType}</p>
                      <p className="text-slate-600">{member.documentNumber}</p>
                    </div>
                    
                    <div className="pt-4 space-y-3">
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest">Validation Checks</h4>
                      <CheckItem label="Credit bureau checks" status="pending" />
                      <CheckItem label="AML / anti-money-laundering screening" status="pending" />
                      <CheckItem label="Internal blacklist / risk criteria" status="pending" />
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3 border border-slate-100">
                    <Clock className="w-8 h-8 text-yellow-500 animate-pulse" />
                    <div>
                      <p className="font-bold text-slate-900">Validation in Progress</p>
                      <p className="text-xs text-slate-500">Automated rules engine is processing this member.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex gap-4">
          <Link href="/new-proposal" className="flex-1">
            <Button variant="outline" className="w-full h-12">Edit Proposal</Button>
          </Link>
          <Button className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20">
            Continue to Product Config
          </Button>
        </div>
      </main>
    </div>
  );
}

function CheckItem({ label, status }: { label: string; status: 'passed' | 'failed' | 'pending' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          status === 'passed' && "text-green-600",
          status === 'failed' && "text-red-600",
          status === 'pending' && "text-yellow-600"
        )}>
          {status}
        </span>
        {status === 'passed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        {status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
        {status === 'failed' && <AlertCircle className="w-4 h-4 text-red-500" />}
      </div>
    </div>
  );
}
