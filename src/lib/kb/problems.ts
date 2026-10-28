// The problems inside a merged ticket. causes.ts files a report by its tenant, and the desk counts
// it there. A report the desk read as a one-day move (desk-notes.json) is not a flipped month: it
// stays counted where it is filed, and is also counted as its own problem, `shift`.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift' | 'unplaced';

export type ProblemGroup = { problem: Problem; reports: number; tenants: number; firstSeen: string; lastSeen: string };

function group(problem: Problem, rs: Report[]): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return { problem, reports: rs.length, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
}

export function groupByProblem(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const filed = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = causeOf(r, tenantOf(r)) ?? 'unplaced';
    filed.set(p, [...(filed.get(p) ?? []), r]);
  }
  const groups = [...filed.entries()].map(([p, rs]) => group(p, rs)).sort((a, b) => b.reports - a.reports);
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  return moved.length ? [...groups, group('shift', moved)] : groups;
}
