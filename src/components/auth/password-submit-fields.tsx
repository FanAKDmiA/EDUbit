"use client";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useMemo, useState } from "react";

type PasswordSubmitFieldsProps = {
  submitLabel: string;
  includeTerms?: boolean;
};

const checks = [
  { id: "min", label: "Mínimo 8 caracteres", test: (value: string) => value.length >= 8 },
  { id: "upper", label: "Al menos una letra mayúscula", test: (value: string) => /[A-Z]/.test(value) },
  { id: "lower", label: "Al menos una letra minúscula", test: (value: string) => /[a-z]/.test(value) },
  { id: "number", label: "Al menos un número", test: (value: string) => /\d/.test(value) },
  { id: "special", label: "Al menos un carácter especial", test: (value: string) => /[^A-Za-z0-9]/.test(value) }
];

export function PasswordSubmitFields({ submitLabel, includeTerms = false }: PasswordSubmitFieldsProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(!includeTerms);

  const state = useMemo(() => {
    const passwordChecks = checks.map((check) => ({ ...check, valid: check.test(password) }));
    const passwordsMatch = password.length > 0 && password === confirmPassword;
    const valid = passwordChecks.every((check) => check.valid) && passwordsMatch && acceptedTerms;

    return { passwordChecks, passwordsMatch, valid };
  }, [acceptedTerms, confirmPassword, password]);

  return (
    <>
      <Field label="Nueva contraseña">
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>
      <div className="rounded-md border border-ink/10 bg-[#f7f4ee] p-3 text-sm">
        <p className="font-semibold">La contraseña debe cumplir:</p>
        <ul className="mt-2 grid gap-1.5">
          {state.passwordChecks.map((check) => (
            <li key={check.id} className={check.valid ? "text-[#12604f]" : "text-ink/60"}>
              <span aria-hidden="true">{check.valid ? "✓" : "○"}</span> {check.label}
            </li>
          ))}
          <li className={state.passwordsMatch ? "text-[#12604f]" : "text-ink/60"}>
            <span aria-hidden="true">{state.passwordsMatch ? "✓" : "○"}</span> Las contraseñas coinciden
          </li>
        </ul>
      </div>
      <Field label="Confirmar contraseña">
        <Input
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </Field>
      {includeTerms ? (
        <label className="flex gap-3 rounded-md border border-ink/10 bg-[#f7f4ee] p-3 text-sm">
          <input
            name="accepted_terms"
            type="checkbox"
            className="mt-1 h-4 w-4"
            required
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
          <span>Acepto el uso educativo de la plataforma y comprendo que EDUbit no representa dinero real.</span>
        </label>
      ) : null}
      <Button type="submit" disabled={!state.valid} className="disabled:cursor-not-allowed disabled:opacity-50">
        {submitLabel}
      </Button>
    </>
  );
}
