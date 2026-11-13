# Sony WH-1000XM6 · Apaga el mundo

Cuarta web de la comparación, hecha desde cero por Opus 5.5 sin mirar las otras. La idea: un plató de cine. La página arranca con estática de televisor y un titular que tiembla; al bajar, un giro real de 360° de los cascos avanza fotograma a fotograma bajo un foco, el ruido se apaga y el medidor de cancelación sube hasta el 100 %. Si vuelves a subir, el ruido regresa.

**Ver: [samilososami.com/claude/sonyxm6comparison/opus](https://www.samilososami.com/claude/sonyxm6comparison/opus/)**

## Cómo se hizo

| | |
|---|---|
| Modelo | Claude Opus 5.5 |
| Tiempo | Pendiente |
| Tokens | Pendiente |
| Alojamiento | samilososami.com (Vercel) y AppDeploy, plantilla `html-static`. En AppDeploy las imágenes se cargan desde samilososami.com |
| Código | Un solo `index.html`. GSAP con ScrollTrigger y Lenis por CDN. Google Fonts: Instrument Serif, Geist y Geist Mono |
| Revisión | Navegador en escritorio (1440 × 900) y móvil (375 × 812): consola sin errores, sin desborde horizontal, filtros y visor de la galería, panel **i**, selector de color y demo de audio |

## El prompt

> creame una página web llamativa, que muestre los cascos sony xm6. añade imagenes publicas y tal y todo eso. lo que tu veas. que hable de las funciones y de todas las caracteristicas. que muestre tambien ejemplos de imagenes de todo tipo. añade por ejemplo una galeria que muestre imagenes, igual lo puedes hacer estilo mosaico. que sea una experiencia visual de página web, que conforme el usuario scrollea se sienta increible. que se vaya adaptando y modificando la web conforme el usuario baja o sube. el estilo de diseño decidelo tu, en función de lo que veas que pega. preparala, y cuando la tengas, la hosteas en  appdeploy. hazla desde cero. no te dejes influenciar por webs similares que haya en el repo

## Qué hay en la página

- **Silencio** (fijo, 5,6 pantallas de scroll): los 19 fotogramas del giro 360° oficial de Sony, del estuche abierto a la vuelta completa, dibujados en un canvas con fundido entre fotogramas y un foco que se apaga en negro. Encima, estática de televisor, un titular con las letras temblando y aberración cromática, cuatro textos que entran y salen y un medidor de Noise Cancelling. Todo depende de la posición del scroll, así que subir devuelve el ruido.
- **En cifras**: seis contadores (12 micrófonos, 7×, 30 h, 3 min, 990 kbps, 10 bandas) con «silencio» escrito en ocho idiomas deslizándose detrás en el sentido del scroll.
- **Escucha la diferencia**: una ciudad sintetizada con Web Audio (tráfico, murmullo, siseo, motores que cruzan de un oído a otro y algún claxon) con una melodía encima. Los modos Desactivado, Ambiente y Noise Cancelling filtran el ruido y un visualizador circular lo enseña en directo. Es una simulación orientativa y lo dice.
- **Sonido**: los cuatro ingenieros de masterización y sus estudios, una cita de Randy Merrill y seis piezas técnicas (diafragma de fibra de carbono, filtro de ruido anticipado, LDAC, DSEE Extreme, 360 Reality Audio Upmix for Cinema y ecualizador de 10 bandas). El fondo pasa a marrón cálido.
- **Día a día**: rejilla con llamadas (anillos que convergen en tu voz), batería que se llena con el scroll, carga rápida, Multipoint, LE Audio y Auracast, carga mientras escuchas, escucha basada en escenas, controles, app y embalaje de papel.
- **Diseño**: la página se vuelve clara y una secuencia fija pliega los cascos en cinco pasos (de tres cuartos al estuche) mientras cambian los textos. Después, la bisagra, el estuche y los 254 g.
- **Colores**: seis pantallas fijas. Cada color tiñe el fondo, cambia la foto, el nombre gigante del fondo se desliza y los muestrarios permiten saltar a cualquiera. El color que eliges es el que aparece al final de la página.
- **Galería**: mosaico de 25 fotos con filtros (vida real, estudio, producto, detalles), entrada escalonada y visor con teclado, flechas y gesto de deslizar.
- **Ficha técnica** y **final** con el precio de lanzamiento en España y un botón que vuelve arriba, al ruido.

## Imágenes

Todas son material público de Sony salvo una, y se usan con fines ilustrativos en una web no oficial.

- **Sony Europe**, web de producto de sony.es: giro 360° (`spin-01` a `spin-19`), colores (`tone-*`), plegado (`fold-*`) y casi toda la galería (`g-teal`, `g-green`, `g-studio-bw`, `g-stage`, `g-led`, `g-light`, `g-slats`, `g-olive-*`, `g-case-black`, `g-case-silver`, `g-*-front`).
- **Sony Europe**, [sala de prensa](https://www.sony.es/presscentre/sony-presenta-la-nueva-generacion-de-la-cancelacion-de-ruido-con-los-wh-1000xm6): `g-artist`, `g-mastering`, `g-hinge`, `g-case-open`, `g-midnight`, `g-side`, `g-float`.
- **Sony Marketing Japón**, sony.jp: `g-family`.
- **Jaimy de Hon** en [Unsplash](https://unsplash.com/photos/tDVdy6ku378) (licencia Unsplash): `g-desk`.

Las imágenes se recortaron y se pasaron a WebP. El fondo blanco de la foto de Arenisca se quitó para poder ponerla sobre color.

## Fuentes de los datos

- [Nota de prensa de Sony España](https://www.sony.es/presscentre/sony-presenta-la-nueva-generacion-de-la-cancelacion-de-ruido-con-los-wh-1000xm6) (15 de mayo de 2025): QN3, 12 micrófonos, ingenieros, llamadas, diseño, LE Audio, carga, embalaje y precio de 470 €.
- [Especificaciones de Sony](https://www.sony.com/electronics/support/wireless-headphones-bluetooth-headphones/wh-1000xm6/specifications): peso, respuesta en frecuencia, impedancia, sensibilidad, baterías y códecs.
- [Página de producto de Sony Electronics](https://electronics.sony.com/audio/headphones/headband/p/wh1000xm6-b): los seis colores.
