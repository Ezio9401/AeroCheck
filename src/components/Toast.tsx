"use client";

import { CheckIcon } from "./icons";

export default function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="toast">
      <CheckIcon />
      {message}
    </div>
  );
}
