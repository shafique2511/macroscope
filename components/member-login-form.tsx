"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export function MemberLoginForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/dashboard");
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Email</span>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          name="email"
          placeholder="member@example.com"
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
        className="inline-flex w-full justify-center rounded-md bg-[#d71920] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b9151b]"
        type="submit"
      >
        Login
      </button>
    </form>
  );
}
