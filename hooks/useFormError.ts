"use client";

import { useState } from "react";

// One error message per form, cleared by the next edit.
// Both forms in the app want the same thing: show a message on submit, and
// drop it the moment the person changes anything.
export function useFormError() {
  const [error, setError] = useState<string | null>(null);

  function clearError() {
    setError((current) => (current === null ? current : null));
  }

  // Wraps a setter so using the control clears the message.
  function withClear<T>(set: (value: T) => void) {
    return (value: T) => {
      clearError();
      set(value);
    };
  }

  return { error, setError, clearError, withClear };
}
