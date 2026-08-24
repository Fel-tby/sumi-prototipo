export type MonitoringStatus =
  | "draft"
  | "submitted"
  | "returned"
  | "approved"
  | "consolidated";

export interface MonitoringUpdate {
  id: string;
  planItemId: string;
  referencePeriod: string;
  authorId: string;
  status: MonitoringStatus;
  summary: string;
  submittedAt?: Date;
  approvedAt?: Date;
}

export interface MonitoringReview {
  id: string;
  monitoringUpdateId: string;
  reviewerId: string;
  decision: "approve" | "return";
  reason?: string;
  decidedAt: Date;
}
