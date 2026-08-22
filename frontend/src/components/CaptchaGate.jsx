import { useEffect, useRef, useState } from "react";
import { FiShield, FiAlertTriangle } from "react-icons/fi";
import { verifyCaptcha } from "../api.js";

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export default function CaptchaGate({ siteKey, onVerified }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!siteKey) return undefined;
    let widgetId;
    const render = () => {
      if (!window.turnstile || !containerRef.current) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: async (token) => {
          try {
            const result = await verifyCaptcha(token);
            if (!result.success) throw new Error(result.message);
            window.localStorage.setItem("hashlog_captcha_verified", "true");
            onVerified();
          } catch (verificationError) {
            setError(verificationError.message || "CAPTCHA verification failed");
          }
        },
        "error-callback": () => setError("CAPTCHA could not be loaded"),
        "expired-callback": () => setError("CAPTCHA expired. Please try again."),
      });
    };
    if (window.turnstile) render();
    else {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = render;
      script.onerror = () => setError("CAPTCHA script could not be loaded");
      document.head.appendChild(script);
    }
    return () => {
      if (widgetId !== undefined && window.turnstile?.remove) window.turnstile.remove(widgetId);
    };
  }, [siteKey, onVerified]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-4">
      <div className="instrument-card w-full max-w-md p-7 space-y-5 text-center">
        <FiShield className="w-8 h-8 text-[#c9793f] mx-auto" />
        <div>
          <h1 className="font-serif text-2xl text-[#f0ece9]">Verify you are human</h1>
          <p className="font-mono text-xs text-[#8a8480] mt-2">Complete this one-time security check to open HashLog.</p>
        </div>
        <div ref={containerRef} className="min-h-[65px] flex justify-center" />
        {error && (
          <div className="text-red-300 border border-red-800/70 bg-red-950/30 p-2 font-mono text-xs flex items-center gap-2 justify-center">
            <FiAlertTriangle /> {error}
          </div>
        )}
      </div>
    </div>
  );
}
