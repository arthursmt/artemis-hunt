import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Check, AlertCircle, Pen, Trash2, User, Calendar, DollarSign, Hash } from "lucide-react";
import { useProposalStore, Member, LoanDetails, ContractSignature } from "@/lib/proposalStore";
import { isProposalCompleteWithEvidence } from "@/lib/completionHelpers";
import { apiRequest, queryClient, getEnvironmentInfo } from "@/lib/queryClient";
import SignatureCanvas from "react-signature-canvas";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function parseLoanValue(loanValue: string): number {
  const cleaned = loanValue.replace(/[$,]/g, "");
  return parseFloat(cleaned) || 0;
}

const CONTRACT_TEXT = `
CREDIT CONTRACT AGREEMENT

This Credit Contract Agreement ("Agreement") is entered into by and between the Microfinance Institution ("Lender") and the undersigned borrowers ("Borrowers"), collectively forming a lending group.

ARTICLE 1: DEFINITIONS

1.1 "Principal Amount" means the total amount of credit extended to the Borrowers under this Agreement.

1.2 "Interest Rate" means the annual percentage rate (APR) of 14% applied to the Principal Amount.

1.3 "Repayment Schedule" means the schedule of monthly installment payments as specified in the loan details for each Borrower.

1.4 "Group Liability" means the joint and several liability of all Borrowers for the total loan amount.

ARTICLE 2: LOAN TERMS

2.1 The Lender agrees to extend credit to each Borrower in the amounts specified in their individual loan details.

2.2 Each Borrower shall repay their portion of the loan according to the agreed installment schedule, beginning on the first payment date specified.

2.3 Monthly payments shall include principal, interest at 14% APR, and any applicable insurance premiums.

ARTICLE 3: GROUP LIABILITY

3.1 All Borrowers in the lending group are jointly and severally liable for the entire loan amount.

3.2 If any Borrower fails to make a payment, the remaining Borrowers are responsible for covering the missed payment.

3.3 The group leader is responsible for coordinating payments and communication with the Lender.

ARTICLE 4: INSURANCE

4.1 Credit life insurance is included to protect Borrowers and their families in case of death or permanent disability.

4.2 Optional insurance products may be selected to provide additional coverage.

ARTICLE 5: DEFAULT AND REMEDIES

5.1 A Borrower shall be considered in default if:
   (a) Any payment is more than 30 days past due
   (b) Any material misrepresentation is discovered
   (c) Any Borrower becomes insolvent

5.2 Upon default, the Lender may:
   (a) Declare the entire outstanding balance immediately due
   (b) Report the default to credit bureaus
   (c) Pursue legal remedies to recover the debt

ARTICLE 6: REPRESENTATIONS AND WARRANTIES

6.1 Each Borrower represents and warrants that:
   (a) All information provided in the application is true and accurate
   (b) The loan proceeds will be used for the stated business purpose
   (c) The Borrower has the legal capacity to enter into this Agreement

ARTICLE 7: GOVERNING LAW

7.1 This Agreement shall be governed by and construed in accordance with applicable laws.

7.2 Any disputes arising from this Agreement shall be resolved through arbitration.

ARTICLE 8: MISCELLANEOUS

8.1 This Agreement constitutes the entire agreement between the parties.

8.2 Any amendments must be in writing and signed by all parties.

8.3 If any provision is found to be unenforceable, the remaining provisions shall continue in effect.

BY SIGNING BELOW, EACH BORROWER ACKNOWLEDGES THAT THEY HAVE READ, UNDERSTAND, AND AGREE TO ALL TERMS AND CONDITIONS OF THIS CREDIT CONTRACT AGREEMENT.
`;

interface SignaturePadRef {
  clear: () => void;
  toDataURL: () => string;
  isEmpty: () => boolean;
}

export default function ContractScreen() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const { getProposalById, updateProposal } = useProposalStore();
  
  const proposalId = params.id;
  const proposal = proposalId ? getProposalById(proposalId) : null;
  const group = proposal?.data.group;
  const loanDetailsByMember = proposal?.data.loanDetailsByMember || {};
  
  const [contractRead, setContractRead] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const signatureRefs = useRef<Record<number, SignaturePadRef | null>>({});
  
  // Check if proposal is complete
  const isComplete = group ? isProposalCompleteWithEvidence(group, loanDetailsByMember) : false;
  
  // Redirect if proposal is incomplete
  useEffect(() => {
    if (proposalId && group && !isComplete) {
      toast({
        title: "Incomplete Proposal",
        description: "Complete the proposal before signing the contract.",
        variant: "destructive",
      });
      setLocation(`/product-config/${proposalId}`);
    }
  }, [proposalId, group, isComplete, setLocation, toast]);
  
  // Check if contract was previously read
  useEffect(() => {
    if (group?.contractReadAt) {
      setContractRead(true);
    }
  }, [group?.contractReadAt]);
  
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 10;
    
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      setContractRead(true);
      
      // Persist contract read state
      if (proposalId && group && !group.contractReadAt) {
        updateProposal(proposalId, prev => ({
          ...prev,
          data: {
            ...prev.data,
            group: {
              ...prev.data.group,
              contractReadAt: new Date().toISOString()
            }
          }
        }));
      }
    }
  }, [proposalId, group, updateProposal]);
  
  const handleClearSignature = (memberId: number) => {
    const sigRef = signatureRefs.current[memberId];
    if (sigRef) {
      sigRef.clear();
    }
    
    // Also clear saved signature
    if (proposalId) {
      updateProposal(proposalId, prev => ({
        ...prev,
        data: {
          ...prev.data,
          group: {
            ...prev.data.group,
            members: prev.data.group.members.map(m => 
              m.id === memberId 
                ? { ...m, signatures: { ...m.signatures, contractSignature: null } }
                : m
            )
          }
        }
      }));
    }
  };
  
  const handleSaveSignature = (member: Member) => {
    const sigRef = signatureRefs.current[member.id];
    if (!sigRef || sigRef.isEmpty()) {
      toast({
        title: "No Signature",
        description: "Please draw a signature before saving.",
        variant: "destructive",
      });
      return;
    }
    
    const loanDetails = loanDetailsByMember[member.id];
    const loanAmount = parseLoanValue(loanDetails?.loanValue || "0");
    
    const signature: ContractSignature = {
      dataUrl: sigRef.toDataURL(),
      signedAt: new Date().toISOString(),
      signerName: `${member.firstName} ${member.lastName}`,
      loanAmount,
      firstPaymentDate: loanDetails?.firstPaymentDate || "",
      installments: loanDetails?.installments || 0
    };
    
    if (proposalId) {
      updateProposal(proposalId, prev => ({
        ...prev,
        data: {
          ...prev.data,
          group: {
            ...prev.data.group,
            members: prev.data.group.members.map(m => 
              m.id === member.id 
                ? { ...m, signatures: { ...m.signatures, contractSignature: signature } }
                : m
            )
          }
        }
      }));
      
      toast({
        title: "Signature Saved",
        description: `${member.firstName}'s signature has been saved.`,
      });
    }
  };
  
  // Check if all members have signed
  const allMembersSigned = group?.members.every(m => m.signatures?.contractSignature) ?? false;
  const canSubmit = contractRead && agreementChecked && allMembersSigned;
  
  const handleSubmitClick = () => {
    if (!canSubmit) return;
    setConfirmModalOpen(true);
  };
  
  const handleConfirmSubmit = async (e: React.MouseEvent) => {
    // FIRST LINE: log that click was received
    console.log("[CONFIRM SUBMIT CLICK] handler invoked");
    
    // Prevent any form submission or navigation
    e.preventDefault();
    e.stopPropagation();
    
    console.log("[CONFIRM SUBMIT CLICK] after preventDefault");
    
    if (!proposalId || !proposal) {
      console.log("[CONFIRM SUBMIT CLICK] BLOCKED: missing proposalId or proposal");
      return;
    }
    
    // ========== PRE-SUBMIT CHECKLIST ==========
    const validationErrors: string[] = [];
    
    // 1. Validate groupId
    const groupId = proposal.groupId || proposal.data?.group?.groupId;
    if (!groupId || groupId.trim() === "") {
      validationErrors.push("groupId ausente");
    }
    
    // 2. Validate members array
    const members = proposal.data?.group?.members;
    if (!members || !Array.isArray(members) || members.length === 0) {
      validationErrors.push("members vazio ou ausente");
    }
    
    // 3. Validate leader has name (firstName required)
    if (members && members.length > 0) {
      const leader = members.find((m: any) => m.id === proposal.data.group.leaderId) || members[0];
      if (!leader?.firstName || leader.firstName.trim() === "") {
        validationErrors.push("nome do líder ausente");
      }
      
      // 4. Validate mandatory photo (clientSelfie) for each member
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const selfie = member.evidence?.clientSelfie;
        if (!selfie?.uri) {
          validationErrors.push(`clientSelfie ausente para ${member.firstName || `membro ${i + 1}`}`);
        }
      }
    }
    
    // If validation failed, show error and block submit
    if (validationErrors.length > 0) {
      console.error("[PRE-SUBMIT] Validation failed:", validationErrors);
      toast({
        title: "Não é possível enviar",
        description: validationErrors.join("; "),
        variant: "destructive",
      });
      return;
    }
    
    console.log("[PRE-SUBMIT] Validation passed");
    // ========== END PRE-SUBMIT CHECKLIST ==========
    
    setIsSubmitting(true);
    
    try {
      // Get apiBase from global (set in App.tsx based on host/query detection)
      const apiBase = window.__ARTEMIS_API_BASE__;
      const isEmbedded = window.__ARTEMIS_EMBEDDED_MODE__ === true;
      
      console.log("[EMBED SUBMIT] isEmbedded=", isEmbedded);
      console.log("[EMBED SUBMIT] apiBase=", apiBase);
      
      // HARD BLOCK: if embedded but no apiBase, do NOT fallback
      if (isEmbedded && !apiBase) {
        console.error("[EMBED SUBMIT] BLOCKED: embedded mode but missing apiBase");
        toast({
          title: "Configuration Error",
          description: "Embedded mode misconfigured: missing apiBase from Hub.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Strip optional photos from payload to reduce size (keep only photos with data)
      const strippedMembers = members!.map((member: any) => {
        const evidence = member.evidence || {};
        const strippedEvidence: Record<string, any> = {};
        for (const [key, value] of Object.entries(evidence)) {
          const evidenceItem = value as { uri?: string } | null;
          if (evidenceItem && evidenceItem.uri) {
            strippedEvidence[key] = evidenceItem;
          }
        }
        return {
          ...member,
          evidence: Object.keys(strippedEvidence).length > 0 ? strippedEvidence : undefined
        };
      });
      
      // Build complete payload with groupId and members at payload level
      const fullPayload = {
        ...proposal,
        status: "under_evaluation",
        groupId: groupId,
        members: strippedMembers,
        data: {
          ...proposal.data,
          group: {
            ...proposal.data.group,
            groupId: groupId,
            members: strippedMembers
          }
        }
      };
      
      // Final submission payload
      const submissionPayload = {
        proposalId,
        payload: fullPayload
      };
      
      const bodyString = JSON.stringify(submissionPayload);
      const payloadBytes = bodyString.length;
      const photoCount = strippedMembers.reduce((count: number, m: any) => {
        const ev = m.evidence || {};
        return count + Object.keys(ev).filter(k => ev[k]?.uri).length;
      }, 0);
      
      // Compute target URL based on embedded mode
      const targetUrl = isEmbedded ? `${apiBase}/api/proposals/submit` : "/api/proposals/submit";
      
      // Debug log (dev only style)
      console.log("[SUBMIT OUTBOUND]", {
        apiBase: apiBase || "(local)",
        url: targetUrl,
        proposalId,
        groupId,
        membersCount: strippedMembers.length,
        payloadKeys: Object.keys(fullPayload)
      });
      
      // Submit to configured endpoint (Hub/Arise in production, local in dev)
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyString,
      });
      
      console.log("[EMBED SUBMIT] response status=", res.status);
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      
      // Invalidate submissions cache
      queryClient.invalidateQueries({ queryKey: ["/api/proposals/submissions"] });
      
      // Update local state
      updateProposal(proposalId, prev => ({
        ...prev,
        status: "under_evaluation"
      }));
      
      toast({
        title: "Proposal Submitted",
        description: "Your proposal has been submitted successfully for evaluation.",
      });
      
      setConfirmModalOpen(false);
      setLocation("/under-evaluation");
      
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit the proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!proposal || !group) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center font-display">
        <Card className="max-w-md w-full border-none shadow-xl">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Proposal Not Found</h2>
            <p className="text-slate-500">The proposal you're looking for doesn't exist.</p>
            <Link href="/ongoing">
              <Button className="w-full bg-primary text-white">Back to Proposals</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const envInfo = getEnvironmentInfo();
  
  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-display">
      {/* Debug Banner */}
      <div className={cn(
        "text-xs px-4 py-1 text-center font-mono",
        envInfo.isDev ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
      )} data-testid="env-debug-banner">
        {envInfo.mode.toUpperCase()} | host={window.location.host} | apiBase={envInfo.apiBase || '(same-origin)'} | Submit: {envInfo.submitUrl}
      </div>
      
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/product-config/${proposalId}`}>
              <Button variant="ghost" size="sm" className="gap-2" data-testid="btn-back-config">
                <ArrowLeft className="w-4 h-4" />
                Back to Product Config
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold text-slate-900">Credit Contract</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={allMembersSigned ? "default" : "secondary"} className={allMembersSigned ? "bg-green-500" : ""}>
              {group.members.filter(m => m.signatures?.contractSignature).length}/{group.members.length} Signed
            </Badge>
          </div>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Contract Text Section */}
        <Card className="border-none shadow-xl bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Contract Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="h-[300px] overflow-y-auto border rounded-lg p-4 bg-slate-50 font-mono text-sm whitespace-pre-wrap"
              data-testid="contract-text-container"
            >
              {CONTRACT_TEXT}
            </div>
            
            {!contractRead && (
              <p className="text-sm text-amber-600 mt-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Scroll to the end to enable agreement
              </p>
            )}
            {contractRead && (
              <p className="text-sm text-green-600 mt-3 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Contract fully read
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Agreement Checkbox */}
        <Card className="border-none shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Checkbox
                id="agreement"
                checked={agreementChecked}
                onCheckedChange={(checked) => setAgreementChecked(checked === true)}
                disabled={!contractRead}
                data-testid="checkbox-agreement"
              />
              <Label 
                htmlFor="agreement" 
                className={cn(
                  "text-sm cursor-pointer",
                  !contractRead && "text-slate-400"
                )}
              >
                I confirm all clients have read and agree to the terms and conditions.
              </Label>
            </div>
          </CardContent>
        </Card>
        
        {/* Signature Section */}
        <Card className="border-none shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pen className="w-5 h-5 text-primary" />
              Client Signatures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {group.members.map((member, index) => {
              const loanDetails = loanDetailsByMember[member.id];
              const hasSavedSignature = !!member.signatures?.contractSignature;
              const savedSignature = member.signatures?.contractSignature;
              
              return (
                <div 
                  key={member.id}
                  className={cn(
                    "border rounded-lg p-4 space-y-4",
                    hasSavedSignature ? "border-green-300 bg-green-50/30" : "border-slate-200"
                  )}
                  data-testid={`signature-card-${member.id}`}
                >
                  {/* Member Info Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {index + 1}. {member.firstName} {member.lastName}
                          {member.id === group.leaderId && (
                            <Badge variant="secondary" className="ml-2 text-xs">Leader</Badge>
                          )}
                        </p>
                      </div>
                    </div>
                    {hasSavedSignature && (
                      <Badge variant="default" className="bg-green-500">
                        <Check className="w-3 h-3 mr-1" />
                        Signed
                      </Badge>
                    )}
                  </div>
                  
                  {/* Loan Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-slate-500 text-xs">Loan Amount</p>
                        <p className="font-medium">{loanDetails?.loanValue || "--"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-slate-500 text-xs">First Payment</p>
                        <p className="font-medium">{loanDetails?.firstPaymentDate || "--"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-slate-500 text-xs">Installments</p>
                        <p className="font-medium">{loanDetails?.installments || "--"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-slate-500 text-xs">Interest</p>
                        <p className="font-medium">14% APR</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Signature Pad or Saved Signature */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Signature:</p>
                    
                    {hasSavedSignature ? (
                      <div className="border rounded-lg bg-white p-2">
                        <img 
                          src={savedSignature?.dataUrl} 
                          alt={`${member.firstName}'s signature`}
                          className="h-24 w-full object-contain"
                        />
                        <p className="text-xs text-slate-400 mt-2">
                          Signed on {new Date(savedSignature?.signedAt || "").toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-lg bg-white">
                        <SignatureCanvas
                          ref={(ref) => { signatureRefs.current[member.id] = ref; }}
                          canvasProps={{
                            className: "w-full h-24 signature-canvas",
                            style: { width: "100%", height: "96px" }
                          }}
                          backgroundColor="white"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Signature Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleClearSignature(member.id)}
                      className="gap-2"
                      data-testid={`btn-clear-signature-${member.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </Button>
                    {!hasSavedSignature && (
                      <Button
                        size="sm"
                        onClick={() => handleSaveSignature(member)}
                        className="gap-2 bg-primary"
                        data-testid={`btn-save-signature-${member.id}`}
                      >
                        <Check className="w-3 h-3" />
                        Save Signature
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        
        {/* Submit Section */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-slate-500">
            {!allMembersSigned && (
              <span className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                All clients must sign before submitting.
              </span>
            )}
          </div>
          
          <Button
            onClick={handleSubmitClick}
            disabled={!canSubmit}
            className={cn(
              "h-12 px-12 font-bold shadow-xl",
              canSubmit 
                ? "bg-green-600 hover:bg-green-700 text-white shadow-green-600/20" 
                : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
            )}
            data-testid="btn-submit-proposal"
          >
            Submit Proposal
          </Button>
        </div>
      </main>
      
      {/* Confirmation Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit proposal?</DialogTitle>
            <DialogDescription>
              This will send the contract, signatures, photos, and all collected application data for review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setConfirmModalOpen(false)}
              disabled={isSubmitting}
              data-testid="btn-cancel-submit"
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={(e) => {
                console.log("[CONFIRM BTN] raw click event");
                handleConfirmSubmit(e);
              }}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              data-testid="btn-confirm-submit"
            >
              {isSubmitting ? "Submitting..." : "Confirm Submit"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
