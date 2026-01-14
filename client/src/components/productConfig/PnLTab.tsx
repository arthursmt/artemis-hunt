import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Member } from "@/lib/proposalStore";
import { cn } from "@/lib/utils";

interface PnLTabProps {
  member: Member;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export function PnLTab({ member, onChange, errors }: PnLTabProps) {
  const pnl = member.pnl || {
    earningsMonthly: 0,
    monthlySales1: 0,
    operationalCostsMonthlyTotal: 0,
    personalExpensesMonthlyTotal: 0,
  };

  const handleChange = (field: string, value: any) => {
    const num = parseFloat(value) || 0;
    onChange("pnl", { ...pnl, [field]: num });
  };

  const netRevenueMonthly = (pnl.earningsMonthly || 0) + (pnl.monthlySales1 || 0) + (pnl.monthlySales2 || 0) + (pnl.monthlySales3 || 0) + (pnl.receivablesFactoring || 0) + (pnl.extraIncome || 0) - (pnl.deductions || 0);
  const grossProfitMonthly = netRevenueMonthly - (pnl.operationalCostsMonthlyTotal || 0);
  const businessNetProfitMonthly = grossProfitMonthly - (pnl.financialCostsMonthly || 0);
  const annualRevenue = netRevenueMonthly * 12;
  const paymentCapacity = businessNetProfitMonthly - (pnl.personalExpensesMonthlyTotal || 0);
  const operationalMargin = netRevenueMonthly > 0 ? (businessNetProfitMonthly / netRevenueMonthly) * 100 : 0;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div className="space-y-2">
          <Label>Monthly Earnings <span className="text-red-500">*</span></Label>
          <Input type="number" value={pnl.earningsMonthly} onChange={(e) => handleChange("earningsMonthly", e.target.value)} className={cn(errors.earningsMonthly && "border-red-500")} />
        </div>
        <div className="space-y-2">
          <Label>Monthly Sales 1 <span className="text-red-500">*</span></Label>
          <Input type="number" value={pnl.monthlySales1} onChange={(e) => handleChange("monthlySales1", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Operational Costs Total <span className="text-red-500">*</span></Label>
          <Input type="number" value={pnl.operationalCostsMonthlyTotal} onChange={(e) => handleChange("operationalCostsMonthlyTotal", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Personal Expenses Total <span className="text-red-500">*</span></Label>
          <Input type="number" value={pnl.personalExpensesMonthlyTotal} onChange={(e) => handleChange("personalExpensesMonthlyTotal", e.target.value)} />
        </div>
      </div>

      <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-1">
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Net Revenue</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(netRevenueMonthly)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Net Profit</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(businessNetProfitMonthly)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Payment Capacity</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(paymentCapacity)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Annual Revenue</p>
          <p className="text-xl font-bold text-slate-700">{formatCurrency(annualRevenue)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Op. Margin</p>
          <p className="text-xl font-bold text-slate-700">{operationalMargin.toFixed(1)}%</p>
        </div>
      </div>

      <div className="pt-6 border-t space-y-6">
        <h4 className="font-bold text-slate-700">Other Details (Optional)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Extra Income</Label>
            <Input type="number" value={pnl.extraIncome || 0} onChange={(e) => handleChange("extraIncome", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Rent (Business)</Label>
            <Input type="number" value={pnl.facilitiesRent || 0} onChange={(e) => handleChange("facilitiesRent", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Savings</Label>
            <Input type="number" value={pnl.savings || 0} onChange={(e) => handleChange("savings", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}
