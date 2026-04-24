export type AuditEvent = {
  id: string;
  timestamp: string;
  userId?: string;
  ip: string;
  userAgent?: string;
  action: string;
  resource?: string;
  status: "success" | "failure" | "blocked";
  details?: Record<string, unknown>;
};

const auditTrail: AuditEvent[] = [];

const MAX_EVENTS = 10000;

export function logAuditEvent(event: Omit<AuditEvent, "id" | "timestamp">): void {
  const newEvent: AuditEvent = {
    ...event,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  auditTrail.push(newEvent);

  if (auditTrail.length > MAX_EVENTS) {
    auditTrail.shift();
  }

  console.log(`[AUDIT] ${newEvent.action}`, {
    userId: newEvent.userId,
    ip: newEvent.ip,
    status: newEvent.status,
    resource: newEvent.resource,
  });
}

export function getAuditLogs(filters?: {
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}): AuditEvent[] {
  let results = [...auditTrail];

  if (filters?.userId) {
    results = results.filter((e) => e.userId === filters.userId);
  }

  if (filters?.action) {
    results = results.filter((e) => e.action === filters.action);
  }

  if (filters?.startDate) {
    results = results.filter(
      (e) => e.timestamp >= filters.startDate!
    );
  }

  if (filters?.endDate) {
    results = results.filter((e) => e.timestamp <= filters.endDate!);
  }

  return results.slice(-1000);
}

export function getSuspiciousActivity(ip: string): {
  failedLogins: number;
  lastAttempt: string | null;
  locked: boolean;
} {
  const events = auditTrail.filter(
    (e) => e.ip === ip && e.action === "login_attempt"
  );

  const failedLogins = events.filter(
    (e) => e.status === "failure"
  ).length;

  const lastAttempt =
    events.length > 0 ? events[events.length - 1].timestamp : null;

  const locked = failedLogins >= 10;

  return { failedLogins, lastAttempt, locked };
}

export function clearOldEvents(daysOld: number = 30): void {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);
  const cutoffStr = cutoff.toISOString();

  while (auditTrail.length > 0 && auditTrail[0].timestamp < cutoffStr) {
    auditTrail.shift();
  }
}