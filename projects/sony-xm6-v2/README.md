# Sony WH-1000XM6 · Apaga el mundo

Segunda versión de la página sobre los Sony WH-1000XM6, hecha desde cero y con otra dirección visual: la página cambia de color con el scroll (hueso, tinta, azul eléctrico, lima) y el casco es siempre el protagonista.

**Ver: [sony-wh-1000xm6-apaga-el-mundo-vz2lyn.v2.appdeploy.ai](https://sony-wh-1000xm6-apaga-el-mundo-vz2lyn.v2.appdeploy.ai/)** (alojada en AppDeploy)

## Cómo se hizo

| | |
|---|---|
| Alojamiento | AppDeploy, plantilla `html-static` |
| Código | Un solo `index.html`, sin framework ni librerías por CDN. Solo Google Fonts (Bricolage Grotesque y DM Mono) |
| Revisión | Playwright en escritorio (1440 px) y móvil (390 px): carga, errores de consola, imágenes rotas, desbordes horizontales y las interacciones (color, simulación de cancelación, ecualizador, batería, filtros y ventana de foto) |

## El prompt

> creame una página web llamativa, que muestre los cascos sony xm6. añade imagenes publicas y tal y todo eso. lo que tu veas. que hable de las funciones y de todas las caracteristicas. que muestre tambien ejemplos de imagenes de todo tipo. añade por ejemplo una galeria que muestre imagenes, igual lo puedes hacer estilo mosaico. que sea una experiencia visual de página web, que conforme el usuario scrollea se sienta increible. que se vaya adaptando y modificando la web conforme el usuario baja o sube. el estilo de diseño decidelo tu, en función de lo que veas que pega. preparala, y cuando la tengas, la hosteas en appdeploy

## Qué hay en la página

- **Héroe**: "XM6" gigante con el casco delante de un disco azul, que sigue al ratón. Detrás, líneas de ruido que se calman al bajar.
- **Silencio** (recorrido fijo en pantalla): cuatro pasos, de "hay ruido" a "silencio". El casco se mueve y se señalan sus partes. El fondo pasa de hueso a tinta y las líneas de ruido se aplanan.
- **Pruébalo**: simulación de cancelación de ruido con onda contraria, nivel de ruido ajustable y sonido opcional (ruido marrón a volumen bajo).
- **Sonido**: foto de prensa, tarjetas (30 mm, LDAC, DSEE Extreme) y un ecualizador de 10 bandas que se arrastra y tiene presets.
- **Llamadas**: animación de beamforming (ilustrativa).
- **Un día con los XM6**: cinco escenas con foto a pantalla completa que cambian con el scroll.
- **Diseño**: tira horizontal que avanza con el scroll vertical.
- **Batería**: anillo de 30 h / 40 h y carga rápida.
- **Color**: cuatro colores. Al elegir uno cambia el casco de toda la página.
- **Galería**: mosaico de 18 fotos con filtros y ventana de foto con teclado.
- **Ficha técnica** y enlace a la ficha oficial.

## Créditos de las imágenes

- **Producto:** © Sony. Fotos de su nota de prensa y de su web, enlazadas desde sus servidores solo para presentar el producto. No tienen licencia abierta; si Sony lo pide, se retiran.
- **Galería:** fotos de [Unsplash](https://unsplash.com), enlazadas desde su CDN.

## Notas

- Las simulaciones (cancelación, ecualizador, llamadas, nivel de cancelación por escena) son ilustrativas, no mediciones.
- Los datos técnicos salen de la nota de prensa de Sony Europa (15 de mayo de 2025) y de la ficha técnica de Sony Australia. El precio (450 €) es el de lanzamiento en Europa y puede haber cambiado.
- Los colores disponibles dependen de la región.
- Página no oficial, sin relación con Sony.
