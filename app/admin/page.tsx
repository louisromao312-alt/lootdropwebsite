import AdminDashboardClient from "./dashboard/AdminDashboardClient";

export const metadata = {
  title: "LootDrop Admin — Mission Control",
  description: "Admin-Dashboard zur Überwachung von Plugin, Bot und Economy.",
};

export const dynamic = "force-dynamic";

/** Öffentlicher Admin-Bereich (Dev-Phase). */
export default function AdminPage() {
  return <AdminDashboardClient adminLabel="Mission Control" />;
}
