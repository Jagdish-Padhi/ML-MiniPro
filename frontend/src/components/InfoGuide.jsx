import { useEffect, useRef, useState } from "react";
import { InfoIcon } from "./Icons";

export default function InfoGuide({ title, children }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const wrapRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(timeoutRef.current);
    };
  }, [open]);

  return (
    <span
      className="info-guide-wrap"
      ref={wrapRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className="info-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Guide: ${title}`}
        title={`Guide: ${title}`}
      >
        <InfoIcon />
      </button>
      {open && (
        <div className="info-popover" role="tooltip">
          <div className="info-popover-head">
            <span className="info-popover-tag">METHODOLOGY & REASONING</span>
            <button
              type="button"
              className="info-popover-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="info-popover-title">{title}</div>
          <div className="info-popover-content">{children}</div>
        </div>
      )}
    </span>
  );
}
