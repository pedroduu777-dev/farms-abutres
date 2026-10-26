import heroTacticalImg from '../assets/images/hero_fivem_vault_tactical_1793034272879.jpg';

export { heroTacticalImg };

// Embedded crisp FiveM style inventory HUD screenshots as self-contained data URIs
const SVG_SEED_HERBS =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#0B101B"/>
  <rect x="20" y="20" width="760" height="560" rx="12" fill="#111827" stroke="#1F2937" stroke-width="2"/>
  <rect x="20" y="20" width="760" height="50" rx="12" fill="#1E293B"/>
  <text x="50" y="52" fill="#F8FAFC" font-family="monospace" font-size="20" font-weight="bold">VAULT STORAGE · BAÚ PRINCIPAL #01</text>
  <text x="640" y="52" fill="#10B981" font-family="monospace" font-size="14">CAPACIDADE: 65%</text>
  
  <g fill="#0B0F17" stroke="#334155" stroke-width="1.5">
    <rect x="50" y="100" width="130" height="130" rx="8" fill="#0F172A" stroke="#10B981" stroke-width="2"/>
    <rect x="195" y="100" width="130" height="130" rx="8"/>
    <rect x="340" y="100" width="130" height="130" rx="8"/>
    <rect x="485" y="100" width="130" height="130" rx="8"/>
    <rect x="630" y="100" width="130" height="130" rx="8"/>

    <rect x="50" y="245" width="130" height="130" rx="8"/>
    <rect x="195" y="245" width="130" height="130" rx="8"/>
    <rect x="340" y="245" width="130" height="130" rx="8"/>
    <rect x="485" y="245" width="130" height="130" rx="8"/>
    <rect x="630" y="245" width="130" height="130" rx="8"/>
  </g>

  <circle cx="115" cy="155" r="34" fill="#065F46"/>
  <path d="M115 130 C130 145 135 170 115 185 C95 170 100 145 115 130 Z" fill="#34D399"/>
  <path d="M115 135 L115 180" stroke="#064E3B" stroke-width="2"/>
  <text x="115" y="215" text-anchor="middle" fill="#FFFFFF" font-family="monospace" font-size="14" font-weight="bold">FOLHA PROCESSADA</text>
  <rect x="125" y="108" width="48" height="22" rx="4" fill="#047857"/>
  <text x="149" y="123" text-anchor="middle" fill="#FFFFFF" font-family="monospace" font-size="12" font-weight="bold">650x</text>

  <rect x="50" y="420" width="700" height="130" rx="8" fill="#070A10" stroke="#1E293B"/>
  <text x="75" y="455" fill="#94A3B8" font-family="monospace" font-size="14">FIVEM SCREENSHOT LOG · DEPOSITED AT CHEST</text>
  <text x="75" y="485" fill="#F1F5F9" font-family="monospace" font-size="16">JOGADOR: Lucas Mendes [PASSAPORTE #1042]</text>
  <text x="75" y="515" fill="#38BDF8" font-family="monospace" font-size="14">STATUS: Comprovante de farm validado no baú da facção</text>
</svg>`);

const SVG_SEED_MUNITIONS =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#0B101B"/>
  <rect x="20" y="20" width="760" height="560" rx="12" fill="#111827" stroke="#1F2937" stroke-width="2"/>
  <rect x="20" y="20" width="760" height="50" rx="12" fill="#1E293B"/>
  <text x="50" y="52" fill="#F8FAFC" font-family="monospace" font-size="20" font-weight="bold">ARMORY STASH · BAÚ DE MUNIÇÃO #03</text>
  <text x="640" y="52" fill="#F59E0B" font-family="monospace" font-size="14">CAPACIDADE: 82%</text>

  <g fill="#0B0F17" stroke="#334155" stroke-width="1.5">
    <rect x="50" y="100" width="130" height="130" rx="8" fill="#0F172A" stroke="#F59E0B" stroke-width="2"/>
    <rect x="195" y="100" width="130" height="130" rx="8"/>
    <rect x="340" y="100" width="130" height="130" rx="8"/>
    <rect x="485" y="100" width="130" height="130" rx="8"/>
    <rect x="630" y="100" width="130" height="130" rx="8"/>
  </g>

  <rect x="95" y="135" width="16" height="36" rx="3" fill="#FBBF24"/>
  <rect x="115" y="135" width="16" height="36" rx="3" fill="#FBBF24"/>
  <rect x="135" y="135" width="16" height="36" rx="3" fill="#FBBF24"/>
  <text x="115" y="215" text-anchor="middle" fill="#FFFFFF" font-family="monospace" font-size="14" font-weight="bold">CÁPSULAS DE LATÃO</text>
  <rect x="120" y="108" width="55" height="22" rx="4" fill="#B45309"/>
  <text x="147" y="123" text-anchor="middle" fill="#FFFFFF" font-family="monospace" font-size="12" font-weight="bold">1.200x</text>

  <rect x="50" y="420" width="700" height="130" rx="8" fill="#070A10" stroke="#1E293B"/>
  <text x="75" y="455" fill="#94A3B8" font-family="monospace" font-size="14">FIVEM SCREENSHOT LOG · BUNKER B42 DEPOSIT</text>
  <text x="75" y="485" fill="#F1F5F9" font-family="monospace" font-size="16">JOGADOR: Gabriel Rocha [PASSAPORTE #2189]</text>
  <text x="75" y="515" fill="#F59E0B" font-family="monospace" font-size="14">STATUS: Lote guardado para fabricação de munição</text>
</svg>`);

const SVG_SEED_MATERIALS =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#0B101B"/>
  <rect x="20" y="20" width="760" height="560" rx="12" fill="#111827" stroke="#1F2937" stroke-width="2"/>
  <rect x="20" y="20" width="760" height="50" rx="12" fill="#1E293B"/>
  <text x="50" y="52" fill="#F8FAFC" font-family="monospace" font-size="20" font-weight="bold">DEPÓSITO GERAL · GALPÃO NORTE #05</text>
  <text x="640" y="52" fill="#6366F1" font-family="monospace" font-size="14">CAPACIDADE: 45%</text>

  <g fill="#0B0F17" stroke="#334155" stroke-width="1.5">
    <rect x="50" y="100" width="130" height="130" rx="8" fill="#0F172A" stroke="#6366F1" stroke-width="2"/>
    <rect x="195" y="100" width="130" height="130" rx="8"/>
    <rect x="340" y="100" width="130" height="130" rx="8"/>
    <rect x="485" y="100" width="130" height="130" rx="8"/>
    <rect x="630" y="100" width="130" height="130" rx="8"/>
  </g>

  <polygon points="115,130 145,150 135,185 95,185 85,150" fill="#94A3B8" stroke="#E2E8F0" stroke-width="2"/>
  <text x="115" y="215" text-anchor="middle" fill="#FFFFFF" font-family="monospace" font-size="14" font-weight="bold">MINÉRIO DE FERRO</text>
  <rect x="125" y="108" width="48" height="22" rx="4" fill="#4338CA"/>
  <text x="149" y="123" text-anchor="middle" fill="#FFFFFF" font-family="monospace" font-size="12" font-weight="bold">840x</text>

  <rect x="50" y="420" width="700" height="130" rx="8" fill="#070A10" stroke="#1E293B"/>
  <text x="75" y="455" fill="#94A3B8" font-family="monospace" font-size="14">FIVEM SCREENSHOT LOG · TRUCK CARGO TRANSFER</text>
  <text x="75" y="485" fill="#F1F5F9" font-family="monospace" font-size="16">JOGADOR: Mariana Costa [PASSAPORTE #0874]</text>
  <text x="75" y="515" fill="#818CF8" font-family="monospace" font-size="14">STATUS: Minério descarregado no galpão</text>
</svg>`);

const SEED_IMAGE_MAP: Record<string, string> = {
  'seed:herbs': SVG_SEED_HERBS,
  'seed:munitions': SVG_SEED_MUNITIONS,
  'seed:materials': SVG_SEED_MATERIALS,
};

export function resolveProofPhotoUrl(photoUrl: string): string {
  if (!photoUrl) return '';
  if (SEED_IMAGE_MAP[photoUrl]) {
    return SEED_IMAGE_MAP[photoUrl];
  }
  return photoUrl;
}
