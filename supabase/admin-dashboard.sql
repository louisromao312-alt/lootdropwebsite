-- =============================================================================
-- LootDrop – Admin Dashboard Schema (system_logs + server_budgets)
-- =============================================================================
-- Ausführung: Supabase Dashboard → SQL Editor → Run
-- Voraussetzung: Bot/Plugin-Schema (players, vault) bereits installiert
-- =============================================================================

-- ---------------------------------------------------------------------------
-- system_logs – Heartbeats & Fehler von Plugin, Bot, Affiliate-Tracking
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_logs (
  id         BIGSERIAL   PRIMARY KEY,
  source     TEXT        NOT NULL,
  level      TEXT        NOT NULL DEFAULT 'INFO'
                         CHECK (level IN ('INFO', 'WARN', 'ERROR')),
  message    TEXT        NOT NULL,
  metadata   JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.system_logs IS 'Zentrales Log für Plugin, Discord-Bot und Affiliate-Tracking';
COMMENT ON COLUMN public.system_logs.source IS 'z.B. minecraft_plugin, discord_bot, affiliate_tracker';

CREATE INDEX IF NOT EXISTS idx_system_logs_created_at
  ON public.system_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_logs_source_created
  ON public.system_logs (source, created_at DESC);

-- ---------------------------------------------------------------------------
-- server_budgets – Economy-Budget pro Minecraft-Server (Anti-Inflation)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.server_budgets (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  server_slug    TEXT        NOT NULL UNIQUE,
  server_name    TEXT        NOT NULL,
  economy_budget BIGINT      NOT NULL DEFAULT 0 CHECK (economy_budget >= 0),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.server_budgets IS 'Verfügbares LootCoins-Budget pro Server für das Minecraft-Plugin';

-- updated_at Trigger (set_updated_at aus Bot/Plugin-Schema vorausgesetzt)
DROP TRIGGER IF EXISTS trg_server_budgets_updated_at ON public.server_budgets;
CREATE TRIGGER trg_server_budgets_updated_at
  BEFORE UPDATE ON public.server_budgets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Heartbeat-Helfer (Plugin/Bot rufen periodisch auf)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_system_heartbeat(
  p_source  TEXT,
  p_level   TEXT DEFAULT 'INFO',
  p_message TEXT DEFAULT 'Heartbeat'
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id BIGINT;
BEGIN
  INSERT INTO public.system_logs (source, level, message)
  VALUES (p_source, COALESCE(p_level, 'INFO'), COALESCE(p_message, 'Heartbeat'))
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.log_system_heartbeat IS
  'Heartbeat von Plugin/Bot: INSERT INTO system_logs mit source + message';

GRANT EXECUTE ON FUNCTION public.log_system_heartbeat(TEXT, TEXT, TEXT) TO service_role;

-- ---------------------------------------------------------------------------
-- Demo-Daten
-- ---------------------------------------------------------------------------
INSERT INTO public.server_budgets (server_slug, server_name, economy_budget)
VALUES
  ('craftland-smp',   'CraftLand SMP',   50000),
  ('skyblock-empire', 'SkyBlock Empire', 35000),
  ('hypixelde',       'HypixelDE',       100000)
ON CONFLICT (server_slug) DO NOTHING;

-- Aktuelle Heartbeats (Plugin + Bot „online“)
SELECT public.log_system_heartbeat('minecraft_plugin', 'INFO', 'Plugin heartbeat – Spieler-Sync OK');
SELECT public.log_system_heartbeat('discord_bot',      'INFO', 'Bot heartbeat – Commands aktiv');

-- Beispiel-Logs für Admin-Tabelle
INSERT INTO public.system_logs (source, level, message)
VALUES
  ('minecraft_plugin', 'INFO',  'LootCoins-Sync: 142 Spieler aktualisiert'),
  ('discord_bot',      'INFO',  '/shop Command ausgeführt – 3 Käufe'),
  ('affiliate_tracker','INFO',  'Amazon Affiliate-Klick registriert'),
  ('minecraft_plugin', 'WARN',  'Hohe Server-Last – Sync verzögert'),
  ('discord_bot',      'ERROR', 'Vault-Item nicht verfügbar (Race Condition verhindert)');

-- ---------------------------------------------------------------------------
-- RLS: Nur Service Role (Admin-Dashboard nutzt SUPABASE_SERVICE_ROLE_KEY)
-- ---------------------------------------------------------------------------
ALTER TABLE public.system_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_budgets ENABLE ROW LEVEL SECURITY;

-- Keine öffentlichen Policies – Zugriff nur über Service Role Key im Admin-Backend

-- =============================================================================
-- Plugin/Bot Integration:
--   SELECT public.log_system_heartbeat('minecraft_plugin');
--   SELECT public.log_system_heartbeat('discord_bot');
-- =============================================================================
