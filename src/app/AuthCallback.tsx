import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";

// Lands here when a magic link is clicked. With the implicit flow,
// supabase-js parses the session from the URL hash on load and emits a
// SIGNED_IN event. We wait for that session, then forward to onboarding.
export default function AuthCallback() {
  const navigate = useNavigate();
  const settled = useRef(false);
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    function finish(session: unknown) {
      if (settled.current) return;
      settled.current = true;
      if (session) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/auth?error=link", { replace: true });
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) finish(session);
      },
    );

    // The hash may already be processed by the time we mount.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish(data.session);
    });

    // If nothing resolves (expired/invalid link, missing token), bail out.
    const timeout = setTimeout(() => {
      setMessage("That sign-in link didn't work. Redirecting…");
      finish(null);
    }, 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d110d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        color: "rgba(255,255,255,0.5)",
        fontSize: 14,
        letterSpacing: "0.04em",
      }}
    >
      {message}
    </div>
  );
}
