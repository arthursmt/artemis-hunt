import { Member, LoanDetails, Group, EvidenceKey, EVIDENCE_METADATA, getRequiredEvidenceKeys, MemberEvidence, getEmptyEvidence } from "./proposalStore";

export const MANDATORY_FIELDS = {
  loan: [
    "loanValue",
    "loanType",
    "installments",
    "firstPaymentDate",
    "loanGoal"
  ] as const,
  personal: [
    "firstName",
    "lastName",
    "documentType",
    "documentNumber",
    "countryOfOrigin",
    "birthDate",
    "homeAddress1",
    "state",
    "city",
    "zipCode",
    "contact1Type",
    "contact1Number"
  ] as const,
  business: [
    "businessName",
    "businessType",
    "businessSector",
    "openingMonth",
    "openingYear",
    "businessAddress1",
    "state",
    "city",
    "zipCode",
    "contact1Type",
    "businessContact1"
  ] as const,
  financials: [
    "earningsMonthly",
    "monthlySales1",
    "operationalCostsMonthlyTotal",
    "personalExpensesMonthlyTotal"
  ] as const
};

export type PageType = keyof typeof MANDATORY_FIELDS;

export interface CompletionResult {
  filled: number;
  total: number;
  percentage: number;
}

export function getLoanPageCompletion(loanDetails: LoanDetails | undefined): CompletionResult {
  const fields = MANDATORY_FIELDS.loan;
  const total = fields.length;
  let filled = 0;

  if (!loanDetails) return { filled: 0, total, percentage: 0 };

  fields.forEach(field => {
    const value = loanDetails[field as keyof LoanDetails];
    if (value !== undefined && value !== null && value !== "" && value !== 0) {
      filled++;
    }
  });

  return {
    filled,
    total,
    percentage: Math.round((filled / total) * 100)
  };
}

export function getPersonalPageCompletion(member: Member): CompletionResult {
  const fields = MANDATORY_FIELDS.personal;
  const total = fields.length;
  let filled = 0;

  fields.forEach(field => {
    const value = member[field as keyof Member];
    if (value !== undefined && value !== null && value !== "") {
      filled++;
    }
  });

  return {
    filled,
    total,
    percentage: Math.round((filled / total) * 100)
  };
}

export function getBusinessPageCompletion(member: Member): CompletionResult {
  const fields = MANDATORY_FIELDS.business;
  const total = fields.length;
  let filled = 0;

  const data = member.businessData || {};

  fields.forEach(field => {
    const value = data[field as keyof typeof data];
    if (value !== undefined && value !== null && value !== "") {
      filled++;
    }
  });

  return {
    filled,
    total,
    percentage: Math.round((filled / total) * 100)
  };
}

export function getFinancialsPageCompletion(member: Member): CompletionResult {
  const fields = MANDATORY_FIELDS.financials;
  const total = fields.length;
  let filled = 0;

  const data = member.pnl || {};

  fields.forEach(field => {
    const value = data[field as keyof typeof data];
    if (value !== undefined && value !== null && value !== 0) {
      filled++;
    }
  });

  return {
    filled,
    total,
    percentage: Math.round((filled / total) * 100)
  };
}

export function getPageCompletion(
  memberId: number,
  pageType: PageType,
  member: Member,
  loanDetails: LoanDetails | undefined
): CompletionResult {
  switch (pageType) {
    case "loan":
      return getLoanPageCompletion(loanDetails);
    case "personal":
      return getPersonalPageCompletion(member);
    case "business":
      return getBusinessPageCompletion(member);
    case "financials":
      return getFinancialsPageCompletion(member);
    default:
      return { filled: 0, total: 0, percentage: 0 };
  }
}

export function getMemberCompletion(
  member: Member,
  loanDetails: LoanDetails | undefined
): CompletionResult {
  const loan = getLoanPageCompletion(loanDetails);
  const personal = getPersonalPageCompletion(member);
  const business = getBusinessPageCompletion(member);
  const financials = getFinancialsPageCompletion(member);

  const totalFilled = loan.filled + personal.filled + business.filled + financials.filled;
  const totalFields = loan.total + personal.total + business.total + financials.total;

  return {
    filled: totalFilled,
    total: totalFields,
    percentage: totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0
  };
}

export function getTotalMandatoryFieldsPerMember(): number {
  return (
    MANDATORY_FIELDS.loan.length +
    MANDATORY_FIELDS.personal.length +
    MANDATORY_FIELDS.business.length +
    MANDATORY_FIELDS.financials.length
  );
}

export function getProposalCompletionWithMinClients(
  group: Group,
  loanDetailsByMember: Record<number, LoanDetails>
): CompletionResult {
  const fieldsPerMember = getTotalMandatoryFieldsPerMember();
  const actualMemberCount = group.members.length;
  const denominatorMemberCount = Math.max(3, actualMemberCount);
  
  let totalFilled = 0;

  for (const member of group.members) {
    const completion = getMemberCompletion(member, loanDetailsByMember[member.id]);
    totalFilled += completion.filled;
  }

  const totalFields = fieldsPerMember * denominatorMemberCount;

  return {
    filled: totalFilled,
    total: totalFields,
    percentage: totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0
  };
}

export function isProposalComplete(
  group: Group,
  loanDetailsByMember: Record<number, LoanDetails>
): boolean {
  if (group.members.length < 3) return false;

  const completion = getProposalCompletionWithMinClients(group, loanDetailsByMember);
  return completion.percentage === 100;
}

export function getProposalCompletion(
  group: Group,
  loanDetailsByMember: Record<number, LoanDetails>
): CompletionResult {
  let totalFilled = 0;
  let totalFields = 0;

  for (const member of group.members) {
    const completion = getMemberCompletion(member, loanDetailsByMember[member.id]);
    totalFilled += completion.filled;
    totalFields += completion.total;
  }

  return {
    filled: totalFilled,
    total: totalFields,
    percentage: totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0
  };
}

export function getEvidenceCompletion(
  member: Member,
  loanGoal?: string
): CompletionResult {
  const requiredKeys = getRequiredEvidenceKeys(loanGoal);
  const evidence: MemberEvidence = member.evidence || getEmptyEvidence();
  
  let filled = 0;
  for (const key of requiredKeys) {
    if (evidence[key]?.uri) {
      filled++;
    }
  }
  
  return {
    filled,
    total: requiredKeys.length,
    percentage: requiredKeys.length > 0 ? Math.round((filled / requiredKeys.length) * 100) : 100
  };
}

export function getPersonalEvidenceKeys(): EvidenceKey[] {
  return ['clientSelfie', 'idFront', 'idBack', 'residenceProofOfAddress'];
}

export function getBusinessEvidenceKeys(loanGoal?: string): EvidenceKey[] {
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
  
  return keys;
}

export function getPersonalPageEvidenceCompletion(
  member: Member,
  loanGoal?: string
): CompletionResult {
  const keys = getPersonalEvidenceKeys();
  const requiredKeys = keys.filter(k => {
    const meta = EVIDENCE_METADATA[k];
    if (meta.required) return true;
    if (meta.conditionalOn?.loanGoal && loanGoal) {
      return meta.conditionalOn.loanGoal.includes(loanGoal);
    }
    return false;
  });
  
  const evidence: MemberEvidence = member.evidence || getEmptyEvidence();
  let filled = 0;
  for (const key of requiredKeys) {
    if (evidence[key]?.uri) {
      filled++;
    }
  }
  
  return {
    filled,
    total: requiredKeys.length,
    percentage: requiredKeys.length > 0 ? Math.round((filled / requiredKeys.length) * 100) : 100
  };
}

export function getBusinessPageEvidenceCompletion(
  member: Member,
  loanGoal?: string
): CompletionResult {
  const keys = getBusinessEvidenceKeys(loanGoal);
  const requiredKeys = keys.filter(k => {
    const meta = EVIDENCE_METADATA[k];
    if (meta.required) return true;
    if (meta.conditionalOn?.loanGoal && loanGoal) {
      return meta.conditionalOn.loanGoal.includes(loanGoal);
    }
    return false;
  });
  
  const evidence: MemberEvidence = member.evidence || getEmptyEvidence();
  let filled = 0;
  for (const key of requiredKeys) {
    if (evidence[key]?.uri) {
      filled++;
    }
  }
  
  return {
    filled,
    total: requiredKeys.length,
    percentage: requiredKeys.length > 0 ? Math.round((filled / requiredKeys.length) * 100) : 100
  };
}

export function getMemberCompletionWithEvidence(
  member: Member,
  loanDetails: LoanDetails | undefined
): CompletionResult {
  const loan = getLoanPageCompletion(loanDetails);
  const personal = getPersonalPageCompletion(member);
  const business = getBusinessPageCompletion(member);
  const financials = getFinancialsPageCompletion(member);
  const evidence = getEvidenceCompletion(member, loanDetails?.loanGoal);

  const totalFilled = loan.filled + personal.filled + business.filled + financials.filled + evidence.filled;
  const totalFields = loan.total + personal.total + business.total + financials.total + evidence.total;

  return {
    filled: totalFilled,
    total: totalFields,
    percentage: totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0
  };
}

export function getPersonalPageCompletionWithEvidence(
  member: Member,
  loanGoal?: string
): CompletionResult {
  const fields = getPersonalPageCompletion(member);
  const evidence = getPersonalPageEvidenceCompletion(member, loanGoal);
  
  const filled = fields.filled + evidence.filled;
  const total = fields.total + evidence.total;
  
  return {
    filled,
    total,
    percentage: total > 0 ? Math.round((filled / total) * 100) : 0
  };
}

export function getBusinessPageCompletionWithEvidence(
  member: Member,
  loanGoal?: string
): CompletionResult {
  const fields = getBusinessPageCompletion(member);
  const evidence = getBusinessPageEvidenceCompletion(member, loanGoal);
  
  const filled = fields.filled + evidence.filled;
  const total = fields.total + evidence.total;
  
  return {
    filled,
    total,
    percentage: total > 0 ? Math.round((filled / total) * 100) : 0
  };
}

export function getTotalMandatoryFieldsPerMemberWithEvidence(loanGoal?: string): number {
  const requiredEvidenceCount = getRequiredEvidenceKeys(loanGoal).length;
  return getTotalMandatoryFieldsPerMember() + requiredEvidenceCount;
}

export function getProposalCompletionWithMinClientsAndEvidence(
  group: Group,
  loanDetailsByMember: Record<number, LoanDetails>
): CompletionResult {
  const actualMemberCount = group.members.length;
  const denominatorMemberCount = Math.max(3, actualMemberCount);
  
  let totalFilled = 0;
  let totalRequired = 0;

  for (const member of group.members) {
    const loanDetails = loanDetailsByMember[member.id];
    const completion = getMemberCompletionWithEvidence(member, loanDetails);
    totalFilled += completion.filled;
    totalRequired += completion.total;
  }

  for (let i = group.members.length; i < denominatorMemberCount; i++) {
    const baseFields = getTotalMandatoryFieldsPerMember();
    const baseEvidence = 5;
    totalRequired += baseFields + baseEvidence;
  }

  return {
    filled: totalFilled,
    total: totalRequired,
    percentage: totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 0
  };
}

export function isProposalCompleteWithEvidence(
  group: Group,
  loanDetailsByMember: Record<number, LoanDetails>
): boolean {
  if (group.members.length < 3) return false;

  for (const member of group.members) {
    const loanDetails = loanDetailsByMember[member.id];
    const completion = getMemberCompletionWithEvidence(member, loanDetails);
    if (completion.percentage < 100) return false;
  }
  
  return true;
}

export function getMissingEvidenceCount(
  member: Member,
  loanGoal?: string
): number {
  const requiredKeys = getRequiredEvidenceKeys(loanGoal);
  const evidence: MemberEvidence = member.evidence || getEmptyEvidence();
  
  let missing = 0;
  for (const key of requiredKeys) {
    if (!evidence[key]?.uri) {
      missing++;
    }
  }
  
  return missing;
}

export function getTotalMissingEvidenceCount(
  group: Group,
  loanDetailsByMember: Record<number, LoanDetails>
): number {
  let total = 0;
  for (const member of group.members) {
    const loanGoal = loanDetailsByMember[member.id]?.loanGoal;
    total += getMissingEvidenceCount(member, loanGoal);
  }
  return total;
}
