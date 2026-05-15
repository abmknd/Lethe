import { useState, useEffect, useRef, FormEvent } from "react";
import { supabase } from "../../lib/supabase";

interface Props {
  diagnosticEmail: string | null;
}

type HandleStatus = "idle" | "available" | "taken" | "invalid";

export default function FoundingMember({ diagnosticEmail }: Props) {
  const [handle, setHandle] = useState("");
  const [handleStatus, setHandleStatus] = useState<HandleStatus>("idle");
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [email, setEmail] = useState(diagnosticEmail ?? "");
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const HANDLE_RE = /^[a-z0-9_-]{3,30}$/;

  const checkHandle = async (val: string) => {
    if (!HANDLE_RE.test(val)) { setHandleStatus("invalid"); return; }
    setIsCheckingHandle(true);
    try {
      const { data } = await supabase
        .from("waitlist")
        .select("handle")
        .eq("handle", val)
        .maybeSingle();
      setHandleStatus(data ? "taken" : "available");
    } catch {
      setHandleStatus("idle");
    }
    setIsCheckingHandle(false);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setHandleStatus("idle");
    const cleaned = handle.toLowerCase();
    if (!cleaned) return;
    debounceRef.current = setTimeout(() => checkHandle(cleaned), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [handle]);

  const handleClaim = async (e: FormEvent) => {
    e.preventDefault();
    const h = handle.toLowerCase();
    const em = email.trim() || diagnosticEmail;
    if (!h || handleStatus !== "available" || isClaiming) return;
    setIsClaiming(true);
    setClaimError("");

    if (diagnosticEmail) {
      const { error } = await supabase
        .from("waitlist")
        .update({ handle: h, ...(em ? { email: em } : {}), source: "founding-member" })
        .eq("email", diagnosticEmail);
      if (error) {
        setClaimError(error.code === "23505" ? "Already claimed." : "Something went wrong. Try again.");
        setIsClaiming(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("waitlist")
        .insert({ handle: h, ...(em ? { email: em } : {}), source: "founding-member" });
      if (error) {
        setClaimError(error.code === "23505" ? "Already claimed." : "Something went wrong. Try again.");
        setIsClaiming(false);
        return;
      }
    }

    setClaimed(true);
    setIsClaiming(false);
  };

  return (
    <>
      <style>{`
        .fm-section {
          padding: 120px 48px;
          position: relative;
          z-index: 3;
          background: #020402;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .fm-inner {
          max-width: 680px;
          margin: 0 auto;
        }
        .fm-heading-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .fm-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 300;
          font-style: italic;
          line-height: 1.15;
          letter-spacing: -.02em;
          color: rgba(255,255,255,0.88);
        }
        .fm-badge {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: rgba(127,255,0,0.75);
          background: rgba(127,255,0,0.08);
          border: 1px solid rgba(127,255,0,0.2);
          border-radius: 9999px;
          padding: 4px 12px;
          white-space: nowrap;
        }
        .fm-highlight {
          background: rgba(127,255,0,0.04);
          border: 1px solid rgba(127,255,0,0.2);
          padding: 14px 20px;
          border-radius: 12px;
          margin-bottom: 36px;
        }
        .fm-highlight p {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-style: italic;
          font-weight: 300;
          color: rgba(255,255,255,0.62);
          line-height: 1.65;
        }
        .fm-handle-row {
          display: flex;
          align-items: stretch;
          gap: 0;
          width: 100%;
          margin-bottom: 10px;
        }
        .fm-handle-prefix {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: rgba(255,255,255,0.28);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-right: none;
          border-radius: 10px 0 0 10px;
          padding: 13px 14px;
          white-space: nowrap;
          display: flex;
          align-items: center;
        }
        .fm-handle-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-left: none;
          border-radius: 0 10px 10px 0;
          padding: 13px 14px;
          font-family: 'DM Mono', monospace;
          font-size: 16px;
          color: rgba(255,255,255,0.88);
          outline: none;
          transition: border-color .2s;
        }
        .fm-handle-input:focus { border-color: rgba(127,255,0,0.35); }
        .fm-handle-input::placeholder { color: rgba(255,255,255,0.2); }
        .fm-status-available { color: rgba(127,255,0,0.75); }
        .fm-status-taken { color: rgba(220,80,80,0.75); }
        .fm-status-invalid { color: rgba(255,180,0,0.65); }
        .fm-status-text {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: .1em;
          min-height: 18px;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }
        .fm-email-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          padding: 13px 18px;
          font-family: 'DM Mono', monospace;
          font-size: 16px;
          color: rgba(255,255,255,0.88);
          outline: none;
          transition: border-color .2s;
          margin-bottom: 16px;
        }
        .fm-email-input:focus { border-color: rgba(127,255,0,0.35); }
        .fm-email-input::placeholder { color: rgba(255,255,255,0.2); }
        .fm-btn {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: #050705;
          background: rgba(127,255,0,0.88);
          border: none;
          border-radius: 22px;
          padding: 13px 32px;
          cursor: none;
          transition: background .2s, opacity .2s;
          width: 100%;
        }
        .fm-btn:hover:not(:disabled) { background: rgba(127,255,0,1); }
        .fm-btn:disabled { opacity: 0.45; }
        .fm-success {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .fm-success-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-style: italic;
          font-weight: 300;
          color: rgba(127,255,0,0.85);
        }
        .fm-success-sub {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: .1em;
          color: rgba(255,255,255,0.3);
        }
        @media (max-width: 640px) {
          .fm-section { padding: 80px 24px; }
          .fm-handle-row { flex-direction: column; }
          .fm-handle-prefix {
            border-right: 1px solid rgba(255,255,255,0.09);
            border-bottom: none;
            border-radius: 10px 10px 0 0;
          }
          .fm-handle-input {
            border-left: 1px solid rgba(255,255,255,0.09);
            border-top: none;
            border-radius: 0 0 10px 10px;
          }
        }
      `}</style>

      <section className="fm-section">
        <div className="fm-inner">
          <div className="fm-heading-row relethe-reveal">
            <h2 className="fm-heading">Becoming a Founding Member</h2>
            <span className="fm-badge">Early Access</span>
          </div>

          <div className="fm-highlight relethe-reveal">
            <p>As a Founding Member, your profile will receive priority visibility once matchmaking begins.</p>
          </div>

          {!claimed ? (
            <form onSubmit={handleClaim} className="relethe-reveal">
              <div className="fm-handle-row">
                <span className="fm-handle-prefix">relethe.com/</span>
                <input
                  className="fm-handle-input"
                  type="text"
                  placeholder="yourname"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase())}
                  maxLength={30}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div className="fm-status-text">
                {isCheckingHandle && (
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>Checking...</span>
                )}
                {!isCheckingHandle && handleStatus === "available" && (
                  <span className="fm-status-available">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ display: "inline", marginRight: 4 }}>
                      <circle cx="5" cy="5" r="4.5" fill="rgba(127,255,0,0.2)" stroke="rgba(127,255,0,0.6)" strokeWidth="1" />
                    </svg>
                    Available
                  </span>
                )}
                {!isCheckingHandle && handleStatus === "taken" && (
                  <span className="fm-status-taken">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ display: "inline", marginRight: 4 }}>
                      <circle cx="5" cy="5" r="4.5" fill="rgba(220,80,80,0.15)" stroke="rgba(220,80,80,0.5)" strokeWidth="1" />
                    </svg>
                    Already claimed
                  </span>
                )}
                {!isCheckingHandle && handleStatus === "invalid" && handle.length > 0 && (
                  <span className="fm-status-invalid">3–30 chars, letters, numbers, _ or - only</span>
                )}
              </div>

              {!diagnosticEmail && (
                <input
                  className="fm-email-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}

              {claimError && (
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(220,80,80,0.7)", marginBottom: 12 }}>
                  {claimError}
                </p>
              )}

              <button
                type="submit"
                className="fm-btn"
                disabled={!handle || handleStatus !== "available" || isClaiming}
              >
                {isClaiming ? "Claiming..." : "Claim your handle"}
              </button>
            </form>
          ) : (
            <div className="fm-success relethe-reveal">
              <p className="fm-success-title">
                relethe.com/{handle.toLowerCase()} is yours.
              </p>
              <p className="fm-success-sub">Your handle is reserved in the founding cohort.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
