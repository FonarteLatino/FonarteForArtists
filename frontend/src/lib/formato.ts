/**
 * Utilidades de formato para el portal del artista.
 *
 * Solo se formatean CONTEOS de reproducciones (números enteros) y períodos.
 * No existe —ni debe existir— ninguna función de formato de moneda en el portal:
 * mostrar un monto está prohibido por diseño (implementation_plan §1 y §8).
 */

/** 1234567 → "1,234,567" */
export function formatearNumero(valor: number | null | undefined): string {
  const n = Number(valor);
  if (!Number.isFinite(n)) return '0';
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(n);
}

/** 1234567 → "1.2 M" (para tarjetas y etiquetas compactas) */
export function formatearCompacto(valor: number | null | undefined): string {
  const n = Number(valor);
  if (!Number.isFinite(n)) return '0';

  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} mM`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)} K`;
  return formatearNumero(n);
}

/** 42.7 → "42.7 %" */
export function formatearPorcentaje(valor: number | null | undefined): string {
  const n = Number(valor);
  if (!Number.isFinite(n)) return '0 %';
  return `${n.toFixed(1)} %`;
}

/** "2024-03" → "mar 2024" */
export function formatearPeriodo(periodo: string | null | undefined): string {
  if (!periodo) return '—';
  const [anio, mes] = periodo.split('-');
  if (!anio || !mes) return periodo;

  const meses = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ];
  const idx = parseInt(mes, 10) - 1;
  return idx >= 0 && idx < 12 ? `${meses[idx]} ${anio}` : periodo;
}

/**
 * Convierte un código de país (ISO-2/ISO-3) en un nombre legible.
 * El backend entrega `Country_Sale` tal cual viene en la base (habitualmente ISO-3).
 */
const NOMBRES_PAIS: Record<string, string> = {
  MEX: 'México',
  USA: 'Estados Unidos',
  ESP: 'España',
  ARG: 'Argentina',
  COL: 'Colombia',
  CHL: 'Chile',
  PER: 'Perú',
  BRA: 'Brasil',
  GTM: 'Guatemala',
  ECU: 'Ecuador',
  ESP_ES: 'España',
  CAN: 'Canadá',
  GBR: 'Reino Unido',
  DEU: 'Alemania',
  FRA: 'Francia',
  ITA: 'Italia',
  JPN: 'Japón',
  AUS: 'Australia',
  // Códigos ISO-2 por si la fuente los entrega así
  MX: 'México',
  US: 'Estados Unidos',
  ES: 'España',
  AR: 'Argentina',
  CO: 'Colombia',
  CL: 'Chile',
  PE: 'Perú',
  BR: 'Brasil',
  GT: 'Guatemala',
  EC: 'Ecuador',
  CA: 'Canadá',
  GB: 'Reino Unido',
  DE: 'Alemania',
  FR: 'Francia',
  IT: 'Italia',
  JP: 'Japón',
  AU: 'Australia',
};

export function nombrePais(codigo: string | null | undefined): string {
  if (!codigo) return 'Desconocido';
  const key = codigo.toUpperCase().trim();
  return NOMBRES_PAIS[key] || key;
}

/**
 * Convierte un nombre de país a su emoji de bandera cuando el código es ISO-2.
 * Devuelve cadena vacía si no se puede resolver (no es crítico).
 */
export function banderaPais(codigo: string | null | undefined): string {
  if (!codigo) return '';
  const key = codigo.toUpperCase().trim();
  // Solo ISO-2 produce bandera válida
  const iso2 = key.length === 2 ? key : ISO3_A_ISO2[key];
  if (!iso2 || iso2.length !== 2) return '';
  return String.fromCodePoint(
    ...iso2.split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

/** Mapa mínimo ISO-3 → ISO-2 para banderas de los países más frecuentes. */
const ISO3_A_ISO2: Record<string, string> = {
  MEX: 'MX',
  USA: 'US',
  ESP: 'ES',
  ARG: 'AR',
  COL: 'CO',
  CHL: 'CL',
  PER: 'PE',
  BRA: 'BR',
  GTM: 'GT',
  ECU: 'EC',
  CAN: 'CA',
  GBR: 'GB',
  DEU: 'DE',
  FRA: 'FR',
  ITA: 'IT',
  JPN: 'JP',
  AUS: 'AU',
};

/** Nombre legible (o el propio valor) para una plataforma. */
export function nombrePlataforma(plataforma: string | null | undefined): string {
  if (!plataforma) return 'Desconocida';
  return plataforma.trim();
}
