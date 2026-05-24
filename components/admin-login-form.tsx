"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";

function getMockRole(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail === "admin@macroscope.local" ||
    normalizedEmail.endsWith("@admin.macroscope.local")
  ) {
    return "admin";
  }

  return "member";
}

export function AdminLoginForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const role = getMockRole(email);

    if (role === "admin") {
      router.push("/admin");
      return;
    }

    router.push("/login?message=Admin%20access%20only.");
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Email</span>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          name="email"
          placeholder="admin@macroscope.local"
          type="email"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Password</span>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          name="password"
          placeholder="Password"
          type="password"
          required
        />
      </label>
      <button
        className="inline-flex w-full justify-center rounded-md bg-[#0b0d12] px-4 py-2 text-sm font-semibold text-white hover:bg-black"
        type="submit"
      >
        Login
      </button>
    </form>
  );
}
