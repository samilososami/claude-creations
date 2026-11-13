# Sony WH-1000XM6

Página no oficial sobre los Sony WH-1000XM6. El scroll empieza con ruido en la onda del héroe y termina en silencio: a medida que bajas, la onda se cancela, el contador baja de 72 a 9 dB y el resto de la página cambia al ritmo del desplazamiento.

**Ver: [sony-wh-1000xm6-qn2ww0.v2.appdeploy.ai](https://sony-wh-1000xm6-qn2ww0.v2.appdeploy.ai/)** (alojada en AppDeploy)

## Cómo se hizo

| | |
|---|---|
| Modelo | Claude, en Claude Code (sesión remota) |
| Alojamiento | AppDeploy, plantilla `html-static` |
| Código | Un solo `index.html`, sin framework. GSAP y ScrollTrigger por CDN |
| Revisión | Pruebas con Playwright en escritorio (1440 px) y móvil (390 px): carga, errores de consola, galería, ventana de foto, desbordes horizontales |

## El prompt

> creame una página web llamativa, que muestre los cascos sony xm6. añade imagenes publicas y tal y todo eso. lo que tu veas. que hable de las funciones y de todas las caracteristicas. que muestre tambien ejemplos de imagenes de todo tipo. añade por ejemplo una galeria que muestre imagenes, igual lo puedes hacer estilo mosaico. que sea una experiencia visual de página web, que conforme el usuario scrollea se sienta increible. que se vaya adaptando y modificando la web conforme el usuario baja o sube. el estilo de diseño decidelo tu, en función de lo que veas que pega. preparala, y cuando la tengas, la hosteas en appdeploy

## Qué hay en la página

- **Héroe**: el recorte del producto sobre una onda de ruido que se cancela con el scroll, con un contador de ruido ambiente (simulado).
- **Cifras**: 12 micrófonos, procesador QN3 7 veces más rápido que el QN1 del XM5, 30 h con cancelación, 254 g.
- **Funciones**: seis bloques (cancelación adaptativa, llamadas, modo ambiente y Speak-to-Chat, sonido con LDAC y DSEE Extreme, multipunto y Bluetooth 5.3, batería). Cada uno cambia la visual del panel fijo al pasar.
- **Galería**: 18 fotos con licencia abierta en mosaico. Las columnas se desplazan a distinta velocidad y las fotos se inclinan según la velocidad del scroll. Al pulsar una se abre a tamaño grande con su crédito.
- **Ficha técnica**: datos de la ficha oficial de Sony (EE. UU.).
- **Precio**: 379,99 USD según la web de Sony EE. UU. consultada el 12 de noviembre de 2026 (PVP 459,99 USD). Enlace a la ficha oficial.

## Créditos de las imágenes

**Producto:** © Sony Electronics. Tres fotos de su web (recorte de tres cuartos, perfil y una persona con los cascos al cuello), usadas solo para presentar el producto. No tienen licencia abierta; si Sony lo pide, se retiran. Se enlazan desde su CDN y no se copian al repo.

**Galería** (Wikimedia Commons):

| Foto en la web | Autor | Licencia |
|---|---|---|
| [Chica con cascos](https://commons.wikimedia.org/wiki/File:Beautiful_girl_listening_to_music_with_headphones.jpg) | Lars Frantzen | CC BY-SA 4.0 |
| [Luz de neón](https://commons.wikimedia.org/wiki/File:Woman_listening_to_music_with_wireless_headphones_neon_light_(50810419882).jpg) | Vu Hoang | CC BY 2.0 |
| [Gimnasio](https://commons.wikimedia.org/wiki/File:Young_handsome_girl_listening_to_music_at_the_gym,_headphones_closeup.jpg) | Nenad Stojkovic | CC BY 2.0 |
| [Aguja y surco](https://commons.wikimedia.org/wiki/File:Groove_and_needle_in_close_embrace_from_beginning_to_end.jpg) | Franz van Duns | CC BY-SA 4.0 |
| [El vinilo gira](https://commons.wikimedia.org/wiki/File:Das_Vinyl_dreht_sich.jpg) | Sulamith Sallmann | CC BY-SA 4.0 |
| [Tocadiscos Technics](https://commons.wikimedia.org/wiki/File:Kazantip,_Popovka,_Crimea,_Technics_turntable,_Vinyl_turntable.jpg) | Vyacheslav Argenberg | CC BY 4.0 |
| [Micrófono Shure SM7](https://commons.wikimedia.org/wiki/File:Shure_SM7.jpg) | The Midnite Wolf | CC0 |
| [Neumann U87](https://commons.wikimedia.org/wiki/File:Neumann_U87_Condenser_Microphone_-_Studio_A,_In_Your_Ear_Studios.jpg) | Will Fisher | CC BY-SA 2.0 |
| [Público en concierto](https://commons.wikimedia.org/wiki/File:Concert_crowd_(Unsplash).jpg) | Hannah Rodrigo | CC0 |
| [Concierto de Noam Rotem](https://commons.wikimedia.org/wiki/File:Crowd_at_Noam_Rotem_concert.jpg) | Asaf antman | CC BY 2.0 |
| [Nubes desde el avión](https://commons.wikimedia.org/wiki/File:Clouds_from_Airplane_window.jpg) | JaneDubrov | CC BY-SA 4.0 |
| [Música en el móvil](https://commons.wikimedia.org/wiki/File:Woman_listening_music_on_her_smartphone_(50810304846).jpg) | Vu Hoang | CC BY 2.0 |
| [Lluvia sobre un cristal](https://commons.wikimedia.org/wiki/File:Rain_on_a_window_pane.jpg) | Theactivistuk | CC BY-SA 4.0 |
| [Lluvia en el coche](https://commons.wikimedia.org/wiki/File:Rain_on_the_car_window,_Lianjiang.jpg) | Winzekter986 | CC BY-SA 4.0 |
| [Lago de montaña](https://commons.wikimedia.org/wiki/File:Mountain_Lake_Virginia_lakeview.jpg) | Rolfmueller | CC BY-SA 3.0 |
| [Pista de running](https://commons.wikimedia.org/wiki/File:L%C3%A1gym%C3%A1nyos_Bay_Park_running_track_20170627_193533.jpg) | Vauia Rex | CC0 |
| [Baile de 1920](https://commons.wikimedia.org/wiki/File:Club_holds_radio_dance_wearing_earphones_1920.jpg) | autor desconocido | dominio público |
| [WH-CH510](https://commons.wikimedia.org/wiki/File:Sony_WH-CH510_Bluetooth_Over-Ear_Headphone.jpg) | RPSkokie | CC BY-SA 4.0 |

## Notas

- Las animaciones de la sección de funciones y el contador de dB son ilustrativos. Muestran la idea de cada función, no una medición del aparato.
- El precio cambia. Consulta la web de Sony antes de comprar.
- Página no oficial, sin relación con Sony.
