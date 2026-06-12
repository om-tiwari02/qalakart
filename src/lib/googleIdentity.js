const GOOGLE_IDENTITY_SCRIPT = "https://accounts.google.com/gsi/client";

let googleScriptPromise;

export function loadGoogleIdentity() {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(window.google), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = GOOGLE_IDENTITY_SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}
