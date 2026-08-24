export type PlanStatus = "draft" | "active" | "closed";

export interface PlanTemplateVersion {
  id: string;
  planType: string;
  version: number;
  publishedAt?: Date;
}

export interface InstitutionalPlan {
  id: string;
  templateVersionId: string;
  name: string;
  startsAt: Date;
  endsAt: Date;
  status: PlanStatus;
}

export interface PlanItem {
  id: string;
  planId: string;
  parentId?: string;
  type: string;
  title: string;
  order: number;
}
