# sympy_solver

提供给 `paper2bank-v2` 使用的 SymPy 微服务。

## 启动

```bash
cd services/sympy_solver
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8010
```

## 接口

- `POST /solve_task`：输入 DeepSeek 的 plan（JSON），返回 SymPy 求解结果
- `POST /verify`：对 SymPy 的答案做确定性自检（基础版：能验证的就 PASS，否则 UNKNOWN）



