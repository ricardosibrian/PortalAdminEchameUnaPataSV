import React,{ useState, useRef, useEffect } from "react";

export default function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  const handleSelect = (val) => {
    onChange({ target: { value: val } });
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "85px" }}>

      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "6px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          background: "#fff",
          cursor: "pointer",
          fontSize: "14px",
          color: "#111",
          userSelect: "none",
        }}
      >
        {selected.label}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "36px",
            left: "0",
            width: "100%",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "6px",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
            zIndex: 99,
            overflow: "hidden",
          }}
        >
          {options.map((o) => {
            const isSelected = o.value === value;
            return (
              <div
                key={o.value}
                onClick={() => handleSelect(o.value)}
                style={{
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: isSelected ? "#2563eb" : "#111",
                  background: isSelected ? "rgba(37, 99, 235, 0.12)" : "#fff",
                }}
              >
                {o.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}