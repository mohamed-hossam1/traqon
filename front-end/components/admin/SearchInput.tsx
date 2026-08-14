"use client";

import { useState, useEffect } from "react";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (prevValue !== value) {
    setPrevValue(value);
    setLocalValue(value);
  }

  useEffect(() => {
    if (localValue.trim() === value) return;
    const timer = setTimeout(() => {
      onChange(localValue.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, value, onChange]);

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-sm px-4 py-2 bg-background border border-border font-mono text-[11px] uppercase tracking-widest placeholder:font-normal placeholder:text-muted-foreground text-foreground focus:outline-none focus:border-accent rounded-none"
    />
  );
}
