"use client";
import { useEffect, useRef } from "react";
import { PortalIcon } from "./portal-icon";
export function CheckboxDropdown({ id, label, options, value, onChange, invalid, describedBy, required }: {
  id: string; label: string; options: string[]; value: string;
  onChange: (value: string) => void; invalid?: boolean; describedBy?: string; required?: boolean;
}) {
  const root = useRef<HTMLDetailsElement>(null);
  let selected: string[] = [];
  try { const parsed: unknown = JSON.parse(value || "[]"); if (Array.isArray(parsed)) selected = parsed.filter((item): item is string => typeof item === "string"); } catch {}
  useEffect(() => {
    const close = (event: PointerEvent) => { if (root.current && !root.current.contains(event.target as Node)) root.current.open = false; };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return <details ref={root} className="checkbox-dropdown" onKeyDown={event => {
    if (event.key === "Escape" && root.current) { root.current.open = false; root.current.querySelector("summary")?.focus(); }
  }}>
    <summary id={id} aria-label={`${label}: ${selected.length} selected`} aria-invalid={invalid} aria-describedby={describedBy}>
      <span>{selected.length ? selected.join(", ") : "Select options…"}</span>
      {selected.length > 0 && <span className="checkbox-dropdown-count">{selected.length}</span>}
      <PortalIcon name="chevron" />
    </summary>
    <div className="checkbox-dropdown-options" role="group" aria-label={`${label}${required ? " (required)" : ""}`}>
      <p>Select all that apply</p>
      {options.map(option => <label key={option}>
        <input type="checkbox" checked={selected.includes(option)} onChange={event => {
          onChange(JSON.stringify(event.target.checked ? [...selected, option] : selected.filter(item => item !== option)));
        }} />
        <span>{option}</span>
      </label>)}
    </div>
  </details>;
}
