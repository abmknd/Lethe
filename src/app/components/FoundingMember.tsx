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
  const [claimDuplicate, setClaimDuplicate] = useState(false);
  const [claimError, setClaimError] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const HANDLE_RE = /^[a-z0-9_-]{3,30}$/;

  const checkHandle = async (val: string) => {
    if (!HANDLE_RE.test(val)) { setHandleStatus("invalid"); return; }
    setIsCheckingHandle(true);
    try {
      const { data, error } = await supabase.rpc("is_handle_available", { p_handle: val });
      if (error) { setHandleStatus("idle"); }
      else { setHandleStatus(data === true ? "available" : "taken"); }
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
    if (!h || handleStatus !== "available" || isClaiming || !em) return;
    setIsClaiming(true);
    setClaimError("");

    if (diagnosticEmail) {
      const { error } = await supabase
        .from("waitlist")
        .update({ handle: h, ...(em ? { email: em } : {}), source: "founding-member" })
        .eq("email", diagnosticEmail);
      if (error) {
        if (error.code === "23505") { setClaimDuplicate(true); } else { setClaimError("Something went wrong. Try again."); }
        setIsClaiming(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("waitlist")
        .insert({ handle: h, ...(em ? { email: em } : {}), source: "founding-member" });
      if (error) {
        if (error.code === "23505") { setClaimDuplicate(true); } else { setClaimError("Something went wrong. Try again."); }
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
          font-family: 'Libre Franklin', sans-serif;
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
          font-family: 'Libre Franklin', sans-serif;
          font-size: 16px;
          font-style: italic;
          font-weight: 300;
          color: rgba(255,255,255,0.62);
          line-height: 1.65;
        }
        .fm-status-available { color: rgba(127,255,0,0.75); }
        .fm-status-taken { color: rgba(220,80,80,0.75); }
        .fm-status-invalid { color: rgba(255,180,0,0.65); }
        .fm-status-text {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px;
          letter-spacing: .1em;
          min-height: 18px;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }
        .founding-member-form {
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          background: rgba(255,255,255,0.04);
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
          margin-bottom: 8px;
        }
        .founding-member-form input {
          background: transparent;
          border: none;
          outline: none;
          font-family: 'Libre Franklin', sans-serif;
          font-size: 16px;
          color: rgba(255,255,255,0.88);
          padding: 12px 16px;
          width: 100%;
        }
        .founding-member-form input::placeholder { color: rgba(255,255,255,0.28); }
        .fm-handle-row-inner {
          display: flex;
          align-items: center;
          padding-left: 16px;
        }
        .fm-handle-prefix {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.28);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .fm-handle-row-inner input {
          padding-left: 2px;
        }
        .founding-member-form .fm-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 0 8px;
        }
        .fm-btn {
          font-family: 'Libre Franklin', sans-serif;
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
            {claimed ? (
              <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 16, fontStyle: 'italic', fontWeight: 300, color: 'rgba(127,255,0,0.75)', lineHeight: 1.65 }}>
                You're now a founding member — we'll email you when it's time to ball!
              </p>
            ) : claimDuplicate ? (
              <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 16, fontStyle: 'italic', fontWeight: 300, color: 'rgba(127,255,0,0.75)', lineHeight: 1.65 }}>
                You're already on the list. We'll be in touch.
              </p>
            ) : (
              <p>As a Founding Member, your profile will receive priority visibility once matchmaking begins.</p>
            )}
          </div>

          {!claimed && !claimDuplicate && (
            <form onSubmit={handleClaim} className="relethe-reveal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, width: '100%' }}>
              <div className="founding-member-form">
                <div className="fm-handle-row-inner">
                  <span className="fm-handle-prefix">relethe.com/</span>
                  <input
                    type="text"
                    placeholder="yourname"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase())}
                    maxLength={30}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <div className="fm-divider" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="fm-status-text" style={{ paddingLeft: 8 }}>
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

              {claimError && (
                <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(220,80,80,0.7)", marginBottom: 12, paddingLeft: 8 }}>
                  {claimError}
                </p>
              )}

              <button
                type="submit"
                className="fm-btn"
                disabled={!handle || handleStatus !== "available" || isClaiming || !(email.trim() || diagnosticEmail)}
              >
                {isClaiming ? "Claiming..." : "Claim your handle"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
