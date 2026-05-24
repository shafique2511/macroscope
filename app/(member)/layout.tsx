import { MemberNavbar } from "@/components/member-navbar";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MemberNavbar />
      {children}
    </>
  );
}
