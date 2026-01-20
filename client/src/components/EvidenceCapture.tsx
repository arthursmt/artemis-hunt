import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Check, AlertCircle, RotateCcw, Eye } from "lucide-react";
import { 
  EvidenceKey, 
  EVIDENCE_METADATA, 
  MemberEvidence,
  getEmptyEvidence,
  getRequiredEvidenceKeys
} from "@/lib/proposalStore";

interface EvidenceCaptureProps {
  title: string;
  evidenceKeys: EvidenceKey[];
  evidence: MemberEvidence | undefined;
  loanGoal?: string;
  onCapture: (key: EvidenceKey, uri: string) => void;
  onView?: (key: EvidenceKey, uri: string) => void;
}

export function EvidenceCapture({
  title,
  evidenceKeys,
  evidence,
  loanGoal,
  onCapture,
  onView
}: EvidenceCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentKeyRef = useRef<EvidenceKey | null>(null);
  
  const safeEvidence = evidence || getEmptyEvidence();
  const requiredKeys = getRequiredEvidenceKeys(loanGoal);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentKeyRef.current) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        onCapture(currentKeyRef.current!, dataUrl);
        currentKeyRef.current = null;
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCaptureClick = (key: EvidenceKey) => {
    currentKeyRef.current = key;
    fileInputRef.current?.click();
  };

  const getStatus = (key: EvidenceKey): 'completed' | 'missing' | 'optional' => {
    const hasPhoto = safeEvidence[key]?.uri;
    const isRequired = requiredKeys.includes(key);
    
    if (hasPhoto) return 'completed';
    if (isRequired) return 'missing';
    return 'optional';
  };

  const getMissingRequiredCount = () => {
    return evidenceKeys.filter(key => {
      const isRequired = requiredKeys.includes(key);
      const hasPhoto = safeEvidence[key]?.uri;
      return isRequired && !hasPhoto;
    }).length;
  };

  const missingCount = getMissingRequiredCount();

  return (
    <Card className="mt-4" data-testid={`evidence-capture-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Camera className="w-4 h-4" />
          {title}
          {missingCount > 0 && (
            <Badge variant="destructive" className="ml-auto text-xs">
              {missingCount} required
            </Badge>
          )}
          {missingCount === 0 && evidenceKeys.some(k => requiredKeys.includes(k)) && (
            <Badge variant="default" className="ml-auto text-xs bg-green-500">
              <Check className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-2">
          {evidenceKeys.map(key => {
            const meta = EVIDENCE_METADATA[key];
            const status = getStatus(key);
            const item = safeEvidence[key];
            
            return (
              <div 
                key={key}
                className="flex items-center gap-2 p-2 bg-muted/30 rounded-md"
                data-testid={`evidence-item-${key}`}
              >
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {item?.uri ? (
                    <img 
                      src={item.uri} 
                      alt={meta.label}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => onView?.(key, item.uri)}
                    />
                  ) : (
                    <Camera className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium truncate">{meta.label}</span>
                    {status === 'completed' && (
                      <Check className="w-3 h-3 text-green-500 shrink-0" />
                    )}
                    {status === 'missing' && (
                      <AlertCircle className="w-3 h-3 text-destructive shrink-0" />
                    )}
                  </div>
                </div>

                <Button 
                  size="sm" 
                  variant={item?.uri ? "outline" : "default"}
                  className="h-7 px-2 shrink-0"
                  onClick={() => handleCaptureClick(key)}
                  data-testid={`btn-capture-${key}`}
                >
                  {item?.uri ? (
                    <RotateCcw className="w-3 h-3" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}

interface PersonalDataEvidenceProps {
  evidence: MemberEvidence | undefined;
  loanGoal?: string;
  onCapture: (key: EvidenceKey, uri: string) => void;
}

export function PersonalDataEvidence({ evidence, loanGoal, onCapture }: PersonalDataEvidenceProps) {
  const keys: EvidenceKey[] = ['clientSelfie', 'idFront', 'idBack', 'residenceProofOfAddress'];
  
  return (
    <EvidenceCapture
      title="Client Photos"
      evidenceKeys={keys}
      evidence={evidence}
      loanGoal={loanGoal}
      onCapture={onCapture}
    />
  );
}

interface BusinessDataEvidenceProps {
  evidence: MemberEvidence | undefined;
  loanGoal?: string;
  onCapture: (key: EvidenceKey, uri: string) => void;
}

export function BusinessDataEvidence({ evidence, loanGoal, onCapture }: BusinessDataEvidenceProps) {
  const keys: EvidenceKey[] = [
    'businessProofOfAddress', 
    'businessPhoto', 
    'inventoryPhoto', 
    'utilityBillElectricity', 
    'utilityBillWater'
  ];
  
  if (loanGoal === 'Investment') {
    keys.push('renovationPhoto');
  }
  if (loanGoal === 'Equipment purchase') {
    keys.push('newMachineryPhoto');
  }
  
  return (
    <EvidenceCapture
      title="Business Photos"
      evidenceKeys={keys}
      evidence={evidence}
      loanGoal={loanGoal}
      onCapture={onCapture}
    />
  );
}
