"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { loginAction, type LoginState } from "../actions";

const initialState: LoginState = { error: "" };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <section className="flex min-h-screen items-center justify-center px-6">
      <form action={formAction} className="fixmi-card w-full max-w-[24rem] p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-panel-raised">
            <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">FIXMI Admin</h1>
            <p className="text-sm text-text-secondary">Masuk untuk mengelola pricelist</p>
          </div>
        </div>

        <label htmlFor="password" className="mb-2 block text-sm font-medium text-text-secondary">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mb-4 w-full rounded-[8px] border border-panel-border bg-background px-3 py-2.5 text-foreground outline-none transition-colors focus:border-primary"
        />

        {state.error && (
          <p role="alert" className="mb-4 text-sm text-primary">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-[8px] bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-light disabled:opacity-60"
        >
          {pending ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
    </section>
  );
}
