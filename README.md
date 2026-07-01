# AeroCheck

Checklist de campo para la **inspección del estado de las ayudas visuales de plataformas aeronáuticas** (balizaje, alimentación y Sistema de Mando y Presentación). Pensada para usarse desde el móvil durante la inspección, con captura de fotos, exportación a PDF/CSV y funcionamiento offline como PWA instalable.

Basada en el formulario de inspección "Base BHELEME-II" (MEGA(S) — Sistema de ayudas visuales 6,6 A).

## Funcionalidad

- **Pantalla de configuración**: base, tipo de intervención, técnico ejecutor y fecha. Permite reanudar una inspección en curso guardada en el dispositivo.
- **Catálogo por subsistemas** (acordeón): Subsistema de balizaje de plataforma, Subsistema de alimentación, Subsistema de Sistema de Mando y Presentación (SMP). Cada subsistema muestra los parámetros a verificar.
- **Añadir baliza**: selector en dos pasos (tipo de elemento → número de unidad concreta) mediante una hoja inferior ("bottom sheet").
- **Por cada unidad registrada**:
  - Estado: Útil / Útil condicional / Reparable / Inútil.
  - Tipo de trabajo: Correctiva / Preventiva.
  - Descripción de acciones / observaciones.
  - Foto de la incidencia: tomarla con la cámara o subirla desde la galería del móvil (se comprime antes de guardarse).
- **Exportación**:
  - **PDF**: replica el formulario original, con todas las unidades de todos los elementos del catálogo (revisadas o no), estado, tipo de trabajo, observaciones y las fotografías incrustadas por subsistema.
  - **CSV**: mismo detalle en formato tabular, con un indicador de si la unidad tiene foto adjunta.
- **Finalizar inspección**: cierra el registro actual y borra el borrador (fotos incluidas) para empezar una nueva inspección limpia. "Finalizar más tarde" solo pausa, conservando el borrador.
- **Persistencia local**: los datos de la inspección (metadatos + estado de cada unidad) se guardan en `localStorage`; las fotografías se guardan aparte en **IndexedDB** (mucha más capacidad que `localStorage`, adecuado para binarios).
- **PWA instalable**: manifest + service worker con caché de la app para poder añadirla a la pantalla de inicio y seguir usándola sin conexión tras la primera carga.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4 (solo para utilidades puntuales; el grueso de la UI usa una hoja de estilos propia en `src/app/globals.css` con el tema navy/ámbar)
- [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) para la generación del PDF
- IndexedDB nativo (sin librerías) para el almacenamiento de fotos
- Service worker escrito a mano (sin `next-pwa`/Serwist) para compatibilidad con Turbopack

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
    data.ts                Catálogo de elementos por subsistema (fabricante, referencia, NOC, cantidad)
    types.ts                Tipos y definiciones de estado (StatusKey, Entry, InspectionState...)
    storage.ts              Persistencia de la inspección (metadatos + entradas) en localStorage
    photoDb.ts               Persistencia de fotos en IndexedDB, indexadas por entryId
    image.ts                 Compresión de imágenes (canvas) y lectura de dimensiones
    csv.ts / pdf.ts           Generación de las exportaciones
public/
  icons/                  Iconos de la PWA (192, 512, 512 maskable, apple-touch-icon)
  sw.js                    Service worker (cache-first con actualización en segundo plano)
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
npm run lint     # ESLint
npm run build    # build de producción (Turbopack)
```

## Datos

El catálogo de elementos (`src/lib/data.ts`) reproduce la tabla del formulario original. Si se añaden más bases o subsistemas, hay que ampliar `BASES`/`CATALOG` en ese archivo — el resto de la app (catálogo, exportaciones, contadores) se adapta automáticamente porque todo se deriva de esa fuente única.

## Notas sobre almacenamiento

- Todo vive **solo en el dispositivo** (no hay backend ni sincronización entre dispositivos). Si se borra el almacenamiento del navegador o se cambia de móvil, se pierde el borrador en curso.
- Al pulsar **Finalizar inspección** se borra el borrador y sus fotos; el PDF/CSV exportado es el único registro persistente de esa inspección.
- Solo se admite **una inspección en curso a la vez** (un único borrador).

## Despliegue

Configurado para Vercel (`vercel.json`). Basta con importar el repositorio en [vercel.com/new](https://vercel.com/new) — detecta Next.js automáticamente. Cada `git push` a `main` genera un nuevo despliegue.
