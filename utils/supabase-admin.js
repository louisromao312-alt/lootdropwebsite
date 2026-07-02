/**
 * Admin-Supabase-Abfragen (serverseitig via Server Actions).
 * Der Browser-Client nutzt app/admin/dashboard/actions.ts – nicht direkt importieren.
 *
 * SQL-Referenz:
 *   SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 20;
 *   SELECT SUM(cost) FROM vault WHERE is_used = true;
 */

export {
  getAdminDashboardData,
  increaseServerBudget,
  checkAdminAccess,
} from "@/app/admin/dashboard/actions";
