export type ScopeType = "system" | "plan-type" | "plan" | "unit" | "plan-item";

export interface InstitutionalUnit {
  id: string;
  name: string;
  acronym?: string;
  parentId?: string;
  active: boolean;
}

export interface UserIdentity {
  id: string;
  externalSubject: string;
  displayName: string;
  active: boolean;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  role: string;
  scopeType: ScopeType;
  scopeId?: string;
  startsAt: Date;
  endsAt?: Date;
}
