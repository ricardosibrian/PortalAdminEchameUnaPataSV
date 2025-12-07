import React from "react";

export const Loader = ({ text, variant = "full" }) => {
  const isInline = variant === "inline";

  return (
    <div
      style={
        isInline
          ? {
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }
          : {
              textAlign: "center",
              padding: "40px",
              color: "#666",
              fontSize: "1.2rem",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }
      }
    >
      <svg
        style={{
          width: isInline ? "18px" : "24px",
          height: isInline ? "18px" : "24px",
          animation: "spin 1s linear infinite",
        }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </svg>
      {text ? (
        <span style={{ marginLeft: isInline ? 0 : "10px" }}>{text}</span>
      ) : null}
    </div>
  );
};
