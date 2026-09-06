"use client";

// Holds a line of space whether or not there's a message.
// min-h-5 is text-sm's line-height.
export default function ErrorText({ children }: { children?: string | null }) {
  return (
    <p role="alert" className="min-h-5 text-sm text-danger">
      {children}
    </p>
  );
}
