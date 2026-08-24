export interface AuditEvent {
  id: string;
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  occurredAt: Date;
  correlationId: string;
  metadata?: Record<string, unknown>;
}
