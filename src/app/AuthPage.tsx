import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Mail, ArrowRight } from "lucide-react";
import LetheLogo from "../imports/LetheLogo";
import { useAuth } from "./context/AuthContext";

type Stage = "input" | "sent" | "error";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const { signInWithEmail } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already signed in — redirect to feed
  if (!loading && user) {
    navigate("/feed", { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || submitting) return;

    setSubmitting(true);
    const { error } = await signInWithEmail(email.trim());
    setSubmitting(false);

    if (error) {
      setErrorMsg(error);
      setStage("error");
    } else {
      setStage("sent");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d110d",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif",
      padding: "32px 24px",
    }}>
      <div style={{ marginBottom: 48 }}>
        <LetheLogo />
      </div>

      <div style={{
        width: "100%",
        maxWidth: 400,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "40px 36px",
      }}>
        {stage === "sent" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 48, height: 48,
              borderRadius: "50%",
              background: "rgba(120,200,100,0.12)",
              border: "1px solid rgba(120,200,100,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Mail size={20} color="rgba(120,200,100,0.8)" />
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Check <strong style={{ color: "rgba(255,255,255,0.9)" }}>{email}</strong> for a sign-in link.
            </p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 12 }}>
              No account? Ask to be invited.
            </p>
          </div>
        ) : (
          <>
            <h1 style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "0.02em",
              margin: "0 0 8px",
            }}>
              Sign in
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: 13,
              margin: "0 0 32px",
            }}>
              We'll send a magic link to your email.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (stage === "error") setStage("input");
                }}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "rgba(255,255,255,0.05)",
                  border: stage === "error"
                    ? "1px solid rgba(220,80,80,0.5)"
                    : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 14,
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  marginBottom: stage === "error" ? 8 : 20,
                }}
              />

              {stage === "error" && (
                <p style={{ color: "rgba(220,80,80,0.9)", fontSize: 12, margin: "0 0 16px" }}>
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !email.trim()}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: submitting || !email.trim()
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  padding: "12px 20px",
                  color: submitting || !email.trim()
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(255,255,255,0.8)",
                  fontSize: 14,
                  fontFamily: "Inter, sans-serif",
                  cursor: submitting || !email.trim() ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {submitting ? "Sending…" : "Send magic link"}
                {!submitting && <ArrowRight size={14} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
