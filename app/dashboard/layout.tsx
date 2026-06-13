import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <DashboardGuard>{children}</DashboardGuard>
    </DashboardLayout>
  );
}
