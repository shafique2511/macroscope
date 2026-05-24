import { signInAdmin } from "@/app/auth/actions";

export function AdminLoginForm() {
  return (
    <form action={signInAdmin} className="space-y-4">
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
