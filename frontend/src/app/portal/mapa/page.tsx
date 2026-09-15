'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { FiltrosStats } from '@/components/portal/FiltrosStats';
import { useStats } from '@/components/portal/StatsProvider';
import {
  BannerError,
  BarraProporcion,
  Cargando,
  EstadoVacio,
  KpiCard,
  Panel,
} from '@/components/portal/ui';
import {
  banderaPais,
  formatearNumero,
  formatearPorcentaje,
  nombrePais,
} from '@/lib/formato';

/**
 * Mapa geográfico de audiencia (Fase 5, plan §8).
 *
 * Vista geográfica del portal del artista. Muestra de dónde vienen las
 * reproducciones: un mapa mundial estilizado (SVG dibujado a mano, sin
 * dependencias ni peticiones de red), una tarjeta de detalle del país
 * seleccionado, el desglose por plataforma de ese país y el ranking completo de
 * países.
 *
 * Prohibición de diseño: esta vista solo muestra CONTEOS de reproducciones y
 * geografía. Nunca importes, regalías, pagos ni moneda de ningún tipo.
 */

// ============================================================================
// Mapa estilizado: datos de las formas
// ============================================================================

/**
 * Una forma del mapa. Las coordenadas ya están proyectadas al `viewBox`
 * `0 0 1000 500` con una proyección equirectangular
 * (`x = (lon + 180) * 1000/360`, `y = (90 - lat) * 500/180`), pero escritas a
 * mano y simplificadas a polígonos reconocibles: el mapa es una REPRESENTACIÓN
 * ESTILIZADA, no cartografía precisa. La tabla de ranking es el desglose
 * autoritativo de todos los países, incluidos los que no están dibujados.
 */
interface FormaPais {
  /** Clave estable de la forma. */
  id: string;
  /** Códigos (ISO-3 e ISO-2) con los que los datos pueden identificar a este país. */
  codigos: string[];
  nombre: string;
  /** Puntos "x,y" separados por espacio. */
  puntos: string;
}

const FORMAS_MAPA: FormaPais[] = [
  {
    id: 'CAN',
    codigos: ['CAN', 'CA'],
    nombre: 'Canadá',
    puntos:
      '104,56 200,50 300,48 360,56 366,86 350,100 372,116 352,128 318,130 300,124 296,112 268,118 236,120 200,128 188,144 178,146 176,130 168,124 150,126 136,120 128,100 112,84 96,74',
  },
  {
    id: 'USA',
    codigos: ['USA', 'US'],
    nombre: 'Estados Unidos',
    puntos:
      '152,114 300,114 312,118 316,148 310,156 302,168 286,166 282,178 270,182 244,184 231,179 212,172 196,166 176,164 162,170 154,170 150,150 154,128',
  },
  {
    id: 'MEX',
    codigos: ['MEX', 'MX'],
    nombre: 'México',
    puntos:
      '176,167 205,169 220,180 238,181 246,184 234,196 226,210 216,222 208,226 200,216 192,208 184,194 174,188 164,184 170,176',
  },
  {
    id: 'GTM',
    codigos: ['GTM', 'GT'],
    nombre: 'Guatemala',
    puntos: '203,228 216,222 223,230 218,241 208,242 202,236',
  },
  {
    id: 'CRI',
    codigos: ['CRI', 'CR'],
    nombre: 'Costa Rica',
    puntos: '213,246 224,243 240,253 245,259 241,262 231,256 224,254 214,252',
  },
  {
    id: 'CUB',
    codigos: ['CUB', 'CU'],
    nombre: 'Cuba',
    puntos: '211,207 258,200 265,206 260,213 213,215',
  },
  {
    id: 'COL',
    codigos: ['COL', 'CO'],
    nombre: 'Colombia',
    puntos: '251,256 274,253 289,255 291,268 283,276 274,286 268,282 268,272 258,269 250,266',
  },
  {
    id: 'VEN',
    codigos: ['VEN', 'VE'],
    nombre: 'Venezuela',
    puntos: '289,253 308,248 325,247 332,252 325,259 324,266 301,265 291,269',
  },
  {
    id: 'ECU',
    codigos: ['ECU', 'EC'],
    nombre: 'Ecuador',
    puntos: '251,286 264,282 274,286 283,296 277,305 267,303 259,306 250,297',
  },
  {
    id: 'PER',
    codigos: ['PER', 'PE'],
    nombre: 'Perú',
    puntos: '250,297 263,306 273,304 281,297 292,300 305,312 306,326 300,341 291,353 289,364 282,362 279,350 269,336 256,324 246,311',
  },
  {
    id: 'CHL',
    codigos: ['CHL', 'CL'],
    nombre: 'Chile',
    puntos: '281,355 289,358 293,370 297,384 301,398 303,412 305,424 297,428 292,418 287,404 283,390 278,374 274,362',
  },
  {
    id: 'BOL',
    codigos: ['BOL', 'BO'],
    nombre: 'Bolivia',
    puntos: '286,332 300,334 314,340 317,355 304,364 292,364 289,352 297,342',
  },
  {
    id: 'PRY',
    codigos: ['PRY', 'PY'],
    nombre: 'Paraguay',
    puntos: '303,364 313,366 320,377 320,388 311,386 302,375',
  },
  {
    id: 'ARG',
    codigos: ['ARG', 'AR'],
    nombre: 'Argentina',
    puntos:
      '291,367 304,369 311,385 320,390 328,382 340,382 351,374 350,388 341,407 332,425 316,438 307,431 306,420 315,406 313,391 303,379 298,372',
  },
  {
    id: 'BRA',
    codigos: ['BRA', 'BR'],
    nombre: 'Brasil',
    puntos:
      '287,266 310,262 335,259 355,261 368,263 379,275 371,284 381,292 371,301 359,296 355,308 349,320 361,331 356,343 341,340 321,352 314,343 300,335 289,325 289,311 299,299 291,288 283,276',
  },
  {
    id: 'URY',
    codigos: ['URY', 'UY'],
    nombre: 'Uruguay',
    puntos: '324,371 336,369 344,372 340,382 329,380 322,382 321,375',
  },
  {
    id: 'PRT',
    codigos: ['PRT', 'PT'],
    nombre: 'Portugal',
    puntos: '421,155 429,154 436,158 434,170 427,180 420,176 418,165',
  },
  {
    id: 'ESP',
    codigos: ['ESP', 'ES'],
    nombre: 'España',
    puntos: '428,135 452,133 470,135 480,142 480,162 478,172 466,177 450,184 440,180 434,181 428,174 428,155',
  },
  {
    id: 'FRA',
    codigos: ['FRA', 'FR'],
    nombre: 'Francia',
    puntos: '466,122 487,118 502,120 506,130 492,136 492,146 480,150 470,142 466,130',
  },
  {
    id: 'DEU',
    codigos: ['DEU', 'DE'],
    nombre: 'Alemania',
    puntos: '499,102 519,101 532,107 532,122 529,132 517,128 502,129 497,122',
  },
  {
    id: 'ITA',
    codigos: ['ITA', 'IT'],
    nombre: 'Italia',
    puntos: '521,130 534,129 546,137 544,144 537,143 543,153 549,162 545,167 535,158 524,150 519,142',
  },
  {
    id: 'IRL',
    codigos: ['IRL', 'IE'],
    nombre: 'Irlanda',
    puntos: '449,104 458,107 457,117 450,122 445,113',
  },
  {
    id: 'GBR',
    codigos: ['GBR', 'GB', 'UK'],
    nombre: 'Reino Unido',
    puntos: '460,97 472,99 477,110 472,117 475,127 465,121 462,110 456,104',
  },
  {
    id: 'JPN',
    codigos: ['JPN', 'JP'],
    nombre: 'Japón',
    puntos: '842,146 855,158 862,173 857,186 850,201 843,216 831,209 834,196 842,180 847,164 838,155',
  },
  {
    id: 'PHL',
    codigos: ['PHL', 'PH'],
    nombre: 'Filipinas',
    puntos: '812,202 821,204 826,217 823,231 816,244 810,235 813,222 808,212',
  },
  {
    id: 'AUS',
    codigos: ['AUS', 'AU'],
    nombre: 'Australia',
    puntos:
      '798,374 828,352 862,344 906,348 940,358 958,376 950,400 936,416 902,428 858,430 826,418 804,400',
  },
  {
    id: 'NZL',
    codigos: ['NZL', 'NZ'],
    nombre: 'Nueva Zelanda',
    puntos: '962,430 972,428 980,438 985,452 978,470 970,464 972,450 964,442',
  },
];

/** Códigos sin forma dibujada que igualmente se pintan como masa continental neutra. */
const FORMAS_CONTEXTO: Array<{ id: string; puntos: string }> = [
  {
    id: 'GRL',
    puntos: '332,20 372,14 414,18 432,32 436,52 420,64 400,60 380,66 362,80 346,72 336,56 328,38',
  },
];

const FORMAS_CONTEXTO_POR_CODIGO = new Set(['GRL']);

/** Índice código (ISO-3/ISO-2 en mayúsculas) → forma del mapa. */
const FORMA_POR_CODIGO: Map<string, FormaPais> = new Map(
  FORMAS_MAPA.flatMap((f) => f.codigos.map((c) => [c, f] as const)),
);

// ============================================================================
// Escala de color e interactividad
// ============================================================================

/** Relleno neutro para países sin reproducciones. */
const RELLENO_SIN_DATOS = '#1e293b';

/** Escala de intensidad: 5 tramos, de menor a mayor participación. */
const ESCALA = [
  {
    etiqueta: 'Menos de 1 %',
    relleno: '#312e81',
    rango: (p: number) => p < 1,
  },
  {
    etiqueta: '1 % a 5 %',
    relleno: '#4c1d95',
    rango: (p: number) => p >= 1 && p < 5,
  },
  {
    etiqueta: '5 % a 15 %',
    relleno: '#7c3aed',
    rango: (p: number) => p >= 5 && p < 15,
  },
  {
    etiqueta: '15 % a 35 %',
    relleno: '#a78bfa',
    rango: (p: number) => p >= 15 && p < 35,
  },
  {
    etiqueta: '35 % o más',
    relleno: '#ddd6fe',
    rango: (p: number) => p >= 35,
  },
] as const;

/** Devuelve el relleno de un país según su porcentaje de reproducciones. */
function rellenoPorPorcentaje(porcentaje: number): string {
  for (let i = ESCALA.length - 1; i >= 0; i -= 1) {
    if (ESCALA[i].rango(porcentaje)) return ESCALA[i].relleno;
  }
  return ESCALA[0].relleno;
}

interface DatosMapa {
  streams: number;
  porcentaje: number;
}

/** Índice código (ISO-3/ISO-2) → datos, para resolver ambas convenciones. */
function indexarDatos(
  paises: Array<{ codigoPais: string; streams: number; porcentaje: number }>,
): Map<string, DatosMapa> {
  const indice = new Map<string, DatosMapa>();
  for (const p of paises) {
    const clave = p.codigoPais.toUpperCase().trim();
    if (!clave) continue;
    const previo = indice.get(clave);
    if (previo) {
      // Códigos duplicados (p. ej. "MEX" y "MX"): se suman sus conteos.
      indice.set(clave, {
        streams: previo.streams + p.streams,
        porcentaje: previo.porcentaje + p.porcentaje,
      });
    } else {
      indice.set(clave, { streams: p.streams, porcentaje: p.porcentaje });
    }
  }
  return indice;
}

// ============================================================================
// Sub-componentes locales
// ============================================================================

/** Icono de globo terráqueo para las tarjetas KPI. */
function IconoGlobo() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/** Icono de reproducciones (conteo, nunca dinero). */
function IconoReproducciones() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>
  );
}

/** Icono de medalla para el país líder. */
function IconoMedalla() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

function EtiquetaNota({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] text-fonarte-textMuted leading-relaxed">{children}</p>
  );
}

/** Leyenda de la escala de color del mapa. */
function LeyendaMapa() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {ESCALA.map((tramo) => (
        <span key={tramo.etiqueta} className="inline-flex items-center gap-1.5">
          <span
            className="w-3.5 h-3.5 rounded-[3px] border border-white/10"
            style={{ backgroundColor: tramo.relleno }}
          />
          <span className="text-[10px] text-fonarte-textMuted whitespace-nowrap">
            {tramo.etiqueta}
          </span>
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span
          className="w-3.5 h-3.5 rounded-[3px] border border-white/10"
          style={{ backgroundColor: RELLENO_SIN_DATOS }}
        />
        <span className="text-[10px] text-fonarte-textMuted whitespace-nowrap">Sin datos</span>
      </span>
    </div>
  );
}

/** Tarjeta de detalle del país seleccionado (o del país bajo el cursor). */
function DetallePais({
  codigo,
  nombre,
  streams,
  porcentaje,
  ranking,
  totalPaises,
  esSeleccion,
}: {
  codigo: string;
  nombre: string;
  streams: number;
  porcentaje: number;
  ranking: number | null;
  totalPaises: number;
  esSeleccion: boolean;
}) {
  const bandera = banderaPais(codigo);

  return (
    <div className="rounded-2xl border border-fonarte-border bg-fonarte-card/60 p-5 h-full flex flex-col">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-fonarte-textMuted">
        {esSeleccion ? 'País seleccionado' : 'País bajo el cursor'}
      </p>

      <div className="flex items-center gap-3 mt-3">
        {bandera ? (
          <span className="text-2xl leading-none" aria-hidden="true">
            {bandera}
          </span>
        ) : (
          <span
            className="w-8 h-8 rounded-lg bg-slate-800/80 border border-fonarte-border flex items-center justify-center text-[10px] font-bold text-slate-400"
            aria-hidden="true"
          >
            {codigo.slice(0, 3)}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-base font-bold text-white truncate">{nombre}</h3>
          <p className="text-[10px] text-fonarte-textMuted font-mono">{codigo}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-fonarte-textMuted">
            Reproducciones
          </p>
          <p className="text-lg font-bold text-white tabular-nums mt-0.5">
            {formatearNumero(streams)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-fonarte-textMuted">
            Participación
          </p>
          <p className="text-lg font-bold text-fonarte-secondary tabular-nums mt-0.5">
            {formatearPorcentaje(porcentaje)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <BarraProporcion valor={porcentaje} maximo={100} />
        <p className="text-[10px] text-fonarte-textMuted mt-2">
          {ranking != null
            ? `Puesto ${ranking} de ${totalPaises} países con audiencia`
            : 'Este país no tiene reproducciones en el conjunto de datos actual'}
        </p>
      </div>

      {streams === 0 && (
        <p className="mt-3 text-[11px] text-fonarte-gold/90 leading-relaxed">
          Sin reproducciones registradas aquí: puede que el filtro de país activo excluya al resto
          de los mercados.
        </p>
      )}
    </div>
  );
}

/** Desglose de plataformas del país seleccionado (derivado del dataset crudo). */
function DesglosePlataformas({
  paisCodigo,
  paisNombre,
}: {
  paisCodigo: string;
  paisNombre: string;
}) {
  const { canciones } = useStats();

  const filas = useMemo(() => {
    const clave = paisCodigo.toUpperCase().trim();
    const porPlataforma = new Map<string, number>();
    let total = 0;

    for (const c of canciones) {
      const codigoCancion = (c.pais ?? '').toUpperCase().trim();
      if (codigoCancion !== clave) continue;
      const streams = Number(c.streams) || 0;
      const plataforma = (c.plataforma || 'Desconocida').trim() || 'Desconocida';
      porPlataforma.set(plataforma, (porPlataforma.get(plataforma) || 0) + streams);
      total += streams;
    }

    return {
      total,
      plataformas: Array.from(porPlataforma.entries())
        .map(([plataforma, streams]) => ({
          plataforma,
          streams,
          porcentaje: total > 0 ? (streams / total) * 100 : 0,
        }))
        .sort((a, b) => b.streams - a.streams),
    };
  }, [canciones, paisCodigo]);

  if (filas.plataformas.length === 0) {
    return (
      <EtiquetaNota>
        No hay reproducciones registradas en {paisNombre} con los filtros vigentes, así que no hay
        desglose por plataforma que mostrar.
      </EtiquetaNota>
    );
  }

  const maximo = filas.plataformas[0]?.streams ?? 0;

  return (
    <div className="space-y-3">
      <EtiquetaNota>
        Distribución de las {formatearNumero(filas.total)} reproducciones de {paisNombre} entre las
        plataformas de streaming.
      </EtiquetaNota>
      <ul className="space-y-3">
        {filas.plataformas.map((p) => (
          <li key={p.plataforma}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-200 truncate">{p.plataforma}</span>
              <span className="text-xs text-fonarte-textMuted tabular-nums whitespace-nowrap">
                {formatearNumero(p.streams)}
                <span className="ml-2 text-white font-semibold">
                  {formatearPorcentaje(p.porcentaje)}
                </span>
              </span>
            </div>
            <div className="mt-1.5">
              <BarraProporcion valor={p.streams} maximo={maximo} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// Página
// ============================================================================

export default function MapaPage() {
  const {
    paises,
    canciones,
    streamsTotales,
    cargando,
    error,
    recargar,
    hayFiltros,
    filtros,
    setFiltros,
  } = useStats();

  const [busqueda, setBusqueda] = useState('');
  const [paisSeleccionado, setPaisSeleccionado] = useState<string | null>(null);
  const [paisHover, setPaisHover] = useState<string | null>(null);

  /** Códigos con datos, en formato ISO-3/ISO-2 tal como los entrega la fuente. */
  const codigosConDatos = useMemo(
    () => new Set(paises.map((p) => p.codigoPais.toUpperCase().trim()).filter(Boolean)),
    [paises],
  );

  /** Índice código → datos, consultado con ISO-3 y con su alternativa ISO-2. */
  const datosPorCodigo = useMemo(() => indexarDatos(paises), [paises]);

  const topPais = paises.length > 0 ? paises[0] : null;

  /** Puesto (1-based) de un código dentro del ranking de países. */
  const puestoDe = useMemo(() => {
    const puestos = new Map<string, number>();
    paises.forEach((p, i) => puestos.set(p.codigoPais.toUpperCase().trim(), i + 1));
    return puestos;
  }, [paises]);

  /** Datos de un país del mapa, sumando todas sus convenciones de código. */
  const datosDeForma = (forma: FormaPais): DatosMapa | null => {
    let streams = 0;
    let porcentaje = 0;
    let encontrado = false;
    for (const codigo of forma.codigos) {
      const datos = datosPorCodigo.get(codigo);
      if (datos) {
        streams += datos.streams;
        porcentaje += datos.porcentaje;
        encontrado = true;
      }
    }
    return encontrado ? { streams, porcentaje } : null;
  };

  /** Puesto de un país del mapa (el mejor puesto entre sus códigos). */
  const puestoDeForma = (forma: FormaPais): number | null => {
    let mejor: number | null = null;
    for (const codigo of forma.codigos) {
      const puesto = puestoDe.get(codigo);
      if (puesto != null && (mejor == null || puesto < mejor)) mejor = puesto;
    }
    return mejor;
  };

  /**
   * Código que debe viajar al filtro compartido. Se prefiere el código que
   * realmente existe en los datos (que puede ser ISO-2) para que el backend no
   * devuelva un conjunto vacío por una diferencia de convención.
   */
  const codigoParaFiltro = (forma: FormaPais): string =>
    forma.codigos.find((c) => codigosConDatos.has(c)) ?? forma.id;

  const alternarPais = (forma: FormaPais) => {
    // Si el país ya está filtrado (aunque se haya elegido desde la barra de
    // filtros), el clic lo deselecciona; si no, se filtra el portal por él.
    const yaSeleccionado = paisSeleccionado === forma.id || formaFiltrada?.id === forma.id;
    setPaisSeleccionado(yaSeleccionado ? null : forma.id);
    // `setFiltros` recibe el objeto COMPLETO de filtros: se conservan los demás.
    setFiltros({ ...filtros, pais: yaSeleccionado ? undefined : codigoParaFiltro(forma) });
  };

  const formaDeCodigoActivo = (codigo: string | null): FormaPais | null =>
    codigo ? FORMA_POR_CODIGO.get(codigo.toUpperCase().trim()) ?? null : null;

  /** Resuelve una forma a partir de cualquier código (ISO-3 o ISO-2) de sus alias. */
  const formaDeCodigoDatos = (codigo: string | null | undefined): FormaPais | null => {
    const clave = (codigo ?? '').toUpperCase().trim();
    if (!clave) return null;
    return FORMA_POR_CODIGO.get(clave) ?? FORMAS_MAPA.find((f) => f.codigos.includes(clave)) ?? null;
  };

  /**
   * La selección efectiva se reconcilia con el filtro compartido: si el usuario
   * cambia o limpia el país desde la barra de filtros, el mapa deja de resaltar
   * el país anterior.
   */
  const formaFiltrada = formaDeCodigoDatos(filtros.pais);
  /** País mostrado como seleccionado: el del clic o el que fija la barra de filtros. */
  const formaSeleccionada: FormaPais | null =
    formaFiltrada && (paisSeleccionado === null || formaFiltrada.id === paisSeleccionado)
      ? formaFiltrada
      : null;

  const formaHover = formaDeCodigoActivo(paisHover);

  /** Id resaltado en el mapa (la selección efectiva manda sobre el cursor). */
  const idSeleccionadoMapa = formaSeleccionada?.id ?? null;

  /** Detalle mostrado: prioriza la selección y, si no, el país bajo el cursor. */
  const formaDetalle: FormaPais | null = formaSeleccionada ?? formaHover;
  const esSeleccion = Boolean(formaSeleccionada);

  /**
   * Detalle a mostrar: se recalcula en cada render (es un cálculo trivial) para
   * no depender de la identidad de las funciones auxiliares.
   */
  const datosDetalle = formaDetalle ? datosDeForma(formaDetalle) : null;
  const detalle = formaDetalle
    ? {
        forma: formaDetalle,
        streams: datosDetalle?.streams ?? 0,
        porcentaje: datosDetalle?.porcentaje ?? 0,
        ranking: puestoDeForma(formaDetalle),
      }
    : null;

  /** Códigos con audiencia que no tienen forma dibujada (no se pierden: están en la tabla). */
  const codigosSinForma = useMemo(
    () =>
      new Set(
        [...codigosConDatos].filter(
          (c) => !FORMA_POR_CODIGO.has(c) && !FORMAS_CONTEXTO_POR_CODIGO.has(c),
        ),
      ),
    [codigosConDatos],
  );

  /** Ranking filtrado por la búsqueda de texto (cliente). */
  const rankingFiltrado = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return paises;
    return paises.filter((p) => {
      const nombre = nombrePais(p.codigoPais).toLowerCase();
      return nombre.includes(termino) || p.codigoPais.toLowerCase().includes(termino);
    });
  }, [paises, busqueda]);

  const maximoPais = topPais?.streams ?? 0;
  const paisesConDatosEnMapa = FORMAS_MAPA.filter((f) => datosDeForma(f) != null).length;
  const paisesSinForma = codigosSinForma.size;

  // --------------------------------------------------------------------------
  // Estados de carga / error
  // --------------------------------------------------------------------------
  if (cargando) {
    return (
      <div className="space-y-6">
        <FiltrosStats />
        <Cargando mensaje="Cargando la audiencia geográfica…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <FiltrosStats />
        <BannerError mensaje={error} onReintentar={recargar} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros compartidos */}
      <FiltrosStats />

      {/* Encabezado */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Audiencia geográfica
          </h1>
          <p className="text-xs text-fonarte-textMuted mt-1 leading-relaxed">
            Distribución de las reproducciones por país. Todas las cifras son conteos de escuchas.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fonarte-primary/10 border border-fonarte-primary/20 text-fonarte-primary text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-fonarte-primary" />
          Solo conteos de reproducciones
        </span>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          etiqueta="Países con audiencia"
          valor={formatearNumero(paises.length)}
          detalle="Mercados con al menos una reproducción"
          acento="primary"
          icono={<IconoGlobo />}
        />
        <KpiCard
          etiqueta="Reproducciones totales"
          valor={formatearNumero(streamsTotales)}
          detalle="Escuchas sumadas de todos los países"
          acento="secondary"
          icono={<IconoReproducciones />}
        />
        <KpiCard
          etiqueta="País líder"
          valor={topPais ? nombrePais(topPais.codigoPais) : 'Sin datos'}
          detalle={
            topPais
              ? `${formatearPorcentaje(topPais.porcentaje)} de las reproducciones · ${formatearNumero(
                  topPais.streams,
                )} escuchas`
              : 'Aún no hay reproducciones geolocalizadas'
          }
          acento="gold"
          icono={<IconoMedalla />}
        />
      </div>

      {paises.length === 0 ? (
        /* Sin países: se distingue "filtros demasiado estrictos" de "sin datos" */
        <Panel
          titulo="Mapa mundial de audiencia"
          descripcion="Intensidad de color proporcional a la participación de cada país en las reproducciones."
        >
          <EstadoVacio
            titulo={hayFiltros ? 'Ningún país coincide con los filtros' : 'Todavía no hay datos geográficos'}
            mensaje={
              hayFiltros
                ? 'No hay países que coincidan con los filtros aplicados. Prueba con otro rango de fechas, otra plataforma o quita el filtro de país.'
                : 'Aún no hay datos geográficos para este artista; aparecerán cuando la capa de datos esté cargada.'
            }
            accion={
              hayFiltros ? (
                <button
                  type="button"
                  onClick={() => setFiltros({})}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-fonarte-primary to-fonarte-primaryHover shadow-lg shadow-fonarte-primary/25 hover:opacity-95 transition"
                >
                  Limpiar filtros
                </button>
              ) : undefined
            }
          />
          {/* El mapa se muestra igualmente, atenuado, como referencia geográfica */}
          <div className="mt-4">
            <MapaMundial
              codigosSinForma={codigosSinForma}
              datosDeForma={datosDeForma}
              paisHover={paisHover}
              paisSeleccionado={idSeleccionadoMapa}
              onHover={setPaisHover}
              onSeleccionar={alternarPais}
              interactivo={false}
            />
          </div>
          <div className="mt-4">
            <LeyendaMapa />
          </div>
        </Panel>
      ) : (
        <>
          {/* Mapa + detalle */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Panel
              titulo="Mapa mundial de audiencia"
              descripcion="Cada país se pinta según su participación en las reproducciones. Pasa el cursor para ver el detalle y haz clic para filtrar el portal por ese país."
              className="xl:col-span-2"
              acciones={
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[11px] text-fonarte-textMuted tabular-nums">
                    {paisesConDatosEnMapa} de {FORMAS_MAPA.length} países del mapa con datos
                  </span>
                  {paisSeleccionado && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaisSeleccionado(null);
                        setFiltros({ ...filtros, pais: undefined });
                      }}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-300 border border-fonarte-border hover:bg-slate-800/60 transition"
                    >
                      Quitar selección
                    </button>
                  )}
                </div>
              }
            >
              <MapaMundial
                codigosSinForma={codigosSinForma}
                datosDeForma={datosDeForma}
                paisHover={paisHover}
                paisSeleccionado={idSeleccionadoMapa}
                onHover={setPaisHover}
                onSeleccionar={alternarPais}
                interactivo
              />

              <div className="mt-5 pt-4 border-t border-fonarte-border">
                <LeyendaMapa />
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-900/50 border border-fonarte-border space-y-1.5">
                <EtiquetaNota>
                  <span className="text-slate-300 font-semibold">Representación estilizada.</span>{' '}
                  El mapa dibuja un conjunto curado de mercados relevantes con formas
                  simplificadas: no es cartografía precisa ni pretende serlo. Sirve para leer de un
                  vistazo dónde se concentra la audiencia.
                </EtiquetaNota>
                <EtiquetaNota>
                  El desglose autoritativo de <span className="text-slate-300">todos</span> los
                  países es el ranking que aparece más abajo.
                  {paisesSinForma > 0 && (
                    <>
                      {' '}
                      {paisesSinForma === 1
                        ? 'Hay 1 país con audiencia que no está dibujado en el mapa y que sí aparece en el ranking.'
                        : `Hay ${paisesSinForma} países con audiencia que no están dibujados en el mapa y que sí aparecen en el ranking.`}
                    </>
                  )}
                </EtiquetaNota>
              </div>
            </Panel>

            {/* Detalle del país */}
            <div className="space-y-6">
              {detalle ? (
                <DetallePais
                  codigo={detalle.forma.codigos[0]}
                  nombre={nombrePais(detalle.forma.codigos[0])}
                  streams={detalle.streams}
                  porcentaje={detalle.porcentaje}
                  ranking={detalle.ranking}
                  totalPaises={paises.length}
                  esSeleccion={esSeleccion}
                />
              ) : (
                <div className="rounded-2xl border border-fonarte-border bg-fonarte-card/60 p-5 h-full flex items-center justify-center text-center">
                  <p className="text-xs text-fonarte-textMuted leading-relaxed max-w-[16rem]">
                    Pasa el cursor sobre un país del mapa —o haz clic en él— para ver aquí su
                    nombre, sus reproducciones y su participación.
                  </p>
                </div>
              )}

              {formaSeleccionada && (
                <Panel
                  titulo={`Plataformas en ${nombrePais(formaSeleccionada.codigos[0])}`}
                  descripcion="Reproducciones de este país repartidas por plataforma."
                >
                  <DesglosePlataformas
                    paisCodigo={codigoParaFiltro(formaSeleccionada)}
                    paisNombre={nombrePais(formaSeleccionada.codigos[0])}
                  />
                </Panel>
              )}
            </div>
          </div>

          {/* Ranking de países */}
          <Panel
            titulo="Ranking de países"
            descripcion="Todos los países con audiencia, ordenados por reproducciones. Es el desglose autoritativo, incluidos los países que no están dibujados en el mapa."
            acciones={
              <div className="flex items-center gap-3">
                <div className="relative">
                  <svg
                    className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar país…"
                    className="pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-fonarte-border text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-fonarte-primary focus:ring-2 focus:ring-fonarte-primary/20 transition w-44"
                  />
                </div>
                <span className="text-[11px] text-fonarte-textMuted tabular-nums whitespace-nowrap">
                  Mostrando {rankingFiltrado.length} de {paises.length}
                </span>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-fonarte-border">
                  <tr>
                    <th className="pb-3 px-3 w-12">#</th>
                    <th className="pb-3 px-3">País</th>
                    <th className="pb-3 px-3 text-right">Reproducciones</th>
                    <th className="pb-3 px-3 text-right">Participación</th>
                    <th className="pb-3 px-3 hidden md:table-cell w-40">Relación con el líder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rankingFiltrado.map((p) => {
                    const codigo = p.codigoPais.toUpperCase().trim();
                    const bandera = banderaPais(codigo);
                    const puesto = puestoDe.get(codigo) ?? null;
                    const forma = FORMA_POR_CODIGO.get(codigo);
                    return (
                      <tr
                        key={p.codigoPais}
                        onMouseEnter={() => forma && setPaisHover(forma.id)}
                        onMouseLeave={() => setPaisHover(null)}
                        className={`transition-colors ${
                          forma?.id === paisSeleccionado
                            ? 'bg-fonarte-primary/10'
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="py-3 px-3 text-fonarte-textMuted tabular-nums">
                          {puesto}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {bandera ? (
                              <span className="text-base leading-none" aria-hidden="true">
                                {bandera}
                              </span>
                            ) : (
                              <span
                                className="w-5 h-5 rounded bg-slate-800/80 border border-fonarte-border flex items-center justify-center text-[9px] font-bold text-slate-500"
                                aria-hidden="true"
                              >
                                {codigo.slice(0, 2)}
                              </span>
                            )}
                            <div className="min-w-0">
                              <span className="text-slate-200 font-medium block truncate">
                                {nombrePais(codigo)}
                              </span>
                              <span className="text-[10px] text-fonarte-textMuted font-mono">
                                {codigo}
                                {!forma && ' · fuera del mapa'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-200 tabular-nums whitespace-nowrap">
                          {formatearNumero(p.streams)}
                        </td>
                        <td className="py-3 px-3 text-right text-fonarte-secondary tabular-nums whitespace-nowrap">
                          {formatearPorcentaje(p.porcentaje)}
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell">
                          <BarraProporcion valor={p.streams} maximo={maximoPais} />
                        </td>
                      </tr>
                    );
                  })}

                  {rankingFiltrado.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center">
                        <p className="text-xs text-fonarte-textMuted">
                          Ningún país coincide con «{busqueda.trim()}». Borra la búsqueda para ver el
                          ranking completo.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}

      {/* Nota final: solo conteos */}
      <p className="text-[11px] text-fonarte-textMuted text-center leading-relaxed">
        Todas las cifras de esta vista son conteos de reproducciones (escuchas) agrupadas por país.
        Este portal no muestra importes, regalías ni información de pagos.
      </p>
    </div>
  );
}

// ============================================================================
// Mapa SVG
// ============================================================================

function MapaMundial({
  codigosSinForma,
  datosDeForma,
  paisHover,
  paisSeleccionado,
  onHover,
  onSeleccionar,
  interactivo,
}: {
  codigosSinForma: Set<string>;
  datosDeForma: (forma: FormaPais) => DatosMapa | null;
  paisHover: string | null;
  paisSeleccionado: string | null;
  onHover: (id: string | null) => void;
  onSeleccionar: (forma: FormaPais) => void;
  interactivo: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1000 500"
      className="w-full h-auto select-none"
      role="img"
      aria-label="Mapa mundial estilizado con la intensidad de reproducciones por país"
    >
      {/* Océano */}
      <rect x="0" y="0" width="1000" height="500" fill="#0b1220" />

      {/* Retícula de referencia */}
      <g stroke="#94a3b8" strokeWidth="0.5" opacity="0.12">
        {[100, 200, 300, 400].map((y) => (
          <line key={`h-${y}`} x1="0" y1={y} x2="1000" y2={y} />
        ))}
        {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
          <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="500" />
        ))}
      </g>

      {/* Masa continental de contexto (sin datos asociados) */}
      <g>
        {FORMAS_CONTEXTO.map((forma) => (
          <path
            key={forma.id}
            d={`M${forma.puntos} Z`}
            fill="#131b2c"
            stroke="#1e293b"
            strokeWidth="0.8"
          />
        ))}
      </g>

      {/* Países */}
      <g>
        {FORMAS_MAPA.map((forma) => {
          const datos = datosDeForma(forma);
          const tieneDatos = datos != null && datos.streams > 0;
          const porcentaje = tieneDatos ? datos.porcentaje : 0;
          const seleccionado = paisSeleccionado === forma.id;
          const hover = paisHover === forma.id;

          const nombre = nombrePais(forma.codigos[0]);
          const etiqueta = tieneDatos
            ? `${nombre}: ${formatearNumero(datos.streams)} reproducciones (${formatearPorcentaje(
                porcentaje,
              )})`
            : `${nombre}: sin datos`;

          const relleno = tieneDatos ? rellenoPorPorcentaje(porcentaje) : RELLENO_SIN_DATOS;
          const stroke = seleccionado ? '#ffffff' : hover ? '#38bdf8' : '#0f172a';
          const strokeWidth = seleccionado ? 2 : hover ? 1.6 : 0.8;

          return (
            <path
              key={forma.id}
              d={`M${forma.puntos} Z`}
              fill={relleno}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              tabIndex={interactivo ? 0 : -1}
              aria-label={etiqueta}
              onMouseEnter={() => onHover(forma.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(forma.id)}
              onBlur={() => onHover(null)}
              onClick={() => onSeleccionar(forma)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSeleccionar(forma);
                }
              }}
              className={`transition-[fill,opacity] duration-200 ${
                tieneDatos
                  ? 'cursor-pointer hover:opacity-90 focus:opacity-90'
                  : 'cursor-pointer opacity-70 hover:opacity-95 focus:opacity-95'
              }`}
            >
              <title>{etiqueta}</title>
            </path>
          );
        })}
      </g>

      {/* Países con datos pero sin forma dibujada: aviso textual, no se pierden */}
      {codigosSinForma.size > 0 && (
        <text x="16" y="488" fill="#64748b" fontSize="13">
          Hay países con audiencia que no están dibujados en el mapa: consulta el ranking completo
          abajo.
        </text>
      )}
    </svg>
  );
}
