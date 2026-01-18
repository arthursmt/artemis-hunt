import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Member } from "@/lib/proposalStore";
import { cn } from "@/lib/utils";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const BUSINESS_TYPES = ["Retail", "Service", "Manufacturing", "Other"];
const SECTORS = ["Food & Beverage", "Textiles", "Technology", "Agriculture", "Other"];
const CONTACT_TYPES = ["Mobile", "Home", "Work", "WhatsApp", "Other"];

interface BusinessDataTabProps {
  member: Member;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export function BusinessDataTab({ member, onChange, errors }: BusinessDataTabProps) {
  const data = member.businessData || {
    businessName: "",
    businessType: "",
    businessSector: "",
    multipleBusiness: false,
    openingMonth: "",
    openingYear: "",
    businessAddress1: "",
    state: "",
    city: "",
    zipCode: "",
    contact1Type: "Mobile",
    businessContact1: "",
  };

  const handleChange = (field: string, value: any) => {
    onChange("businessData", { ...data, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
      <div className="space-y-2">
        <Label>Business Name <span className="text-red-500">*</span></Label>
        <Input 
          value={data.businessName} 
          onChange={(e) => handleChange("businessName", e.target.value)}
          className={cn(errors.businessName && "border-red-500")}
        />
        {errors.businessName && <p className="text-xs text-red-500">{errors.businessName}</p>}
      </div>

      <div className="space-y-2">
        <Label>Business Type <span className="text-red-500">*</span></Label>
        <Select value={data.businessType} onValueChange={(v) => handleChange("businessType", v)}>
          <SelectTrigger className={cn(errors.businessType && "border-red-500")}><SelectValue /></SelectTrigger>
          <SelectContent className="bg-white">
            {BUSINESS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {data.businessType === "Other" && (
        <div className="space-y-2 animate-in fade-in">
          <Label>Other Business Type</Label>
          <Input value={data.otherBusinessType} onChange={(e) => handleChange("otherBusinessType", e.target.value)} />
        </div>
      )}

      <div className="space-y-2">
        <Label>Business Sector <span className="text-red-500">*</span></Label>
        <Select value={data.businessSector} onValueChange={(v) => handleChange("businessSector", v)}>
          <SelectTrigger className={cn(errors.businessSector && "border-red-500")}><SelectValue /></SelectTrigger>
          <SelectContent className="bg-white">
            {SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between py-2 px-1">
        <div className="space-y-0.5">
          <Label className="text-base cursor-pointer" onClick={() => handleChange("multipleBusiness", !data.multipleBusiness)}>
            Multiple Businesses?
          </Label>
        </div>
        <Switch 
          checked={data.multipleBusiness} 
          onCheckedChange={(v) => handleChange("multipleBusiness", v)}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Opening Month <span className="text-red-500">*</span></Label>
          <Select value={data.openingMonth} onValueChange={(v) => handleChange("openingMonth", v)}>
            <SelectTrigger className={cn(errors.openingMonth && "border-red-500")}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white">
              {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Opening Year <span className="text-red-500">*</span></Label>
          <Input 
            type="number" 
            value={data.openingYear} 
            onChange={(e) => handleChange("openingYear", e.target.value)}
            className={cn(errors.openingYear && "border-red-500")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Business Address 1 <span className="text-red-500">*</span></Label>
        <Input value={data.businessAddress1} onChange={(e) => handleChange("businessAddress1", e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Business Address 2 (Optional)</Label>
        <Input value={data.businessAddress2} onChange={(e) => handleChange("businessAddress2", e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>State <span className="text-red-500">*</span></Label>
          <Select value={data.state} onValueChange={(v) => handleChange("state", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white">
              {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 col-span-1">
          <Label>City <span className="text-red-500">*</span></Label>
          <Input value={data.city} onChange={(e) => handleChange("city", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Zip <span className="text-red-500">*</span></Label>
          <Input value={data.zipCode} onChange={(e) => handleChange("zipCode", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Contact 1 Type <span className="text-red-500">*</span></Label>
          <Select value={data.contact1Type} onValueChange={(v) => handleChange("contact1Type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white">
              {CONTACT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Contact Number <span className="text-red-500">*</span></Label>
          <Input value={data.businessContact1} onChange={(e) => handleChange("businessContact1", e.target.value)} />
        </div>
      </div>

      {data.multipleBusiness && (
        <div className="col-span-full mt-6 pt-6 border-t space-y-8 animate-in slide-in-from-top-4">
          <h4 className="font-bold text-slate-700">Additional Business Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 border rounded-lg">
              <Label className="text-primary font-bold">Business 2 (Optional)</Label>
              <Input placeholder="Name" value={data.businessName2} onChange={(e) => handleChange("businessName2", e.target.value)} />
              <Select value={data.businessType2} onValueChange={(v) => handleChange("businessType2", v)}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent className="bg-white">{BUSINESS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-4 p-4 border rounded-lg">
              <Label className="text-primary font-bold">Business 3 (Optional)</Label>
              <Input placeholder="Name" value={data.businessName3} onChange={(e) => handleChange("businessName3", e.target.value)} />
              <Select value={data.businessType3} onValueChange={(v) => handleChange("businessType3", v)}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent className="bg-white">{BUSINESS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
