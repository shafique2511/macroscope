import { signInMember } from "@/app/auth/actions";

export function MemberLoginForm() {
  return (
    <form action={signInMember} className="space-y-4">
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
