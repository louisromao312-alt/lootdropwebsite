-- =============================================================================
-- LootDrop – Web-Dashboard Migration (Next.js Frontend)
-- =============================================================================
-- Ausführung: Supabase Dashboard → SQL Editor → New Query → Run
--
-- VORAUSSETZUNG:
--   Das Bot/Plugin-Schema ist bereits installiert (players, vault, profiles,
--   game_events, purchase_logs, RPC purchase_vault_item, …).
--
-- WICHTIG:
--   Das zweite Schema aus der Doku (wallets, rewards_catalog, minecraft_links)
--   NICHT zusätzlich ausführen – es kollidiert mit players/vault/profiles!
--
-- Dieses Script ergänzt NUR was das Web-Frontend braucht:
--   • Spalten-Aliase für vault (title, cost_coins, code, reward_type)
--   • Partner-Server-Tabelle (servers)
--   • Auth-Helfer (Discord-ID aus JWT)
--   • Sichere Web-RPC für atomische Käufe
--   • Row Level Security für Anon/Authenticated (Web)
--   • Demo-Daten für Server-Showcase
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Vault: Web-kompatible Spalten (Bot nutzt weiterhin name, cost, content)
-- ---------------------------------------------------------------------------

ALTER TABLE public.vault
  ADD COLUMN IF NOT EXISTS reward_type TEXT NOT NULL DEFAULT 'digital',
  ADD COLUMN IF NOT EXISTS icon         TEXT;

COMMENT ON COLUMN public.vault.reward_type IS 'Kategorie für Shop-UI: digital | ingame | mystery | affiliate';
COMMENT ON COLUMN public.vault.icon         IS 'Optionales Emoji oder Icon-URL für das Web-Frontend';

-- Generierte Spalten: Frontend erwartet title / cost_coins / code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vault' AND column_name = 'title'
  ) THEN
    ALTER TABLE public.vault
      ADD COLUMN title TEXT GENERATED ALWAYS AS (name) STORED;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vault' AND column_name = 'cost_coins'
  ) THEN
    ALTER TABLE public.vault
      ADD COLUMN cost_coins INTEGER GENERATED ALWAYS AS (cost) STORED;
  END IF;

  -- code nur sichtbar wenn Item bereits eingelöst (über RLS + RPC gesteuert)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vault' AND column_name = 'code'
  ) THEN
    ALTER TABLE public.vault
      ADD COLUMN code TEXT GENERATED ALWAYS AS (
        CASE WHEN is_used THEN content ELSE NULL END
      ) STORED;
  END IF;

  -- link: URLs aus content erkennen (z.B. Discord Nitro Gift-Links)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vault' AND column_name = 'link'
  ) THEN
    ALTER TABLE public.vault
      ADD COLUMN link TEXT GENERATED ALWAYS AS (
        CASE
          WHEN is_used AND content ~ '^https?://' THEN content
          ELSE NULL
        END
      ) STORED;
  END IF;
END $$;

-- Bestehende Demo-Einträge: reward_type setzen falls noch default
UPDATE public.vault
SET reward_type = CASE
  WHEN name ILIKE '%crate%' OR name ILIKE '%ingame%' OR name ILIKE '%badge%' OR name ILIKE '%rang%' THEN 'ingame'
  WHEN content ~ '^https?://' THEN 'affiliate'
  ELSE 'digital'
END
WHERE reward_type = 'digital';

-- ---------------------------------------------------------------------------
-- 2. Players: total_earned für Dashboard-Widget
-- ---------------------------------------------------------------------------

ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS total_earned INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.players.total_earned IS 'Kumuliert verdiente LootCoins (vom Plugin/Bot gepflegt oder per Trigger)';

-- total_earned aus game_events nachziehen (einmalig + bei Bedarf erneut ausführbar)
UPDATE public.players p
SET total_earned = COALESCE(agg.sum_positive, 0)
FROM (
  SELECT
    ge.player_id,
    SUM(GREATEST(ge.loot_coins_delta, 0))::INTEGER AS sum_positive
  FROM public.game_events ge
  GROUP BY ge.player_id
) agg
WHERE p.id = agg.player_id;

-- Trigger: total_earned bei positiven game_events erhöhen
CREATE OR REPLACE FUNCTION public.bump_player_total_earned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.loot_coins_delta > 0 THEN
    UPDATE public.players
    SET total_earned = total_earned + NEW.loot_coins_delta
    WHERE id = NEW.player_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_game_events_total_earned ON public.game_events;
CREATE TRIGGER trg_game_events_total_earned
  AFTER INSERT ON public.game_events
  FOR EACH ROW EXECUTE FUNCTION public.bump_player_total_earned();

-- ---------------------------------------------------------------------------
-- 3. Partner-Server (Web: /servers + Landingpage)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.servers (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  slug          TEXT        UNIQUE,
  description   TEXT,
  player_count  INTEGER     NOT NULL DEFAULT 0 CHECK (player_count >= 0),
  max_players   INTEGER     NOT NULL DEFAULT 1000 CHECK (max_players > 0),
  icon_emoji    TEXT        NOT NULL DEFAULT '🎮',
  tags          TEXT[]      NOT NULL DEFAULT '{}',
  discord_url   TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  profile_id    UUID        REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.servers IS 'B2B Partner-Server Showcase für Web-Frontend';

-- Migration: bestehende servers-Tabelle (Spalte "active" aus älterem Schema) anpassen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'servers'
  ) THEN
    RETURN;
  END IF;

  -- active → is_active (älteres LootDrop-Schema)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'active'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.servers RENAME COLUMN active TO is_active;
  END IF;

  -- Falls beide existieren: is_active aus active befüllen
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'active'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'is_active'
  ) THEN
    UPDATE public.servers SET is_active = active WHERE is_active IS DISTINCT FROM active;
    ALTER TABLE public.servers DROP COLUMN active;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'description'
  ) THEN
    ALTER TABLE public.servers ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'player_count'
  ) THEN
    ALTER TABLE public.servers ADD COLUMN player_count INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'max_players'
  ) THEN
    ALTER TABLE public.servers ADD COLUMN max_players INTEGER NOT NULL DEFAULT 1000;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'icon_emoji'
  ) THEN
    ALTER TABLE public.servers ADD COLUMN icon_emoji TEXT NOT NULL DEFAULT '🎮';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.servers ADD COLUMN tags TEXT[] NOT NULL DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'discord_url'
  ) THEN
    ALTER TABLE public.servers ADD COLUMN discord_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.servers ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.servers ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE public.servers ADD COLUMN profile_id UUID
      REFERENCES public.profiles (id) ON DELETE SET NULL;
  END IF;
END $$;

DROP INDEX IF EXISTS idx_servers_active;
CREATE INDEX idx_servers_active
  ON public.servers (player_count DESC)
  WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS trg_servers_updated_at ON public.servers;
CREATE TRIGGER trg_servers_updated_at
  BEFORE UPDATE ON public.servers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Auth-Helfer: Discord-ID aus Supabase Auth (Discord OAuth)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_discord_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() -> 'user_metadata' ->> 'provider_id', ''),
    NULLIF(auth.jwt() -> 'user_metadata' ->> 'sub', ''),
    NULLIF(auth.jwt() -> 'user_metadata' ->> 'id', ''),
    (
      SELECT NULLIF(i.identity_data ->> 'id', '')
      FROM auth.identities i
      WHERE i.user_id = auth.uid()
        AND i.provider = 'discord'
      LIMIT 1
    )
  );
$$;

COMMENT ON FUNCTION public.current_discord_id IS
  'Liest die Discord Snowflake-ID aus dem eingeloggten Web-User (JWT / identities)';

-- Optional: Spieler-Zeile nach erstem Web-Login mit Auth verknüpfen
-- (falls /link im Discord bereits gelaufen ist, aber discord_id noch fehlt)
CREATE OR REPLACE FUNCTION public.sync_player_from_auth()
RETURNS public.players
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_discord_id TEXT;
  v_player     public.players%ROWTYPE;
BEGIN
  v_discord_id := public.current_discord_id();

  IF v_discord_id IS NULL OR auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht eingeloggt oder keine Discord-ID im Token';
  END IF;

  SELECT * INTO v_player
  FROM public.players
  WHERE discord_id = v_discord_id
  LIMIT 1;

  IF FOUND THEN
    RETURN v_player;
  END IF;

  -- Kein verknüpfter Account → User muss zuerst /link im Discord nutzen
  RAISE EXCEPTION 'Kein verknüpfter Spieler. Nutze /link <CODE> im Discord.';
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. Web-RPC: Sichere atomische Käufe (statt 2 separate PATCH-Requests)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.web_purchase_vault_item(p_vault_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_discord_id TEXT;
  v_result     JSONB;
BEGIN
  v_discord_id := public.current_discord_id();

  IF v_discord_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'reason',  'not_authenticated',
      'message', 'Bitte mit Discord einloggen.'
    );
  END IF;

  -- Bestehende Bot/Plugin-Transaktion wiederverwenden
  v_result := public.purchase_vault_item(v_discord_id, p_vault_id);

  IF (v_result ->> 'success')::BOOLEAN THEN
    RETURN v_result || jsonb_build_object(
      'title',       (SELECT name FROM public.vault WHERE id = p_vault_id),
      'description', (SELECT description FROM public.vault WHERE id = p_vault_id),
      'cost_coins',  (SELECT cost FROM public.vault WHERE id = p_vault_id),
      'code',        CASE
                       WHEN (v_result ->> 'content') ~ '^https?://' THEN NULL
                       ELSE v_result ->> 'content'
                     END,
      'link',        CASE
                       WHEN (v_result ->> 'content') ~ '^https?://' THEN v_result ->> 'content'
                       ELSE NULL
                     END
    );
  END IF;

  RETURN v_result || jsonb_build_object(
    'message', CASE v_result ->> 'reason'
      WHEN 'not_linked'          THEN 'Account nicht verknüpft. Nutze /link im Discord.'
      WHEN 'not_available'       THEN 'Reward nicht mehr verfügbar.'
      WHEN 'insufficient_coins'  THEN 'Nicht genügend LootCoins.'
      WHEN 'concurrent_update'   THEN 'Bitte erneut versuchen.'
      ELSE 'Kauf fehlgeschlagen.'
    END
  );
END;
$$;

COMMENT ON FUNCTION public.web_purchase_vault_item IS
  'Web-Frontend: atomischer Vault-Kauf mit Auth-Discord-ID (wrappt purchase_vault_item)';

-- Eigenen Spieler + Kontostand für Dashboard
CREATE OR REPLACE FUNCTION public.web_get_my_player()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_discord_id TEXT;
  v_row        public.players%ROWTYPE;
BEGIN
  v_discord_id := public.current_discord_id();

  IF v_discord_id IS NULL THEN
    RETURN jsonb_build_object('found', FALSE, 'reason', 'not_authenticated');
  END IF;

  SELECT * INTO v_row
  FROM public.players
  WHERE discord_id = v_discord_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'found', FALSE,
      'reason', 'not_linked',
      'message', 'Kein Minecraft-Account verknüpft. Nutze /link <CODE> im Discord.'
    );
  END IF;

  RETURN jsonb_build_object(
    'found',         TRUE,
    'id',            v_row.id,
    'discord_id',    v_row.discord_id,
    'loot_coins',    v_row.loot_coins,
    'total_earned',  v_row.total_earned,
    'username',      COALESCE(v_row.minecraft_username, 'Spieler'),
    'minecraft_uuid', v_row.minecraft_uuid
  );
END;
$$;

-- Shop-Listing ohne geheimen Inhalt (für Landingpage + Dashboard)
CREATE OR REPLACE FUNCTION public.web_list_available_rewards(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id           UUID,
  title        TEXT,
  description  TEXT,
  cost_coins   INTEGER,
  reward_type  TEXT,
  icon         TEXT,
  is_used      BOOLEAN,
  created_at   TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    v.id,
    v.name        AS title,
    v.description,
    v.cost        AS cost_coins,
    v.reward_type,
    v.icon,
    v.is_used,
    v.created_at
  FROM public.vault v
  WHERE v.is_used = FALSE
  ORDER BY v.cost ASC, v.created_at DESC
  LIMIT GREATEST(p_limit, 1);
$$;

-- ---------------------------------------------------------------------------
-- 6. Öffentliche View (zusätzliche Absicherung: niemals content preisgeben)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.vault_shop
WITH (security_invoker = TRUE)
AS
SELECT
  v.id,
  v.name        AS title,
  v.description,
  v.cost        AS cost_coins,
  v.reward_type,
  v.icon,
  v.is_used,
  v.profile_id,
  v.created_at
FROM public.vault v
WHERE v.is_used = FALSE;

COMMENT ON VIEW public.vault_shop IS
  'Öffentlicher Shop-Katalog ohne geheimen Reward-Inhalt (content)';

GRANT SELECT ON public.vault_shop TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7. Row Level Security – Web (ergänzt bestehende Bot-Policies)
-- ---------------------------------------------------------------------------

ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;

-- Alte Web-Policies idempotent entfernen
DROP POLICY IF EXISTS "servers_public_read_active"     ON public.servers;
DROP POLICY IF EXISTS "players_web_read_own"           ON public.players;
DROP POLICY IF EXISTS "vault_web_read_own_claimed"     ON public.vault;
DROP POLICY IF EXISTS "vault_web_no_direct_update"     ON public.vault;

-- Partner-Server: jeder darf aktive Server sehen
CREATE POLICY "servers_public_read_active" ON public.servers
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

-- Eigener Spieler-Datensatz (nur lesen – Coins ändern nur via RPC)
CREATE POLICY "players_web_read_own" ON public.players
  FOR SELECT TO authenticated
  USING (discord_id = public.current_discord_id());

-- Eingelöste Rewards des Users lesen (inkl. content/code nach Kauf)
CREATE POLICY "vault_web_read_own_claimed" ON public.vault
  FOR SELECT TO authenticated
  USING (
    is_used = TRUE
    AND claimed_by = public.current_discord_id()
  );

-- Direktes UPDATE auf vault/players durch Web-User verbieten
-- (Käufe laufen ausschließlich über web_purchase_vault_item)
REVOKE UPDATE ON public.players FROM anon, authenticated;
REVOKE UPDATE ON public.vault   FROM anon, authenticated;

-- Anon/Authenticated: erweiterte Spalten für Shop-Listing
REVOKE SELECT ON public.vault FROM anon, authenticated;
GRANT SELECT (
  id, name, description, cost, is_used, created_at,
  title, cost_coins, reward_type, icon, profile_id
) ON public.vault TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 8. Grants für Web-API-Rollen
-- ---------------------------------------------------------------------------

GRANT SELECT ON public.servers TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.current_discord_id()        TO authenticated;
GRANT EXECUTE ON FUNCTION public.web_get_my_player()         TO authenticated;
GRANT EXECUTE ON FUNCTION public.web_purchase_vault_item(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.web_list_available_rewards(INTEGER) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 9. Demo-Daten: Partner-Server Showcase
-- ---------------------------------------------------------------------------

INSERT INTO public.servers (name, slug, description, player_count, max_players, icon_emoji, tags, discord_url, is_active)
VALUES
  (
    'CraftLand SMP',
    'craftland-smp',
    'Survival Multiplayer mit aktiver Community und wöchentlichen Events.',
    2400, 5000, '⚔️',
    ARRAY['SMP', 'Survival', 'PvP'],
    'https://discord.gg/example',
    TRUE
  ),
  (
    'SkyBlock Empire',
    'skyblock-empire',
    'Deutschsprachiger SkyBlock-Server mit eigenem Wirtschaftssystem.',
    1800, 3000, '🌤️',
    ARRAY['SkyBlock', 'Economy', 'Factions'],
    'https://discord.gg/example',
    TRUE
  ),
  (
    'HypixelDE',
    'hypixelde',
    'Mini-Games, BedWars, SkyWars auf deutschem High-Performance-Server.',
    5100, 10000, '🏆',
    ARRAY['Mini-Games', 'BedWars', 'Competitive'],
    'https://discord.gg/example',
    TRUE
  ),
  (
    'PixelFusion',
    'pixelfusion',
    'Kreativserver mit Builder-Community und monatlichen Baucontests.',
    890, 2000, '🎮',
    ARRAY['Creative', 'Building', 'Community'],
    'https://discord.gg/example',
    TRUE
  ),
  (
    'CubeCraft EU',
    'cubecraft-eu',
    'Europäischer Game-Server mit niedrigem Ping und Ranking-System.',
    3200, 6000, '🟦',
    ARRAY['Competitive', 'Ranked', 'EU'],
    'https://discord.gg/example',
    TRUE
  ),
  (
    'Mineplex DE',
    'mineplex-de',
    'Klassische Mineplex-Spielmodi auf einem deutschen Server.',
    1100, 3000, '⚡',
    ARRAY['Mini-Games', 'Classic', 'German'],
    'https://discord.gg/example',
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  description   = EXCLUDED.description,
  player_count  = EXCLUDED.player_count,
  max_players   = EXCLUDED.max_players,
  icon_emoji    = EXCLUDED.icon_emoji,
  tags          = EXCLUDED.tags,
  discord_url   = EXCLUDED.discord_url,
  is_active     = EXCLUDED.is_active,
  updated_at    = NOW();

-- Vault-Demo: reward_type für bestehende Einträge (falls noch nicht gesetzt)
UPDATE public.vault
SET reward_type = CASE
  WHEN name ILIKE '%nitro%'  THEN 'digital'
  WHEN name ILIKE '%steam%'  THEN 'digital'
  WHEN name ILIKE '%amazon%' THEN 'digital'
  WHEN name ILIKE '%crate%' OR name ILIKE '%badge%' OR name ILIKE '%vip%' THEN 'ingame'
  WHEN content ~ '^https?://' THEN 'affiliate'
  ELSE reward_type
END;

-- =============================================================================
-- SUPABASE AUTH: Discord OAuth (manuell im Dashboard konfigurieren)
-- =============================================================================
-- Authentication → Providers → Discord → aktivieren
-- Redirect URLs:
--   http://localhost:3000/auth/callback
--   https://<deine-domain>/auth/callback
--
-- Site URL: https://<deine-domain>  (oder http://localhost:3000)
-- =============================================================================

-- =============================================================================
-- TEST-CHECKLISTE (Web)
-- =============================================================================
-- 1. Bot: /link DEMO1234  → discord_id in players gesetzt
-- 2. Web: Mit Discord einloggen (gleicher Discord-Account)
-- 3. SQL:  SELECT public.web_get_my_player();
-- 4. Web:  /dashboard → LootCoins + Shop sichtbar
-- 5. Kauf: SELECT public.web_purchase_vault_item('<vault-uuid>');
-- 6. /servers → 6 Partner-Server sichtbar
-- =============================================================================
