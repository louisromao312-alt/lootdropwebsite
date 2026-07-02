-- =============================================================================
-- LootDrop – Hotfix: servers-Tabelle auf Web-Schema bringen
-- =============================================================================
-- Ausführen wenn Fehler wie:
--   column "is_active" does not exist  →  Spalte heißt "active"
--   column "player_count" does not exist
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'servers'
  ) THEN
    -- Tabelle existiert nicht → komplett anlegen
    CREATE TABLE public.servers (
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
    RETURN;
  END IF;

  -- active → is_active
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'active'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'servers' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.servers RENAME COLUMN active TO is_active;
  END IF;

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

  -- Fehlende Web-Spalten ergänzen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='servers' AND column_name='description') THEN
    ALTER TABLE public.servers ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='servers' AND column_name='player_count') THEN
    ALTER TABLE public.servers ADD COLUMN player_count INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='servers' AND column_name='max_players') THEN
    ALTER TABLE public.servers ADD COLUMN max_players INTEGER NOT NULL DEFAULT 1000;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='servers' AND column_name='icon_emoji') THEN
    ALTER TABLE public.servers ADD COLUMN icon_emoji TEXT NOT NULL DEFAULT '🎮';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='servers' AND column_name='tags') THEN
    ALTER TABLE public.servers ADD COLUMN tags TEXT[] NOT NULL DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='servers' AND column_name='discord_url') THEN
    ALTER TABLE public.servers ADD COLUMN discord_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='servers' AND column_name='is_active') THEN
    ALTER TABLE public.servers ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='servers' AND column_name='created_at') THEN
    ALTER TABLE public.servers ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='servers' AND column_name='updated_at') THEN
    ALTER TABLE public.servers ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='servers' AND column_name='profile_id') THEN
    BEGIN
      ALTER TABLE public.servers ADD COLUMN profile_id UUID
        REFERENCES public.profiles (id) ON DELETE SET NULL;
    EXCEPTION WHEN OTHERS THEN
      ALTER TABLE public.servers ADD COLUMN profile_id UUID;
    END;
  END IF;
END $$;

-- Index + RLS (erst NACH Spalten-Migration!)
DROP INDEX IF EXISTS idx_servers_active;
CREATE INDEX idx_servers_active
  ON public.servers (player_count DESC)
  WHERE is_active = TRUE;

ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "servers_public_read_active" ON public.servers;
CREATE POLICY "servers_public_read_active" ON public.servers
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

GRANT SELECT ON public.servers TO anon, authenticated;

-- Demo-Server (optional – überspringt bestehende slugs)
INSERT INTO public.servers (name, slug, description, player_count, max_players, icon_emoji, tags, discord_url, is_active)
VALUES
  ('CraftLand SMP',   'craftland-smp',   'Survival Multiplayer mit aktiver Community.', 2400, 5000, '⚔️', ARRAY['SMP','Survival'], 'https://discord.gg/example', TRUE),
  ('SkyBlock Empire', 'skyblock-empire', 'Deutschsprachiger SkyBlock-Server.',         1800, 3000, '🌤️', ARRAY['SkyBlock'],       'https://discord.gg/example', TRUE),
  ('HypixelDE',       'hypixelde',       'Mini-Games und BedWars.',                    5100, 10000,'🏆', ARRAY['Mini-Games'],     'https://discord.gg/example', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  description  = EXCLUDED.description,
  player_count = EXCLUDED.player_count,
  max_players  = EXCLUDED.max_players,
  icon_emoji   = EXCLUDED.icon_emoji,
  tags         = EXCLUDED.tags,
  discord_url  = EXCLUDED.discord_url,
  is_active    = EXCLUDED.is_active,
  updated_at   = NOW();
