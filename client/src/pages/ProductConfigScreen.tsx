import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X, Star, StarOff, User, Save } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useProposalStore, Group, Member } from "@/lib/proposalStore";
import { useToast } from "@/hooks/use-toast";

export default function ProductConfigScreen() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const { updateProposal, getProposalById } = useProposalStore();
  const [group, setGroup] = useState<Group | null>(null);
  const [activeMemberId, setActiveMemberId] = useState<number | null>(null);

  const proposalId = params.id;

  useEffect(() => {
    if (!proposalId) return;
    
    const proposal = getProposalById(proposalId);
    if (proposal) {
      setGroup(proposal.data.group);
      setActiveMemberId(proposal.data.group.leaderId || proposal.data.group.members[0].id);
    }
  }, [proposalId, getProposalById]);

  const saveGroupToStore = (newGroup: Group) => {
    setGroup(newGroup);
    if (proposalId) {
      updateProposal(proposalId, (prev) => ({
        ...prev,
        data: { ...prev.data, group: newGroup }
      }));
    }
  };

  const handleMakeLeader = (id: number) => {
    if (!group) return;
    const memberToLead = group.members.find(m => m.id === id);
    if (!memberToLead) return;

    const otherMembers = group.members.filter(m => m.id !== id);
    const reorderedMembers = [memberToLead, ...otherMembers];

    saveGroupToStore({
      ...group,
      leaderId: id,
      members: reorderedMembers
    });
  };

  const handleAddMember = () => {
    if (!group) return;
    const newMember: Member = {
      id: Date.now(),
      firstName: "",
      middleName: "",
      lastName: "",
      requestedAmount: "0",
      documentType: "ssn",
      documentNumber: "",
    };
    saveGroupToStore({
      ...group,
      members: [...group.members, newMember]
    });
    setActiveMemberId(newMember.id);
  };

  const handleRemoveMember = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!group) return;
    if (group.members.length === 1) return;

    if (window.confirm("Are you sure you want to remove this member?")) {
      const newMembers = group.members.filter(m => m.id !== id);
      let newLeaderId = group.leaderId;
      if (id === group.leaderId) {
        newLeaderId = newMembers[0].id;
      }

      saveGroupToStore({
        ...group,
        leaderId: newLeaderId,
        members: newMembers
      });
      if (activeMemberId === id) {
        setActiveMemberId(newLeaderId);
      }
    }
  };

  const handleSaveExit = () => {
    toast({
      title: "Proposal Saved",
      description: "You can resume this proposal later from the dashboard.",
    });
    setLocation("/");
  };

  const handleMakeLeader = (id: number) => {
    if (!group) return;
    const memberToLead = group.members.find(m => m.id === id);
    if (!memberToLead) return;

    const otherMembers = group.members.filter(m => m.id !== id);
    const reorderedMembers = [memberToLead, ...otherMembers];

    saveGroup({
      ...group,
      leaderId: id,
      members: reorderedMembers
    });
  };

  const handleAddMember = () => {
    if (!group) return;
    const newMember: Member = {
      id: Date.now(),
      firstName: "",
      middleName: "",
      lastName: "",
      requestedAmount: "0",
      documentType: "ssn",
      documentNumber: "",
    };
    const newGroup = {
      ...group,
      members: [...group.members, newMember]
    };
    saveGroup(newGroup);
    setActiveMemberId(newMember.id);
  };

  const handleRemoveMember = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!group) return;
    if (group.members.length === 1) return;

    if (window.confirm("Are you sure you want to remove this member?")) {
      const newMembers = group.members.filter(m => m.id !== id);
      let newLeaderId = group.leaderId;
      let finalMembers = newMembers;

      if (id === group.leaderId) {
        newLeaderId = newMembers[0].id;
      }

      const newGroup = {
        ...group,
        leaderId: newLeaderId,
        members: finalMembers
      };
      saveGroup(newGroup);
      if (activeMemberId === id) {
        setActiveMemberId(newLeaderId);
      }
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
        <Card className="max-w-md w-full border-none shadow-xl">
          <CardContent className="p-8 space-y-4">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto">
              <StarOff className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No Active Proposal</h2>
            <p className="text-slate-500 text-sm">Please validate a proposal first to start product configuration.</p>
            <Link href="/new-proposal">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">Start New Proposal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-secondary rounded-full" />
              </div>
              <span className="font-display font-bold text-slate-900 tracking-tight">ARTEMIS <span className="text-slate-400 font-medium">HUNTING MVP</span></span>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <h1 className="text-lg font-semibold text-slate-900">Product Configuration</h1>
          </div>
          <Button onClick={handleSaveExit} variant="outline" size="sm" className="gap-2">
            <Save className="w-4 h-4" /> Save & Exit
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-slate-900 text-white rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-slate-200">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Group ID</p>
              <p className="font-mono font-medium">{group.groupId}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Leader</p>
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
                activeMemberId === member.id
                  ? "bg-white text-primary border-primary shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]"
                  : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100/50"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="opacity-50">{index + 1}.</span>
                <span>{member.firstName} {member.lastName}</span>
                {member.id === group.leaderId && <Star className="w-3 h-3 text-secondary fill-secondary" />}
              </div>
              
              <div className="flex items-center gap-1">
                {member.id !== group.leaderId && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleMakeLeader(member.id); }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-secondary transition-all"
                    title="Make Leader"
                  >
                    <StarOff className="w-3 h-3" />
                  </button>
                )}
                {group.members.length > 1 && (
                  <button 
                    onClick={(e) => handleRemoveMember(member.id, e)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={handleAddMember}
            className="p-3 text-primary hover:bg-white hover:shadow-sm rounded-t-xl transition-all mb-[2px]"
            title="Add Member"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <Card className="border-none shadow-xl bg-white min-h-[400px]">
          <CardContent className="p-8 flex flex-col items-center justify-center text-slate-400">
            <User className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">Configuration forms for {group.members.find(m => m.id === activeMemberId)?.firstName}</p>
            <p className="text-sm">Personal, Business, Financial, and Credit details will be configured here.</p>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-between items-center">
          <Link href="/">
            <Button variant="outline" className="h-12 px-8">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
          <Button className="h-12 px-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20">
            Next Step
          </Button>
        </div>
      </main>
    </div>
  );
}
