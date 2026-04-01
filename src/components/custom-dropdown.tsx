"use client";

import { useEffect, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type CustomDropdownProps = {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  buttonClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
};

export default function CustomDropdown({
  value,
  options,
  onChange,
  ariaLabel,
  buttonClassName = "",
  menuClassName = "",
  optionClassName = "",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleSelect(value: string) {
    onChange(value);
    setIsOpen(false);
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex items-center justify-center gap-2 ${buttonClassName}`}
      >
        <span>{selected?.label}</span>

        <span
          className={`text-sm transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/95 p-2 shadow-2xl backdrop-blur ${menuClassName}`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center justify-center rounded-xl px-3 py-2 transition ${
                  isSelected
                    ? "bg-white text-black"
                    : "text-white hover:bg-white/10"
                } ${optionClassName}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}