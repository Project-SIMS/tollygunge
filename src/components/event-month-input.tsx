"use client";
import type { ComponentProps } from "react";
// Apply a month immediately; public GET forms remain usable without JavaScript.
export function EventMonthInput(props: ComponentProps<"input">) {
  return <input {...props} type="month" onChange={props.onChange ?? ((event) => {
    if (event.currentTarget.value) event.currentTarget.form?.requestSubmit();
  })} />;
}
