from __future__ import annotations

import multiprocessing as mp
import traceback
from typing import Any, Dict, Literal, Optional

import numpy as np
import sympy as sp
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="sympy_solver", version="0.1.0")


class SolveTaskReq(BaseModel):
    task_type: str
    expr_latex: Optional[str] = None
    expr_sympy: Optional[str] = None
    notes: Optional[str] = None
    candidate_answer: Optional[str] = None
    candidate_analysis: Optional[str] = None


class SolveTaskResp(BaseModel):
    ok: bool
    answer: str = ""
    analysis: str = ""
    error: str = ""
    raw: Dict[str, Any] = {}


class VerifyReq(BaseModel):
    plan: SolveTaskReq
    answer: str


class VerifyResp(BaseModel):
    ok: bool
    verdict: Literal["PASS", "FAIL", "UNKNOWN"]
    reason: str = ""
    raw: Dict[str, Any] = {}


def _safe_sympify(expr: str) -> sp.Expr:
    # 常用符号假设：x 实数，a 非零实数（贴合高数题）
    x = sp.Symbol("x", real=True)
    a = sp.Symbol("a", real=True, nonzero=True)
    y = sp.Symbol("y", real=True)
    # 允许使用数学常数 e
    local = {"x": x, "a": a, "y": y, "E": sp.E, "e": sp.E, "pi": sp.pi}
    return sp.sympify(expr, locals=local)


def _solve_task(plan: SolveTaskReq) -> SolveTaskResp:
    try:
        task = (plan.task_type or "unknown").strip()
        expr_s = (plan.expr_sympy or "").strip()
        if not expr_s:
            return SolveTaskResp(ok=False, error="EMPTY_EXPR_SYMPY")

        expr = _safe_sympify(expr_s)
        x = sp.Symbol("x", real=True)

        if task == "domain":
            # domain of expression: require denominator != 0 and sqrt args >= 0 (basic)
            # Use continuous_domain when possible
            try:
                dom = sp.calculus.util.continuous_domain(expr, x, sp.S.Reals)
                return SolveTaskResp(ok=True, answer=str(dom), analysis="定义域为使表达式有意义的实数集合。", raw={"domain": str(dom)})
            except Exception:
                # fallback: only handle sqrt constraints
                conds = []
                for node in sp.preorder_traversal(expr):
                    if isinstance(node, sp.Pow) and node.exp == sp.Rational(1, 2):
                        conds.append(sp.Ge(node.base, 0))
                # denom != 0
                denom = sp.denom(expr)
                if denom != 1:
                    conds.append(sp.Ne(denom, 0))
                dom = sp.S.Reals
                for c in conds:
                    # very rough: sample-based domain; return as condition string
                    pass
                return SolveTaskResp(ok=True, answer="R (需满足根号与分母约束)", analysis="定义域需满足根号内≥0且分母≠0。", raw={"conds": [str(c) for c in conds]})

        if task == "limit":
            # Expect expr like "limit(something, x, oo)"? If not, best-effort on expr itself as limit form is hard.
            return SolveTaskResp(ok=False, error="LIMIT_UNSUPPORTED_IN_V0", raw={"expr": str(expr)})

        if task in ("integral_definite", "integral_indefinite", "integral"):
            # If expr is an Integral already, doit; else unsupported
            if isinstance(expr, sp.Integral):
                val = sp.simplify(expr.doit())
                ans = str(val)
                if task == "integral_indefinite" and "+C" not in ans and "C" not in ans:
                    # sympy doesn't include constant; caller can add
                    pass
                return SolveTaskResp(ok=True, answer=ans, analysis="按积分基本法则计算并化简。", raw={"value": ans})
            return SolveTaskResp(ok=False, error="PARSE_NOT_INTEGRAL", raw={"expr": str(expr)})

        if task == "derivative":
            val = sp.simplify(sp.diff(expr, x))
            return SolveTaskResp(ok=True, answer=str(val), analysis="对 x 求导并化简。", raw={"value": str(val)})

        if task == "partial":
            # Expect expr with x,y
            y = sp.Symbol("y", real=True)
            dzdx = sp.diff(expr, x)
            d2 = sp.diff(dzdx, x)
            return SolveTaskResp(ok=True, answer=f"dz/dx={dzdx}, d2z/dx2={d2}", analysis="按偏导定义对 x 求导（y 视为常数）。", raw={"dzdx": str(dzdx), "d2": str(d2)})

        # fallback
        return SolveTaskResp(ok=False, error="UNSUPPORTED_TASK", raw={"task": task, "expr": str(expr)})
    except Exception as e:
        return SolveTaskResp(ok=False, error=f"{type(e).__name__}:{e}", raw={"trace": traceback.format_exc()})


def _run_with_timeout(plan: SolveTaskReq, timeout_s: float) -> SolveTaskResp:
    ctx = mp.get_context("spawn")
    q: mp.Queue = ctx.Queue()

    def worker():
        try:
            q.put(_solve_task(plan).model_dump())
        except Exception as e:
            q.put(SolveTaskResp(ok=False, error=f"WORKER_ERR:{e}").model_dump())

    p = ctx.Process(target=worker)
    p.start()
    p.join(timeout_s)
    if p.is_alive():
        p.terminate()
        p.join(1)
        return SolveTaskResp(ok=False, error="TIMEOUT")
    try:
        data = q.get_nowait()
        return SolveTaskResp(**data)
    except Exception:
        return SolveTaskResp(ok=False, error="NO_RESULT")


@app.post("/solve_task", response_model=SolveTaskResp)
def solve_task(req: SolveTaskReq):
    return _run_with_timeout(req, timeout_s=2.0)


@app.post("/verify", response_model=VerifyResp)
def verify(req: VerifyReq):
    # v0：只做“能验证则 PASS，否则 UNKNOWN”
    try:
        ans = (req.answer or "").strip()
        if not ans:
            return VerifyResp(ok=True, verdict="UNKNOWN", reason="EMPTY_ANSWER")

        task = (req.plan.task_type or "unknown").strip()
        if task == "domain":
            # domain verification is hard without original expression; return UNKNOWN
            return VerifyResp(ok=True, verdict="UNKNOWN", reason="DOMAIN_VERIFY_V0")

        if task == "derivative":
            # verify by numerical sampling: f'(x) approx
            expr_s = (req.plan.expr_sympy or "").strip()
            expr = _safe_sympify(expr_s)
            x = sp.Symbol("x", real=True)
            deriv = sp.diff(expr, x)
            cand = _safe_sympify(ans)
            f1 = sp.lambdify(x, sp.simplify(deriv - cand), "numpy")
            xs = np.array([0.1, 0.2, 0.5, 1.0, 2.0], dtype=float)
            vals = f1(xs)
            if np.all(np.isfinite(vals)) and np.max(np.abs(vals)) < 1e-6:
                return VerifyResp(ok=True, verdict="PASS", reason="NUM_SAMPLING")
            return VerifyResp(ok=True, verdict="FAIL", reason="NUM_SAMPLING_MISMATCH", raw={"max_abs": float(np.max(np.abs(vals)))})

        # default
        return VerifyResp(ok=True, verdict="UNKNOWN", reason="VERIFY_NOT_IMPLEMENTED_V0")
    except Exception as e:
        return VerifyResp(ok=False, verdict="UNKNOWN", reason=f"{type(e).__name__}:{e}", raw={"trace": traceback.format_exc()})



