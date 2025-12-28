import { useState } from "react";
import { api } from "./lib/api";
import { emptyState } from "./soroban";
import SorobanSvg from "./components/sorobanSvg";


type Attempt = {
  id: string;
  prompt: string | null;
  expectedAnswer: number | null;
  correct: boolean | null;
  userAnswer: number | null;
};

export default function Practice() {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [msg, setMsg] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [state, setState] = useState(emptyState());

  async function startPractice() {
    setMsg("");
    setAttempt(null);
    setState(emptyState());

    try {
      const res = await api.post<{ attempt: Attempt }>("/attempts");
      setAttempt(res.data.attempt);
    } catch {
      setMsg("Could not start practice");
    }
  }

  async function finishPractice() {
    if (!attempt) return;
    setMsg("");

    try {
      const res = await api.post<{ attempt: Attempt; finalValue: number }>(
        `/attempts/${attempt.id}/finish`
      );
      setAttempt(res.data.attempt);
      setMsg(
        `Finished. finalValue=${res.data.finalValue} correct=${String(
          res.data.attempt.correct
        )}`
      );
    } catch {
      setMsg("Finish failed (likely no moves yet)");
    }
  }

return (
  <div
    style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      padding: "32px 16px",
    }}
  >
    <div style={{ width: "min(1100px, 100%)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 42, letterSpacing: "-0.02em" }}>Practice</h1>
          <p style={{ margin: "6px 0 0", color: "#666", fontSize: 16 }}>
            Solve the prompt using the soroban.
          </p>
        </div>
      </div>

      {/* Main card */}
      <div
        style={{
          marginTop: 22,
          background: "white",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {!attempt ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ margin: 0, fontSize: 18, color: "#666" }}>
              Start a new practice attempt.
            </p>

            <button
              onClick={startPractice}
              style={{
                marginTop: 18,
                padding: "14px 22px",
                fontSize: 18,
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                background: "#111",
                color: "white",
                minWidth: 220,
              }}
            >
              Start Practice
            </button>
          </div>
        ) : (
          <>
            {/* Prompt bar */}
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                padding: "14px 16px",
                borderRadius: 14,
                background: "#f6f7fb",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: 18 }}>
                <span style={{ color: "#666", marginRight: 8 }}>Prompt</span>
                <b style={{ fontSize: 22 }}>{attempt.prompt}</b>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={startPractice}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.15)",
                    background: "white",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  New Prompt
                </button>

                <button
                  onClick={finishPractice}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "none",
                    background: "#111",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  Finish
                </button>
              </div>
            </div>

            {/* Abacus area */}
            <div
            style={{
                marginTop: 18,
                padding: 24,
                borderRadius: 18,
                background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
                border: "1px solid rgba(0,0,0,0.08)",
                minHeight: 420,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
            }}
            >
            <div style={{ width: "100%", maxWidth: 980, margin: "0 auto" }}>
                <SorobanSvg
                state={state}
                onChange={(next) => {
                    setState(next);
                    // next step: POST /attempts/:id/moves with before/after
                }}
                />
            </div>
            </div>


            {/* Result row */}
            <div
              style={{
                marginTop: 16,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ color: "#666" }}>
                <b>Expected:</b> {attempt.expectedAnswer ?? "—"} &nbsp; | &nbsp;
                <b>Your:</b> {attempt.userAnswer ?? "—"} &nbsp; | &nbsp;
                <b>Correct:</b> {String(attempt.correct)}
              </div>

              {msg && (
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "#f6f7fb",
                    border: "1px solid rgba(0,0,0,0.06)",
                    color: "#333",
                  }}
                >
                  {msg}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);
}
