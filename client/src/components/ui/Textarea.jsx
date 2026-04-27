import { forwardRef, useState } from "react";

/**
 * Textarea component — Bond Design System
 * Matches Input.jsx conventions: label, error, hint, disabled, required
 *
 * Props:
 *  label        — string: field label
 *  placeholder  — string
 *  value        — string (controlled)
 *  onChange     — function
 *  error        — string: error message
 *  hint         — string: helper text below field
 *  disabled     — bool
 *  required     — bool
 *  maxLength    — number: shows character counter when set
 *  rows         — number: initial visible rows (default 4)
 *  resize       — "none" | "vertical" | "both" (default "vertical")
 *  className    — string: extra classes on wrapper
 *  id           — string: overrides auto-generated id
 */

const Textarea = forwardRef(function Textarea(
  {
    label,
    placeholder = "Type here…",
    value,
    onChange,
    error,
    hint,
    disabled = false,
    required = false,
    maxLength,
    rows = 4,
    resize = "vertical",
    className = "",
    id,
    ...rest
  },
  ref
) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const fieldId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, "-") || "field"}`;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;

  const handleChange = (e) => {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e);
  };

  const charCount = currentValue?.length ?? 0;
  const isNearLimit = maxLength && charCount >= maxLength * 0.85;
  const isAtLimit = maxLength && charCount >= maxLength;

  return (
    <div className={`bond-textarea-wrapper ${className}`}>
      {/* Label row */}
      {label && (
        <div className="bond-textarea-label-row">
          <label htmlFor={fieldId} className="bond-textarea-label">
            {label}
            {required && (
              <span className="bond-textarea-required" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {/* Character counter */}
          {maxLength && (
            <span
              className={`bond-textarea-counter ${
                isAtLimit
                  ? "bond-textarea-counter--limit"
                  : isNearLimit
                  ? "bond-textarea-counter--near"
                  : ""
              }`}
              aria-live="polite"
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}

      {/* Textarea field */}
      <textarea
        ref={ref}
        id={fieldId}
        className={`bond-textarea ${error ? "bond-textarea--error" : ""} ${
          disabled ? "bond-textarea--disabled" : ""
        }`}
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={
          [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined
        }
        style={{ resize }}
        {...rest}
      />

      {/* Error message */}
      {error && (
        <p id={errorId} className="bond-textarea-error" role="alert">
          <span className="bond-textarea-error-icon" aria-hidden="true">
            &#9679;
          </span>
          {error}
        </p>
      )}

      {/* Hint text — only shown when no error */}
      {hint && !error && (
        <p id={hintId} className="bond-textarea-hint">
          {hint}
        </p>
      )}

      <style>{`
        .bond-textarea-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          width: 100%;
        }

        .bond-textarea-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .bond-textarea-label {
          font-size: 13px;
          font-weight: 500;
          color: #1A2820;
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          gap: 3px;
          cursor: pointer;
        }

        .bond-textarea-required {
          color: #D4735A;
          font-size: 14px;
          line-height: 1;
        }

        .bond-textarea-counter {
          font-size: 11px;
          color: #7A9285;
          font-weight: 400;
          transition: color 0.2s ease;
        }

        .bond-textarea-counter--near {
          color: #C8883A;
        }

        .bond-textarea-counter--limit {
          color: #D4735A;
          font-weight: 500;
        }

        .bond-textarea {
          width: 100%;
          padding: 12px 14px;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.6;
          color: #1A2820;
          background-color: #FAF7F2;
          border: 1px solid rgba(28, 61, 46, 0.2);
          border-radius: 10px;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
          min-height: 80px;
          box-sizing: border-box;
        }

        .bond-textarea::placeholder {
          color: #7A9285;
          font-weight: 400;
        }

        .bond-textarea:hover:not(:disabled) {
          border-color: rgba(28, 61, 46, 0.38);
          background-color: #F7F2EA;
        }

        .bond-textarea:focus:not(:disabled) {
          border-color: #2A5940;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(44, 89, 64, 0.12);
        }

        .bond-textarea--error {
          border-color: #D4735A !important;
          background-color: #FDF7F5 !important;
        }

        .bond-textarea--error:focus {
          box-shadow: 0 0 0 3px rgba(212, 115, 90, 0.14) !important;
        }

        .bond-textarea--disabled {
          opacity: 0.52;
          cursor: not-allowed;
          background-color: #EDE8DF !important;
          border-color: rgba(28, 61, 46, 0.1) !important;
          color: #7A9285 !important;
        }

        .bond-textarea-error {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #A04D38;
          font-weight: 400;
          margin: 0;
        }

        .bond-textarea-error-icon {
          font-size: 6px;
          color: #D4735A;
          flex-shrink: 0;
        }

        .bond-textarea-hint {
          font-size: 12px;
          color: #7A9285;
          margin: 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
});

export default Textarea;