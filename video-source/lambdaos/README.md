# LambdaOS · código de los vídeos

Proyecto de [Remotion](https://www.remotion.dev) (React) con el que se han hecho los vídeos de [`projects/lambdaos`](../../projects/lambdaos). Todo lo visual está programado: el S10, las pantallas de LambdaOS, Lamb, el escritorio de LEX y los gráficos. El sonido también, salvo la voz y la música de ElevenLabs.

## Composiciones

| Id | Vídeo | Formato | Duración |
|----|-------|---------|----------|
| `Explainer` | Qué es LambdaOS, con voz en inglés y subtítulos | 1080 × 1920 · 30 fps | 65 s |
| `Boot` | Animación de arranque (intro + bucle ×2 + salida) | 1440 × 3040 · 60 fps, exportada a 1080 × 2280 | 12 s |
| `BootZip` | La misma animación con un solo bucle, para el `bootanimation.zip` | 1440 × 3040 · 60 fps → 30 fps | 10 s |
| `Lex` | Modo LEX: del móvil vertical al escritorio en un monitor | 1920 × 1080 · 30 fps | 36,5 s |
| `LexExplainer` | Modo LEX explicado, con voz: escritorio y conexión por cable, inalámbrica y web | 1080 × 1920 · 30 fps | 40,7 s |
| `LambExplainer` | Lamb explicado, con voz: modelo local y abliterated, ventajas y modo agente | 1080 × 1920 · 30 fps | 47,6 s |
| `OperatorExplainer` | Operator explicado, con voz: centro de control, pestañas, catálogos y recibos | 1080 × 1920 · 30 fps | 41,1 s |
| `LambStates` | Estados de Lamb, en bucle | 1080 × 1080 · 30 fps | 8 s |
| `Sting` / `StingSquare` | Sting del logo | 1920 × 1080 y 1080 × 1080 · 60 fps | 5 s |
| `LiveWallpaper` | Fondo animado en bucle | 1080 × 2280 · 30 fps | 12 s |

## Estructura

```
src/
  brand/        λ (del icono de LambdaOS) y wordmark vectorizado letra a letra
  lamb/         Lamb vectorizado por piezas (lana, ojos, pupilas, nariz, boca)
  device/       Galaxy S10 dibujado con sus proporciones, con grosor en 3D
  ui/           Pantallas de LambdaOS (Operator, bloqueo), tipografía cinética, subtítulos
  explainer/ boot/ lex/ lambvid/ sting/ wallpaper/   un vídeo por carpeta
  social/       LEX, Lamb y Operator explicados: kit común (titulares, estado, outro) y un archivo por vídeo
scripts/
  trace_lamb.py, trace_wordmark.py   vectorizado con potrace a partir de los PNG del repo
  wallpaper_masks.py                 máscaras de luz para el fondo animado
  sfx.py                             síntesis de efectos (whooshes, impactos, UI, sonido de marca) y mastering
  mix_*.py                           mezcla de cada vídeo: música, voz, efectos, ducking y loudness
  edit_narration.py                  recorta y empalma sus voces (sin el cierre de estado; «and much more» en Operator)
  mix_social.py                      mezcla de LEX, Lamb y Operator explicados (lex | lamb | operator)
  words.py, fix_words.py             tiempos palabra a palabra (faster-whisper) y limpieza para los subtítulos
  render_queue.sh, mux_all.sh        render sin audio y unión con el audio masterizado
  make_bootzip.sh                    empaqueta el bootanimation.zip de Android
  qa.sh, bands.py, analyze_music.py  comprobaciones: loudness, true peak, espectrograma, hojas de contacto
audio-src/      voz y música de ElevenLabs (originales)
public/         tipografías, imágenes de LambdaOS, iconos, máscaras y audio masterizado
```

## Cómo se genera

```sh
npm install
python3 scripts/mix_explainer.py      # y el resto de mix_*.py → public/audio/*.wav
python3 scripts/edit_narration.py lex   # y lamb, operator
python3 scripts/mix_social.py lex       # y lamb, operator
scripts/render_queue.sh lexv lamb operator lex boot sting stingsq wallpaper lambstates
npx remotion render Explainer out/explainer-silent.mp4 --muted
scripts/mux_all.sh                    # final/*.mp4
scripts/make_bootzip.sh               # final/bootanimation.zip
scripts/qa.sh final/lambdaos-explainer.mp4
```

Requisitos: Node 22, Python 3 con `numpy`, `scipy`, `pyloudnorm` y `faster-whisper`, `ffmpeg` y `potrace`.

## Audio

- Voz: ElevenLabs `eleven_v4`, voz «Joe - Cool Presenter», en inglés, una toma por vídeo (explicación, LEX, Lamb y Operator). En LEX, Lamb y Operator se quitó después la frase de estado del final, y en Operator se empalmó «And much more, still in development.», generada en el contexto de la misma frase para que encaje en tono (139–140 Hz) y ajustada al volumen del original. Se transcribe con faster-whisper para sincronizar escenas y subtítulos palabra a palabra, y se vuelve a transcribir sobre el mp4 final para comprobar que se entiende con la música.
- Música: ElevenLabs Music v2.5, una pista por vídeo con voz y otra para el LEX horizontal.
- Efectos: sintetizados en `scripts/sfx.py`, colocados al fotograma. En LEX, Lamb y Operator van por debajo de la voz: ticks, whooshes suaves y confirmaciones, sin impactos.
- Mastering: filtro paso alto a 28 Hz, limitador con sobremuestreo ×4 y `loudnorm` en dos pasadas. Objetivo −14 LUFS (−15,6 la animación de arranque) y true peak ≤ −1 dBTP medido en el mp4 final.

## bootanimation.zip

Formato de Android, 1440 × 3040 a 30 fps, igual que `TARGET_SCREEN_WIDTH/HEIGHT` del build de LambdaOS:

```
1440 3040 30
c 1 0 part0   intro, se reproduce una vez
c 0 0 part1   bucle de 2 s mientras Android arranca
c 1 0 part2   salida cuando termina el arranque
```

`part0` y `part2` llevan `audio.wav`. El bucle no lleva audio para que se repita sin cortes. No se ha probado en el teléfono: antes de meterlo en `vendor/lambda/prebuilt/` conviene probarlo con `adb push` en `/data/local/bootanimation.zip` o en un build de prueba.

## Licencias y créditos

- Montserrat, Inter y JetBrains Mono: SIL Open Font License. Iconos: [Lucide](https://lucide.dev) (ISC).
- Wordmark, λ, fondos de pantalla, capturas y Lamb: assets de [LambdaOS](https://github.com/samilososami/lambdaos) (diseño propio).
- Remotion es gratuito para particulares y equipos de hasta 3 personas.
