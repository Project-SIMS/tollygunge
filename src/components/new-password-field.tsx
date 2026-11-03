"use client";
import { useId, useState, useRef, useEffect, type ComponentProps } from "react";
import { PortalIcon } from "./portal-icon";
import { passwordError, passwordPolicy } from "@/domain/password-policy";

export function PasswordInput({ id, ...props }: ComponentProps<"input">) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const label = String(props["aria-label"] ?? "password").toLowerCase();
  return (
    <div className="auth-password-wrapper">
      <input {...props} id={inputId} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="auth-password-toggle"
        aria-label={`${visible ? "Hide" : "Show"} ${label}`}
        aria-controls={inputId}
        aria-pressed={visible}
        disabled={props.disabled}
        onClick={() => setVisible((previous) => !previous)}
      >
        <PortalIcon name={visible ? "eyeOff" : "eye"} />
      </button>
    </div>
  );
}

export function NewPasswordField({
  label = "New password",
  onChange,
}: {
  label?: string;
  onChange?: (value: string) => void;
}) {
  const id = useId();
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const form = input.current?.form;
    const reset = () => {
      setValue("");
      setTouched(false);
      onChange?.("");
    };
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [onChange]);
  const error = touched ? passwordError(value) : "";
  return (
    <label htmlFor={id}>
      {label}
      <PasswordInput
        ref={input}
        aria-label={label}
        id={id}
        name="password"
        autoComplete="new-password"
        required
        minLength={passwordPolicy.minimum}
        maxLength={passwordPolicy.maximum}
        aria-describedby={`${id}-help`}
        aria-invalid={!!error}
        onBlur={() => setTouched(true)}
        onChange={(e) => {
          setValue(e.target.value);
          setTouched(true);
          onChange?.(e.target.value);
        }}
      />
      <small
        id={`${id}-help`}
        className={error ? "field-error" : "field-help"}
        aria-live="polite"
      >
        {error ||
          (value
            ? "Password length meets the requirement."
            : `Use ${passwordPolicy.minimum}–${passwordPolicy.maximum} characters.`)}
      </small>
    </label>
  );
}
