"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { loginAction, type LoginState } from "../actions";
import { ADMIN_IDENTITY } from "@/lib/admin/identity";

const initialState: LoginState = { error: "" };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <section className="admin-login">
      <form action={formAction} className="admin-login-card">
        <div className="admin-login-icon">
            <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <h1>{ADMIN_IDENTITY.adminName}</h1>
        <p className="admin-login-copy">Masuk untuk mengelola website dan katalog layanan.</p>

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
          className="w-full border px-3 py-2.5 outline-none"
        />

        {state.error && (
          <p role="alert" className="admin-login-error">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="disabled:opacity-60"
        >
          {pending ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
    </section>
  );
}
