-- =========================================================
-- ESQUEMA DO BANCO DE DADOS SUPABASE (POSTGRESQL)
-- Organização: Abutres · Painel de Auditoria e Log de Farm FiveM
-- =========================================================

-- 1. Tabela de Entregas de Farm (deliveries)
CREATE TABLE IF NOT EXISTS public.deliveries (
    id VARCHAR(64) PRIMARY KEY,
    player_name TEXT NOT NULL,
    passport_id TEXT NOT NULL,
    discord_id TEXT,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit VARCHAR(32) NOT NULL DEFAULT 'unid.',
    chest_location TEXT NOT NULL DEFAULT 'Baú da Fac',
    delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    photo_url TEXT NOT NULL,
    notes TEXT,
    audit_status VARCHAR(32) NOT NULL DEFAULT 'pendente',
    webhook_status VARCHAR(32) NOT NULL DEFAULT 'aguardando_config',
    webhook_http_code INTEGER,
    webhook_error TEXT,
    webhook_sent_at TIMESTAMPTZ
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_deliveries_passport ON public.deliveries(passport_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivered_at ON public.deliveries(delivered_at DESC);
CREATE INDEX IF NOT EXISTS idx_deliveries_audit_status ON public.deliveries(audit_status);

-- 2. Tabela de Configurações do Painel e Discord (configs)
CREATE TABLE IF NOT EXISTS public.configs (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'main',
    webhook_url TEXT NOT NULL DEFAULT 'https://discord.com/api/webhooks/1564322368573415568/717AXX9zSrC6Q_XlKJpYPoZtRC4kuQ5W76mMnZ4QMlK5pYf4ONKnVmcRVeAzzfGZ4lWu',
    bot_name TEXT NOT NULL DEFAULT 'Abutres · Auditoria FiveM',
    embed_color VARCHAR(16) NOT NULL DEFAULT '#4F46E5',
    server_name TEXT NOT NULL DEFAULT 'Abutres',
    role_mention TEXT NOT NULL DEFAULT '<@1528141958856442052>',
    auto_send BOOLEAN NOT NULL DEFAULT TRUE,
    weekly_goal_per_member INTEGER NOT NULL DEFAULT 2500,
    admin_pin VARCHAR(16) NOT NULL DEFAULT '0604',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserção de dados iniciais de configuração (Seeding)
INSERT INTO public.configs (
    id, 
    webhook_url, 
    bot_name, 
    embed_color, 
    server_name, 
    role_mention, 
    auto_send, 
    weekly_goal_per_member, 
    admin_pin
) 
VALUES (
    'main',
    'https://discord.com/api/webhooks/1564322368573415568/717AXX9zSrC6Q_XlKJpYPoZtRC4kuQ5W76mMnZ4QMlK5pYf4ONKnVmcRVeAzzfGZ4lWu',
    'Abutres · Auditoria FiveM',
    '#4F46E5',
    'Abutres',
    '<@1528141958856442052>',
    TRUE,
    2500,
    '0604'
)
ON CONFLICT (id) DO UPDATE SET
    webhook_url = EXCLUDED.webhook_url,
    role_mention = EXCLUDED.role_mention,
    admin_pin = EXCLUDED.admin_pin;

-- 3. Habilitar RLS (Row Level Security) e permitir acesso anônimo/leitura e escrita
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso (RLS Policies)
DROP POLICY IF EXISTS "Permitir leitura publica de entregas" ON public.deliveries;
CREATE POLICY "Permitir leitura publica de entregas" ON public.deliveries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercao de entregas" ON public.deliveries;
CREATE POLICY "Permitir insercao de entregas" ON public.deliveries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualizacao de entregas" ON public.deliveries;
CREATE POLICY "Permitir atualizacao de entregas" ON public.deliveries FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir exclusao de entregas" ON public.deliveries;
CREATE POLICY "Permitir exclusao de entregas" ON public.deliveries FOR DELETE USING (true);

DROP POLICY IF EXISTS "Permitir leitura de configs" ON public.configs;
CREATE POLICY "Permitir leitura de configs" ON public.configs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir atualizacao de configs" ON public.configs;
CREATE POLICY "Permitir atualizacao de configs" ON public.configs FOR ALL USING (true);
