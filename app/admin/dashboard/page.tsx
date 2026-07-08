import AdminDashboardClient from "./AdminDashboardClient";

export const metadata = {
  title: "LootDrop Admin — Mission Control",
  description: "Admin-Dashboard zur Überwachung von Plugin, Bot und Economy.",
};

export const dynamic = "force-dynamic";

/** Dev-Phase: öffentlich zugänglich ohne Login. */
export default function AdminDashboardPage() {
  return <AdminDashboardClient adminLabel="Mission Control" />;
}
