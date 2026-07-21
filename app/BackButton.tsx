"use client";

export function BackButton() {
  return (
    <button
      aria-label="العودة"
      className="back-btn"
      onClick={() => {
        if (document.referrer && document.referrer !== window.location.href) {
          window.history.back();
        } else {
          window.location.href = "#top";
        }
      }}
      type="button"
    >
      →
    </button>
  );
}
