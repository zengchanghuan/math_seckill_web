import type { DeepseekTaskPlan } from './types';

type SolveTaskResp = {
  ok: boolean;
  answer?: string;
  analysis?: string;
  error?: string;
  raw?: unknown;
};

type VerifyResp = {
  ok: boolean;
  verdict: 'PASS' | 'FAIL' | 'UNKNOWN';
  reason?: string;
  raw?: unknown;
};

export async function sympySolveTask(plan: DeepseekTaskPlan): Promise<SolveTaskResp> {
  const base = process.env.SYMPY_SOLVER_BASE_URL || 'http://localhost:8010';
  const res = await fetch(`${base}/solve_task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });
  if (!res.ok) {
    return { ok: false, error: `HTTP_${res.status}: ${await res.text()}` };
  }
  return (await res.json()) as SolveTaskResp;
}

export async function sympyVerify(args: {
  plan: DeepseekTaskPlan;
  answer: string;
}): Promise<VerifyResp> {
  const base = process.env.SYMPY_SOLVER_BASE_URL || 'http://localhost:8010';
  const res = await fetch(`${base}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    return { ok: false, verdict: 'UNKNOWN', reason: `HTTP_${res.status}: ${await res.text()}` };
  }
  return (await res.json()) as VerifyResp;
}




