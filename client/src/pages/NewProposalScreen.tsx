import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateProposal } from "@/hooks/use-proposals";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const DOCUMENT_TYPES = [
  { value: "ssn", label: "Social Security Number (SSN)" },
  { value: "itin", label: "Individual Taxpayer Identification Number (ITIN)" },
  { value: "dl_state_id", label: "US Driver’s License / State ID" },
  { value: "passport", label: "Passport" },
  { value: "foreign_id", label: "Foreign Government ID" },
];

interface Member {
  id: number;
  name: string;
  requestedAmount: string;
  documentType: string;
  documentNumber: string;
}

export default function NewProposalScreen() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createProposal = useCreateProposal();

  const [proposalType, setProposalType] = useState<"group" | "individual">("group");
  const [members, setMembers] = useState<Member[]>([
    {
      id: Date.now(),
      name: "",
      requestedAmount: "",
      documentType: "",
      documentNumber: "",
    },
  ]);
  const [activeMemberId, setActiveMemberId] = useState<number>(members[0].id);

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];

  const handleAddMember = () => {
    const newMember: Member = {
      id: Date.now(),
      name: "",
      requestedAmount: "",
      documentType: "",
      documentNumber: "",
    };
    setMembers([...members, newMember]);
    setActiveMemberId(newMember.id);
  };

  const handleRemoveMember = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (members.length === 1) {
      toast({
        title: "Action blocked",
        description: "Group must have at least one member.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm("Are you sure you want to remove this member from the group?")) {
      const newMembers = members.filter((m) => m.id !== id);
      setMembers(newMembers);
      if (activeMemberId === id) {
        setActiveMemberId(newMembers[0].id);
      }
    }
  };

  const updateMember = (id: number, field: keyof Member, value: string) => {
    setMembers(
      members.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: proposalType,
      members: proposalType === "individual" ? [members[0]] : members,
    };
    
    console.log("Submitting proposal payload:", payload);
    
    createProposal.mutate({
      clientName: payload.members[0].name || "New Proposal",
      amount: payload.members[0].requestedAmount || "0",
      status: "on_going",
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "New proposal created successfully.",
        });
        setLocation("/");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PageHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm border-slate-200">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">New Proposal</h1>
            <p className="text-slate-500">Originate a new credit application.</p>
          </div>
        </div>

        <div className="mb-6">
          <Label className="text-slate-900 font-semibold block mb-3">Proposal Type</Label>
          <div className="flex p-1 bg-slate-200/50 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => {
                setProposalType("group");
                if (proposalType === "individual") {
                  setActiveMemberId(members[0].id);
                }
              }}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                proposalType === "group" 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Group
            </button>
            <button
              type="button"
              onClick={() => setProposalType("individual")}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                proposalType === "individual" 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Individual
            </button>
          </div>
        </div>

        {proposalType === "group" && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {members.map((member, index) => (
              <div
                key={member.id}
                onClick={() => setActiveMemberId(member.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer transition-all border-b-2 font-medium text-sm",
                  activeMemberId === member.id
                    ? "bg-white text-primary border-primary"
                    : "text-slate-500 border-transparent hover:text-slate-700"
                )}
              >
                <span>Member {index + 1}</span>
                {members.length > 1 && (
                  <X 
                    className="h-3 w-3 hover:text-red-500 transition-colors" 
                    onClick={(e) => handleRemoveMember(member.id, e)}
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddMember}
              className="p-2 rounded-full hover:bg-slate-200 text-primary transition-colors mb-1 ml-2"
              title="Add Member"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}

        <Card className="border-none shadow-xl bg-white">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="space-y-2">
                  <Label className="text-slate-900 font-semibold">Client Name</Label>
                  <Input 
                    placeholder="e.g. Maria Silva" 
                    className="h-12 text-lg" 
                    value={activeMember.name}
                    onChange={(e) => updateMember(activeMember.id, "name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-900 font-semibold">Requested Amount ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-12 text-lg font-mono" 
                    value={activeMember.requestedAmount}
                    onChange={(e) => updateMember(activeMember.id, "requestedAmount", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-semibold">ID Document Type</Label>
                    <Select 
                      value={activeMember.documentType} 
                      onValueChange={(val) => updateMember(activeMember.id, "documentType", val)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-900 font-semibold">Document Number</Label>
                    <Input 
                      placeholder="Enter number" 
                      className="h-12" 
                      value={activeMember.documentNumber}
                      onChange={(e) => updateMember(activeMember.id, "documentNumber", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Link href="/" className="w-full">
                  <Button type="button" variant="outline" className="w-full h-12">Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20"
                  disabled={createProposal.isPending}
                >
                  {createProposal.isPending ? "Creating..." : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Create Proposal
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
