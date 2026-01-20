import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, Eye, RotateCcw, Check, AlertCircle, User, Building2, FileCheck } from "lucide-react";
import { 
  Member, 
  EvidenceKey, 
  EVIDENCE_METADATA, 
  MemberEvidence, 
  EvidenceItem,
  getEmptyEvidence,
  getRequiredEvidenceKeys
} from "@/lib/proposalStore";

interface EvidenceHubProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  activeMemberId: number;
  loanDetailsByMember: Record<number, { loanGoal?: string }>;
  onCaptureEvidence: (memberId: number, key: EvidenceKey, uri: string) => void;
}

export function EvidenceHub({
  open,
  onOpenChange,
  members,
  activeMemberId,
  loanDetailsByMember,
  onCaptureEvidence
}: EvidenceHubProps) {
  const [selectedMemberId, setSelectedMemberId] = useState(activeMemberId);
  const [viewingImage, setViewingImage] = useState<{ key: EvidenceKey; uri: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadKey, setCurrentUploadKey] = useState<EvidenceKey | null>(null);

  const selectedMember = members.find(m => m.id === selectedMemberId) || members[0];
  const loanGoal = loanDetailsByMember[selectedMemberId]?.loanGoal;
  const evidence: MemberEvidence = selectedMember?.evidence || getEmptyEvidence();

  const identityKeys: EvidenceKey[] = ['clientSelfie', 'idFront', 'idBack', 'residenceProofOfAddress'];
  const businessKeys: EvidenceKey[] = ['businessProofOfAddress', 'businessPhoto', 'inventoryPhoto', 'utilityBillElectricity', 'utilityBillWater'];
  const conditionalKeys: EvidenceKey[] = [];
  
  if (loanGoal === 'Investment') {
    conditionalKeys.push('renovationPhoto');
  }
  if (loanGoal === 'Equipment purchase') {
    conditionalKeys.push('newMachineryPhoto');
  }

  const requiredKeys = getRequiredEvidenceKeys(loanGoal);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUploadKey) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        onCaptureEvidence(selectedMemberId, currentUploadKey, dataUrl);
        setCurrentUploadKey(null);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCapture = (key: EvidenceKey) => {
    setCurrentUploadKey(key);
    fileInputRef.current?.click();
  };

  const getStatus = (key: EvidenceKey): 'completed' | 'missing' | 'optional' => {
    const hasPhoto = evidence[key]?.uri;
    const isRequired = requiredKeys.includes(key);
    
    if (hasPhoto) return 'completed';
    if (isRequired) return 'missing';
    return 'optional';
  };

  const renderEvidenceItem = (key: EvidenceKey) => {
    const meta = EVIDENCE_METADATA[key];
    const status = getStatus(key);
    const item = evidence[key];

    return (
      <div 
        key={key}
        className="flex items-center gap-3 p-3 bg-muted/30 rounded-md"
        data-testid={`evidence-item-${key}`}
      >
        <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {item?.uri ? (
            <img 
              src={item.uri} 
              alt={meta.label} 
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{meta.label}</span>
            {status === 'completed' && (
              <Badge variant="default" className="bg-green-500 text-white text-xs">
                <Check className="w-3 h-3 mr-1" />
                Done
              </Badge>
            )}
            {status === 'missing' && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Required
              </Badge>
            )}
            {status === 'optional' && (
              <Badge variant="secondary" className="text-xs">
                Optional
              </Badge>
            )}
          </div>
          {item?.capturedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(item.capturedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {item?.uri ? (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setViewingImage({ key, uri: item.uri })}
                data-testid={`btn-view-${key}`}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleCapture(key)}
                data-testid={`btn-retake-${key}`}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button 
              size="sm"
              onClick={() => handleCapture(key)}
              data-testid={`btn-capture-${key}`}
            >
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
          )}
        </div>
      </div>
    );
  };

  const getMissingCount = () => {
    let missing = 0;
    for (const key of requiredKeys) {
      if (!evidence[key]?.uri) missing++;
    }
    return missing;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Evidence & Photos
              {getMissingCount() > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {getMissingCount()} missing
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <Tabs 
              value={String(selectedMemberId)} 
              onValueChange={(v) => setSelectedMemberId(Number(v))}
              className="w-full"
            >
              <TabsList className="w-full justify-start mb-4 overflow-x-auto">
                {members.map((member, idx) => {
                  const memberEvidence = member.evidence || getEmptyEvidence();
                  const memberLoanGoal = loanDetailsByMember[member.id]?.loanGoal;
                  const memberRequiredKeys = getRequiredEvidenceKeys(memberLoanGoal);
                  let memberMissing = 0;
                  for (const key of memberRequiredKeys) {
                    if (!memberEvidence[key]?.uri) memberMissing++;
                  }
                  
                  return (
                    <TabsTrigger 
                      key={member.id} 
                      value={String(member.id)}
                      className="relative"
                      data-testid={`tab-member-evidence-${idx + 1}`}
                    >
                      {member.firstName || `Member ${idx + 1}`}
                      {memberMissing > 0 && (
                        <span className="ml-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                          {memberMissing}
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {members.map((member) => (
                <TabsContent key={member.id} value={String(member.id)} className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      Client Identity
                    </h3>
                    <div className="space-y-2">
                      {identityKeys.map(renderEvidenceItem)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      Business Existence
                    </h3>
                    <div className="space-y-2">
                      {businessKeys.map(renderEvidenceItem)}
                    </div>
                  </div>

                  {conditionalKeys.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                        <FileCheck className="w-4 h-4" />
                        Conditional Photos
                      </h3>
                      <div className="space-y-2">
                        {conditionalKeys.map(renderEvidenceItem)}
                      </div>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {viewingImage && EVIDENCE_METADATA[viewingImage.key].label}
            </DialogTitle>
          </DialogHeader>
          {viewingImage && (
            <img 
              src={viewingImage.uri} 
              alt="Evidence" 
              className="w-full rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="evidence-file-input"
      />
    </>
  );
}
