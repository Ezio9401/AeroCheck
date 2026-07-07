# AeroCheck

Checklist de campo para la **inspección del estado de las ayudas visuales de plataformas aeronáuticas** (balizaje, alimentación y Sistema de Mando y Presentación). Pensada para usarse desde el móvil durante la inspección, con captura de fotos, exportación a PDF/CSV y funcionamiento offline como PWA instalable.

Incluye los catálogos de varias bases (BHELEME-II, BHELA-I, BHELMA-IV y Coronel Maté), cada una con su propio conjunto de elementos según su formulario de inspección.

## Funcionalidad

- **Pantalla de configuración**: base, tipo de intervención, técnico ejecutor y fecha. Lista todas las **inspecciones pendientes** guardadas en el dispositivo para reanudarlas o eliminarlas, e importar una inspección desde un archivo de copia de seguridad.
- **Catálogo por subsistemas** (acordeón): Subsistema de balizaje de plataforma, Subsistema de alimentación, Subsistema de Sistema de Mando y Presentación (SMP). Cada subsistema muestra los parámetros a verificar.
- **Añadir baliza**: selector en dos pasos (tipo de elemento → número de unidad concreta) mediante una hoja inferior ("bottom sheet").
- **Por cada unidad registrada**:
  - Estado: Útil / Útil condicional / Reparable / Inútil.
  - Tipo de trabajo: Correctiva / Preventiva.
  - Descripción de acciones / observaciones.
  - Foto de la incidencia: tomarla con la cámara o subirla desde la galería del móvil (se comprime antes de guardarse).
- **Exportación** (solo lo que el técnico ha registrado, que es lo que tiene incidencia):
  - **PDF**: por subsistema, lista únicamente las unidades con estado problemático (Útil condicional / Reparable / Inútil), con su tipo de trabajo, observaciones y las fotografías incrustadas. Los subsistemas sin incidencias se omiten. Si no hay ninguna incidencia, el PDF lo indica.
  - **CSV**: una fila por cada unidad añadida en el formulario (con UTF-8 BOM para que Excel muestre bien los acentos; las celdas que empezarían por `=`, `+`, `-` o `@` se neutralizan para evitar inyección de fórmulas).
  - **Copia de seguridad (JSON)**: exporta la inspección completa (metadatos + entradas + fotos) en un único archivo, para respaldarla, transferirla entre dispositivos o reabrirla más tarde.
- **Finalizar inspección**: cierra el registro actual y borra el borrador (fotos incluidas) para empezar una nueva inspección limpia; antes de borrar ofrece descargar la copia de seguridad JSON. "Finalizar más tarde" solo pausa, conservando el borrador.
- **Persistencia local**: los datos de la inspección (metadatos + estado de cada unidad) se guardan en `localStorage` como una **lista de borradores** (varias inspecciones pendientes en paralelo); las observaciones se autoguardan con _debounce_ mientras se escriben. Las fotografías se guardan aparte en **IndexedDB** (mucha más capacidad que `localStorage`, adecuado para binarios), con aviso cuando el almacenamiento se acerca a su límite.
- **PWA instalable**: manifest (con `id` estable y shortcut) + service worker que precachea el _app shell_ en la instalación y sirve las navegaciones _network-first_ con respaldo offline, para añadirla a la pantalla de inicio y seguir usándola sin conexión.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4 (solo para utilidades puntuales; el grueso de la UI usa una hoja de estilos propia en `src/app/globals.css` con el tema navy/ámbar)
- [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) para la generación del PDF
- IndexedDB nativo (sin librerías) para el almacenamiento de fotos
- Service worker escrito a mano (sin `next-pwa`/Serwist, que requiere webpack) para compatibilidad con Turbopack
- [Vitest](https://vitest.dev) para los tests de la lógica pura + GitHub Actions para CI

## Estructura del proyecto

```
src/
  app/
    layout.tsx          Metadata, iconos, viewport y registro del service worker
    manifest.ts          Web App Manifest (nombre, iconos, colores, display standalone)
    page.tsx              Orquesta el estado de la app (setup vs. catálogo, picker, fotos)
    globals.css           Tema visual completo (navy/ámbar), independiente de Tailwind
  components/
    SetupScreen.tsx        Pantalla inicial: datos de la inspección + reanudar borrador
    CatalogScreen.tsx       Pantalla principal: buscador, subsistemas, barra inferior de acciones
    SubsystemBlock.tsx      Acordeón de un subsistema + lista de unidades añadidas
    AddBalizaSheet.tsx      Hoja inferior para añadir una unidad (elige elemento → unidad)
    EntryCard.tsx            Tarjeta de una unidad: estado, tipo de trabajo, foto, observaciones
    Toast.tsx / icons.tsx / ServiceWorkerRegister.tsx
  lib/
    data.ts                Catálogo por subsistema y bases (getBase/findBase, totalUnits)
    types.ts                Tipos y definiciones de estado (StatusKey, Entry, InspectionState...)
    storage.ts              Persistencia de los borradores (lista de inspecciones) en localStorage
    photoDb.ts               Persistencia de fotos en IndexedDB (indexadas por entryId) + cuota
    image.ts                 Compresión de imágenes (canvas) y lectura de dimensiones
    report.ts                Lógica pura: disponibilidad de unidades y filas problemáticas del PDF
    csv.ts / pdf.ts           Generación de las exportaciones
    backup.ts                Exportar/importar la inspección completa (JSON con fotos)
    *.test.ts                Tests (Vitest) de la lógica pura: csv, report, storage, data
public/
  icons/                  Iconos de la PWA (192, 512, 512 maskable, apple-touch-icon)
  sw.js                    Service worker (precache del app shell + navegación network-first)
.github/workflows/ci.yml  CI: lint + typecheck + test + build en cada push/PR
```

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El service worker **no se registra en modo desarrollo** (a propósito, para no interferir con el hot-reload); solo se activa en build de producción.

Para probar el comportamiento de PWA real (instalación, offline) en local:

```bash
npm run build
npm run start
```

Otros scripts:

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest (tests de la lógica pura)
npm run build      # build de producción (Turbopack)
```

## Tests y CI

La lógica pura y crítica está cubierta con [Vitest](https://vitest.dev): construcción del CSV y neutralización de inyección de fórmulas (`csv.ts`), disponibilidad de unidades y derivación de filas del PDF (`report.ts`), migración y upsert de borradores (`storage.ts`) y la resolución de bases (`data.ts`). Los tests viven junto al código como `src/lib/*.test.ts`.

El workflow `.github/workflows/ci.yml` ejecuta en cada `push` y `pull_request`: `npm ci` → **lint → typecheck → test → build**, como red de seguridad contra regresiones en una herramienta que genera registros oficiales.

## Datos

El catálogo de elementos (`src/lib/data.ts`) reproduce la tabla del formulario original. Si se añaden más bases o subsistemas, hay que ampliar `BASES`/`CATALOG` en ese archivo — el resto de la app (catálogo, exportaciones, contadores) se adapta automáticamente porque todo se deriva de esa fuente única.

## Notas sobre almacenamiento

- Todo vive **solo en el dispositivo** (no hay backend ni sincronización). Si se borra el almacenamiento del navegador o se cambia de móvil sin exportar, se pierden los borradores.
- Se admiten **varias inspecciones pendientes a la vez**: cada una es un borrador independiente en la lista de la pantalla de inicio, que se puede reanudar o eliminar por separado.
- Al pulsar **Finalizar inspección** se borra el borrador y sus fotos; para conservar un registro restaurable (no solo el PDF/CSV) usa **Copia de seguridad (JSON)** o acepta la descarga que se ofrece al finalizar, y reimpórtalo cuando haga falta.
- Como salvaguarda frente a la pérdida del dispositivo, exporta periódicamente la copia de seguridad JSON de las inspecciones en curso.

## Despliegue

Configurado para Vercel (`vercel.json`). Basta con importar el repositorio en [vercel.com/new](https://vercel.com/new) — detecta Next.js automáticamente. Cada `git push` a `main` genera un nuevo despliegue.
