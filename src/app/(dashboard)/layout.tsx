import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={{
          name: session.user.name ?? "Usuário",
          role: session.user.role,
        }}
      />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
