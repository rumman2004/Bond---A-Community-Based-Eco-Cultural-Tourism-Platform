import { useRef, useState } from "react";
import gsap from "gsap";

/**
 * Bond UI — Input
 *
 * Props:
 *  label       string
 *  placeholder string
 *  type        string  (default "text")
 *  icon        Lucide icon component (left icon)
 *  iconRight   Lucide icon component (right icon)
 *  error       string  (error message)
 *  helper      string  (helper text below)
 *  disabled    boolean
 *  value       string
 *  onChange    fn
 *  name        string
 *  id          string
 *  required    boolean
 *  className   string  (wrapper override)
 */

export default function Input({
  label,
  placeholder,
  type = "text",
  icon: Icon,
  iconRight: IconRight,
  error,
  helper,
  disabled = false,
  value,
  onChange,
  name,
  id,
  required,
  className = "",
  ...rest
}) {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, "-");

  const handleFocus = () => {
    setFocused(true);
    gsap.to(wrapRef.current, {
      y: -1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleBlur = () => {
    setFocused(false);
    gsap.to(wrapRef.current, {
      y: 0,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const borderColor = error
    ? "border-[#D4735A]"
    : focused
    ? "border-[#2A5940]"
    : "border-[#D9D0C2]";

  const ringColor = error
    ? "shadow-[0_0_0_3px_rgba(212,115,90,0.15)]"
    : focused
    ? "shadow-[0_0_0_3px_rgba(28,61,46,0.12)]"
    : "";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-[#3D5448] tracking-[0.04em] uppercase select-none"
        >
          {label}
          {required && <span className="text-[#D4735A] ml-0.5">*</span>}
        </label>
      )}

      <div
        ref={wrapRef}
        className={[
          "flex items-center gap-2.5",
          "bg-white border rounded-[9px] px-3.5",
          "transition-[border-color,box-shadow] duration-200",
          borderColor,
          ringColor,
          disabled ? "opacity-50 cursor-not-allowed bg-[#F2EDE4]" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {Icon && (
          <Icon
            size={15}
            strokeWidth={1.8}
            className={`shrink-0 ${
              error
                ? "text-[#D4735A]"
                : focused
                ? "text-[#2A5940]"
                : "text-[#7A9285]"
            } transition-colors duration-200`}
          />
        )}

        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={[
            "flex-1 py-2.5 bg-transparent outline-none",
            "text-sm text-[#1A2820] placeholder:text-[#7A9285]",
            "font-normal leading-snug",
            disabled ? "cursor-not-allowed" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />

        {IconRight && (
          <IconRight
            size={15}
            strokeWidth={1.8}
            className="shrink-0 text-[#7A9285]"
          />
        )}
      </div>

      {(error || helper) && (
        <p
          className={`text-xs leading-snug ${
            error ? "text-[#D4735A]" : "text-[#7A9285]"
          }`}
        >
          {error || helper}
        </p>
      )}
    </div>
  );
}