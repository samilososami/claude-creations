# Lambda OS · vídeos

Los vídeos de [LambdaOS](https://github.com/samilososami/lambdaos), el sistema operativo de pentesting para el Samsung Galaxy S10, reunidos en un solo proyecto: nueve piezas nuevas en motion graphics y las dos promos que ya estaban publicadas.

**En vivo:** https://www.samilososami.com/claude/lambdaos/

| # | Vídeo | Formato | Duración | Archivo |
|---|-------|---------|----------|---------|
| 01 | Qué es LambdaOS, con voz en inglés y subtítulos | 9:16 · 1080 × 1920 · 30 fps | 1:05 | [`lambdaos-explainer.mp4`](videos/lambdaos-explainer.mp4) |
| 02 | Animación de arranque | S10 19:9 · 1080 × 2280 · 60 fps | 0:12 | [`lambdaos-boot-animation.mp4`](videos/lambdaos-boot-animation.mp4) · [`bootanimation.zip`](downloads/bootanimation.zip) |
| 03 | Modo LEX: del móvil al escritorio | 16:9 · 1920 × 1080 · 30 fps | 0:36 | [`lambdaos-lex-mode.mp4`](videos/lambdaos-lex-mode.mp4) |
| 03b | Modo LEX en vertical, para TikTok y Reels | 9:16 · 1080 × 1920 · 30 fps | 0:36 | [`lambdaos-lex-mode-vertical.mp4`](videos/lambdaos-lex-mode-vertical.mp4) |
| 04 | Lamb, el asistente | 9:16 · 1080 × 1920 · 30 fps | 0:33 | [`lambdaos-lamb.mp4`](videos/lambdaos-lamb.mp4) |
| 05 | Operator: un toque | 9:16 · 1080 × 1920 · 30 fps | 0:22 | [`lambdaos-operator.mp4`](videos/lambdaos-operator.mp4) |
| 06 | Estados de Lamb (bucle) | 1:1 · 1080 × 1080 · 30 fps | 0:08 | [`lambdaos-lamb-states.mp4`](videos/lambdaos-lamb-states.mp4) |
| 07 | Sting del logo | 16:9 · 1920 × 1080 · 60 fps | 0:05 | [`lambdaos-logo-sting.mp4`](videos/lambdaos-logo-sting.mp4) |
| 08 | Sting del logo, cuadrado | 1:1 · 1080 × 1080 · 60 fps | 0:05 | [`lambdaos-logo-sting-square.mp4`](videos/lambdaos-logo-sting-square.mp4) |
| 09 | Fondo animado (bucle, sin audio) | S10 19:9 · 1080 × 2280 · 30 fps | 0:12 | [`lambdaos-live-wallpaper.mp4`](videos/lambdaos-live-wallpaper.mp4) |
| 10 | Trailer (anterior) | 9:16 · 1080 × 1920 · 60 fps | 0:46 | [`lambdaos-trailer.mp4`](videos/lambdaos-trailer.mp4) |
| 11 | Promo (anterior) | 9:16 · 1080 × 1920 · 30 fps | 0:44 | [`lambdaos-promo.mp4`](videos/lambdaos-promo.mp4) |

Las antiguas direcciones `/claude/lambdaospromo/` y `/claude/lambdaos-trailer/` redirigen aquí y abren su vídeo.

## Vídeos nuevos (01–09)

| Dato | Valor |
|------|-------|
| Modelo | Claude Opus 5.5 (modelo de la sesión) |
| Fecha | Nov 2026 |
| Tiempo | ≈ 1 h 15 min de reloj (incluye renders y revisiones) |
| Tokens | No medidos |

- Hechos con [Remotion](https://www.remotion.dev) y sus skills oficiales. El código está en [`video-source/lambdaos`](../../video-source/lambdaos).
- Voz: ElevenLabs, «Joe - Cool Presenter», en inglés. Música: ElevenLabs Music. Efectos y sonido de marca: sintetizados en Python.
- Revisión: fotogramas de cada vídeo, espectrogramas y reparto por bandas, loudness EBU R128 (−14 LUFS, true peak ≤ −1 dBTP en el mp4 final) y transcripción de la voz sobre el archivo final.
- Lo que aún no existe en LambdaOS (LEX, módulos más allá de Wi-Fi, Lamb funcionando) aparece como concepto y lo indica en pantalla.

El prompt literal está en el botón **i** de la página y en [`prompts/`](prompts).

## Vídeos anteriores (10–11)

Movidos desde `projects/lambdaos-trailer` y `projects/lambdaospromo`. Sus prompts están en [`prompts/`](prompts).

- **Trailer:** Claude Opus 5.5. Render final de 26,6 min; el resto de la sesión no se midió. Narración de ElevenLabs (voz Revenant), música y efectos sintetizados, S10 en 3D con geometría propia.
- **Promo:** modelo no indicado en el registro. ≈ 23 min de reloj. Narración y música de ElevenLabs (voz Kai), efectos sintetizados.

## Estado de LambdaOS

Código abierto y en alpha. Arranca en el S10 de referencia (SM-G973F) con Android 15 y LineageOS 22.2, pero no hay ROM pública todavía. Pensado para pruebas autorizadas.

## Créditos

- Wordmark, λ, fondos de pantalla, capturas y Lamb: assets de LambdaOS (diseño propio).
- Tipografías: Montserrat, Inter y JetBrains Mono (SIL Open Font License). Iconos: Lucide (ISC).
- El Galaxy S10 está dibujado en código a partir de sus medidas; no es el modelo oficial de Samsung. LambdaOS no está afiliado a Samsung ni a LineageOS.
