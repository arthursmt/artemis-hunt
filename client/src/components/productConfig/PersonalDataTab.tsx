import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Member } from "@/lib/proposalStore";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

interface PersonalDataTabProps {
  member: Member;
  onChange: (field: keyof Member, value: string) => void;
}

export function PersonalDataTab({ member, onChange }: PersonalDataTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
      <div className="space-y-2">
        <Label>First Name <span className="text-red-500">*</span></Label>
        <Input value={member.firstName || ""} onChange={(e) => onChange("firstName", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Middle Name</Label>
        <Input value={member.middleName || ""} onChange={(e) => onChange("middleName", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Last Name <span className="text-red-500">*</span></Label>
        <Input value={member.lastName || ""} onChange={(e) => onChange("lastName", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Document type <span className="text-red-500">*</span></Label>
        <Select value={member.documentType || ""} onValueChange={(v) => onChange("documentType", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="ssn">Social Security Number (SSN)</SelectItem>
            <SelectItem value="dl">US Driver's License</SelectItem>
            <SelectItem value="state_id">State ID</SelectItem>
            <SelectItem value="passport">Passport</SelectItem>
            <SelectItem value="foreign_id">Foreign Government ID</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Document ID <span className="text-red-500">*</span></Label>
        <Input value={member.documentNumber || ""} onChange={(e) => onChange("documentNumber", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Country of Origin <span className="text-red-500">*</span></Label>
        <Select value={member.countryOfOrigin || ""} onValueChange={(v) => onChange("countryOfOrigin", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="United States">United States</SelectItem>
            <SelectItem value="Mexico">Mexico</SelectItem>
            <SelectItem value="Brazil">Brazil</SelectItem>
            <SelectItem value="Guatemala">Guatemala</SelectItem>
            <SelectItem value="Honduras">Honduras</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Birth Date <span className="text-red-500">*</span></Label>
        <Input type="date" value={member.birthDate || ""} onChange={(e) => onChange("birthDate", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Home Address 1 <span className="text-red-500">*</span></Label>
        <Input value={member.homeAddress1 || ""} onChange={(e) => onChange("homeAddress1", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Home Address 2</Label>
        <Input value={member.homeAddress2 || ""} onChange={(e) => onChange("homeAddress2", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>State <span className="text-red-500">*</span></Label>
        <Select value={member.state || ""} onValueChange={(v) => onChange("state", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="bg-white max-h-[300px]">
            {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>City <span className="text-red-500">*</span></Label>
        <Input value={member.city || ""} onChange={(e) => onChange("city", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Zip Code <span className="text-red-500">*</span></Label>
        <Input value={member.zipCode || ""} onChange={(e) => onChange("zipCode", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Contact 1 Type <span className="text-red-500">*</span></Label>
        <Select value={member.contact1Type || "Mobile"} onValueChange={(v) => onChange("contact1Type", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="Mobile">Mobile</SelectItem>
            <SelectItem value="Home">Home</SelectItem>
            <SelectItem value="Work">Work</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Contact 1 Number <span className="text-red-500">*</span></Label>
        <Input value={member.contact1Number || ""} onChange={(e) => onChange("contact1Number", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Contact 2 Type</Label>
        <Select value={member.contact2Type || ""} onValueChange={(v) => onChange("contact2Type", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="Mobile">Mobile</SelectItem>
            <SelectItem value="Home">Home</SelectItem>
            <SelectItem value="Work">Work</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Contact 2 Number</Label>
        <Input value={member.contact2Number || ""} onChange={(e) => onChange("contact2Number", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Reference Name 1</Label>
        <Input value={member.referenceName1 || ""} onChange={(e) => onChange("referenceName1", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Reference Number 1</Label>
        <Input value={member.referenceNumber1 || ""} onChange={(e) => onChange("referenceNumber1", e.target.value)} />
      </div>
    </div>
  );
}
