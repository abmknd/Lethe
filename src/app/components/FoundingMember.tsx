import { useState, useEffect, useRef, FormEvent } from "react";
import { supabase } from "../../lib/supabase";

interface Props {
  diagnosticEmail: string | null;
}

type HandleStatus = "idle" | "available" | "taken";

export default function FoundingMember({ diagnosticEmail }: Props) {
  const [handle, setHandle] = useState("");
  const [handleStatus, setHandleStatus] = useState<HandleStatus>("idle");
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState("");

  // After claim with no diagnostic email: show secondary email prompt
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [secondaryEmail, setSecondaryEmail] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkHandle = async (val: string) => {
    if (!val.trim()) { setHandleStatus("idle"); return; }
    setIsCheckingHandle(true);
    try {
      const { data } = await supabase
        .from("waitlist")
        .select("handle")
        .eq("handle", val.trim().toLowerCase())
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
    if (!handle.trim()) return;
    debounceRef.current = setTimeout(() => checkHandle(handle), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [handle]);

  const handleClaim = async (e: FormEvent) => {
    e.preventDefault();
    if (!handle.trim() || handleStatus !== "available" || isClaiming) return;
    setIsClaiming(true);
    setClaimError("");

    const h = handle.trim().toLowerCase();

    if (diagnosticEmail) {
      // Update existing row
      const { error } = await supabase
        .from("waitlist")
        .update({ handle: h })
        .eq("email", diagnosticEmail);
      if (error) {
        setClaimError(error.code === "23505" ? "Already claimed." : "Something went wrong. Try again.");
        setIsClaiming(false);
        return;
      }
      setClaimed(true);
    } else {
      // Insert handle-only row
      const { error } = await supabase
        .from("waitlist")
        .insert({ handle: h });
      if (error) {
        setClaimError(error.code === "23505" ? "Already claimed." : "Something went wrong. Try again.");
        setIsClaiming(false);
        return;
      }
      setClaimed(true);
      setShowEmailPrompt(true);
    }
    setIsClaiming(false);
  };

  const handleSecondaryEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!secondaryEmail.trim() || isSubmittingEmail) return;
    setIsSubmittingEmail(true);
    const h = handle.trim().toLowerCase();
    const { error } = await supabase
      .from("waitlist")
      .update({ email: secondaryEmail.trim() })
      .eq("handle", h);
    if (!error) setEmailSaved(true);
    setIsSubmittingEmail(false);
  };

  const handleInputValue = handle.replace(/[^a-zA-Z0-9_.-]/g, "").toLowerCase();

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
          border-left: 2px solid rgba(127,255,0,0.4);
          padding: 14px 20px;
          border-radius: 0 8px 8px 0;
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
          font-size: 13px;
          color: rgba(255,255,255,0.88);
          outline: none;
          transition: border-color .2s;
        }
        .fm-handle-input:focus { border-color: rgba(127,255,0,0.35); }
        .fm-handle-input::placeholder { color: rgba(255,255,255,0.2); }
        .fm-status-available { color: rgba(127,255,0,0.75); }
        .fm-status-taken { color: rgba(220,80,80,0.75); }
        .fm-status-text {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: .1em;
          min-height: 18px;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
        }
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
        .fm-email-prompt {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .fm-email-prompt p {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: .12em;
          color: rgba(255,255,255,0.35);
        }
        .fm-email-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          padding: 13px 18px;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: rgba(255,255,255,0.88);
          outline: none;
          transition: border-color .2s;
        }
        .fm-email-input:focus { border-color: rgba(127,255,0,0.35); }
        .fm-email-input::placeholder { color: rgba(255,255,255,0.2); }
        @media (max-width: 640px) {
          .fm-section { padding: 80px 24px; }
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
                  onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, "").toLowerCase())}
                  maxLength={32}
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
              </div>

              {claimError && (
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(220,80,80,0.7)", marginBottom: 12 }}>
                  {claimError}
                </p>
              )}

              <button
                type="submit"
                className="fm-btn"
                disabled={!handle.trim() || handleStatus !== "available" || isClaiming}
              >
                {isClaiming ? "Claiming..." : "Claim your handle"}
              </button>
            </form>
          ) : (
            <div className="fm-success relethe-reveal">
              <p className="fm-success-title">
                relethe.com/{handleInputValue || handle.trim().toLowerCase()} is yours.
              </p>
              <p className="fm-success-sub">Your handle is reserved in the founding cohort.</p>

              {showEmailPrompt && !emailSaved && (
                <form onSubmit={handleSecondaryEmail} className="fm-email-prompt">
                  <p>Add your email to secure your spot.</p>
                  <input
                    className="fm-email-input"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={secondaryEmail}
                    onChange={(e) => setSecondaryEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="fm-btn"
                    disabled={!secondaryEmail.trim() || isSubmittingEmail}
                    style={{ width: "auto", alignSelf: "flex-start" }}
                  >
                    {isSubmittingEmail ? "Saving..." : "Secure my spot"}
                  </button>
                </form>
              )}

              {emailSaved && (
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: ".1em", color: "rgba(127,255,0,0.5)", marginTop: 8 }}>
                  You're on the list. We'll be in touch.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
