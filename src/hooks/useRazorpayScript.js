// src/hooks/useRazorpayScript.js
//
// Loads checkout.js once and caches the promise, so multiple
// components mounting/unmounting don't inject it repeatedly.

let loadPromise = null;

export function loadRazorpayScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return loadPromise;
}
