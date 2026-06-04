import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-ink text-white hover:bg-black",
    secondary: "bg-mint text-ink hover:bg-[#28aa8e]",
    ghost: "border border-ink/15 bg-white text-ink hover:bg-ink/5"
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
