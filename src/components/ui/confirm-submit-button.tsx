"use client";

import { Button } from "@/components/ui/button";
import type { ButtonHTMLAttributes } from "react";

type ConfirmSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  message: string;
  variant?: "primary" | "secondary" | "ghost";
};

export function ConfirmSubmitButton({ message, onClick, ...props }: ConfirmSubmitButtonProps) {
  return (
    <Button
      {...props}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
          return;
        }

        onClick?.(event);
      }}
    />
  );
}
