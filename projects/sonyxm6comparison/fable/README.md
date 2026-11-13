# Sony WH-1000XM6 · Del ruido al silencio

Tercera web de la comparación, hecha desde cero por Fable 5.2. La idea: la página se comporta como los cascos. Empieza siendo ruido (ondas, palabras, grano) y el scroll lo cancela hasta dejar una sola línea, que se abre en blanco y descubre el producto. A partir de ahí cada capítulo cambia de color y de mecánica.

**Ver: [sony-wh-1000xm6-del-ruido-al-silencio-fi5bx4.v2.appdeploy.ai](https://sony-wh-1000xm6-del-ruido-al-silencio-fi5bx4.v2.appdeploy.ai/)** (alojada en AppDeploy)

## Cómo se hizo

| | |
|---|---|
| Modelo | Claude Fable 5.2 |
| Tiempo | Alrededor de 1 h 15 min de trabajo activo. La sesión se pausó dos veces por límite de uso |
| Tokens | Sin medir |
| Alojamiento | AppDeploy, plantilla `html-static`. Las 40 imágenes van como recursos de la app |
| Código | Un solo `index.html`. GSAP con ScrollTrigger y Lenis por CDN. Google Fonts: Archivo (variable, con eje de anchura) y Geist Mono |
| Revisión | Playwright en escritorio (1440 y 1280 px) y móvil (390 y 375 px), en local y sobre la versión desplegada: errores de consola, imágenes rotas, desbordes horizontales y los flujos de color, visor de fotos, simulador de cancelación, ecualizador y menú de pistas |

## El prompt

> creame una página web llamativa, que muestre los cascos sony xm6. añade imagenes publicas y tal y todo eso. lo que tu veas. que hable de las funciones y de todas las caracteristicas. que muestre tambien ejemplos de imagenes de todo tipo. añade por ejemplo una galeria que muestre imagenes, igual lo puedes hacer estilo mosaico. que sea una experiencia visual de página web, que conforme el usuario scrollea se sienta increible. que se vaya adaptando y modificando la web conforme el usuario baja o sube. el estilo de diseño decidelo tu, en función de lo que veas que pega. preparala, y cuando la tengas, la hosteas en appdeploy

## Qué hay en la página

- **01 Ruido**: treinta líneas de onda, dieciséis fuentes de ruido y la palabra RUIDO con las letras temblando (fuente variable). Al bajar todo converge en una línea, la línea se ensancha hasta llenar la pantalla de blanco y aparece SILENCIO con los cascos delante.
- **02 Silencio**: manifiesto que se va encendiendo palabra a palabra y cuatro cifras (12 micrófonos, 7×, 30 h, 254 g).
- **03 Cancelación**: osciloscopio con ruido, antirruido y resultado, guiado por el scroll en tres pasos. Simulador con cuatro entornos, interruptor de cancelación y sonido opcional sintetizado en el navegador.
- **04 Sonido**: los ingenieros de masterización, el diafragma de 30 mm en despiece 3D hecho con CSS y un ecualizador de 10 bandas que se arrastra y tiene preajustes.
- **05 Diseño**: secuencia de plegado en cinco pasos, de frente hasta el estuche.
- **06 Colores**: los seis acabados. Cada uno tiñe la pantalla entera; Sandstone se muestra con su foto de campaña.
- **07 Un día**: seis momentos en una tira horizontal. El fondo pasa de la mañana a la noche mientras avanza.
- **08 Batería**: treinta celdas que se llenan y los datos de carga.
- **09 Galería**: mosaico de 21 fotos con visor a pantalla completa y teclado.
- **10 Ficha técnica**: especificaciones completas y qué cambia frente a los XM5.
- **Barra inferior**: funciona como un reproductor. Muestra la pista (sección) actual, el progreso y un menú para saltar. Las barritas reaccionan a la velocidad del scroll.

## Créditos de las imágenes

Todas las imágenes son © Sony Group Corporation. Salen del [Sony Europe Press Centre](https://www.sony.eu/presscentre/): los álbumes [WH-1000XM6 Images](https://www.sony.eu/presscentre/media/album/44224) y [WH-1000XM6 Sand Pink](https://www.sony.eu/presscentre/media/album/bba2b823-312b-4e09-a3b5-7313736ad69f), y las notas de prensa de los colores Sandstone y Olive Gray.

Es material de prensa, no tiene licencia abierta. Se usa solo para presentar el producto en una página personal sin fines comerciales; si Sony lo pide, se retira. Los recortes sin fondo (`img/c-*.webp` y `img/f-*.webp`) están generados a partir de esos mismos renders.

## Notas

- Los datos vienen de la [nota de prensa de Sony Europe](https://www.sony.eu/presscentre/sony-introduces-the-next-evolution-of-noise-cancelling-with-the-wh-1000xm6) (15 de mayo de 2025) y de las especificaciones oficiales de soporte.
- El osciloscopio, el medidor de ruido, el sonido del simulador y el ecualizador son ilustrativos, no mediciones.
- Página no oficial, sin relación con Sony.
