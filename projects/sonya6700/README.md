# Sony α6700

Un recorrido visual por la Sony α6700: diseño, sensor, enfoque con IA, vídeo y una galería de 36 fotos reales hechas con la cámara. Página no oficial, sin relación con Sony.

**Ver: [samilososami.com/claude/sonya6700](https://www.samilososami.com/claude/sonya6700/)**

## Cómo se hizo

| | |
|---|---|
| Modelo | Claude Fable 5.2, en Claude Code |
| Fecha | 10 de noviembre de 2026 |
| Tiempo | 21 min 34 s, del prompt a la web servida |
| Tokens | 114.758 de salida · 3,43 M procesados contando lecturas de caché |
| Intervención | Un prompt y una aclaración; no se revisó a ojo antes de publicar |
| Código | Un solo `index.html`, sin framework. GSAP, ScrollTrigger y Lenis por CDN |

## El prompt

> creame una página web llamativa, que muestre la sony a6700.
> añade imagenes publicas y tal y todo eso. lo que tu veas. que hable de las funciones y de todas las caracteristicas. que muestre tambien ejemplos de imagenes de todo tipo. añade por ejemplo una galeria que muestre imagenes, igual lo puedes hacer estilo mosaico.
> que sea una experiencia visual de página web, que conforme el usuario scrollea se sienta increible. que se vaya adaptando y modificando la web conforme el usuario baja o sube.
> el estilo de diseño decidelo tu, en función de lo que veas que pega.
> preparala, y cuando la tengas, la hosteas en local, puerto 80 si está disponible

## Créditos de las imágenes

Todas vienen de Wikimedia Commons. Las de muestra están hechas con una α6700 y los ajustes que se ven en la web son sus datos EXIF. `img/credits.json` guarda los mismos datos en formato máquina.

| Archivo | Original | Autor | Licencia |
|---|---|---|---|
| `cam-hero.jpg` | [Sony A6700 by Henry Söderlund.jpg](https://commons.wikimedia.org/wiki/File:Sony_A6700_by_Henry_S%C3%B6derlund.jpg) | Henry Söderlund | CC BY 2.0 |
| `cam-jb.jpg` | [Sony ILCE-6700 19 aug 2023b.jpg](https://commons.wikimedia.org/wiki/File:Sony_ILCE-6700_19_aug_2023b.jpg) | 昼落ち | CC BY-SA 4.0 |
| `cam-t16.jpg` | [Sony Alpha 6700 (DSC 7816).jpg](https://commons.wikimedia.org/wiki/File:Sony_Alpha_6700_(DSC_7816).jpg) | Tsungam | CC BY-SA 4.0 |
| `cam-t18.jpg` | [Sony Alpha 6700 (DSC 7818).jpg](https://commons.wikimedia.org/wiki/File:Sony_Alpha_6700_(DSC_7818).jpg) | Tsungam | CC BY-SA 4.0 |
| `cam-t23.jpg` | [Sony Alpha 6700 (DSC 7823).jpg](https://commons.wikimedia.org/wiki/File:Sony_Alpha_6700_(DSC_7823).jpg) | Tsungam | CC BY-SA 4.0 |
| `cam-t24.jpg` | [Sony Alpha 6700 (DSC 7824).jpg](https://commons.wikimedia.org/wiki/File:Sony_Alpha_6700_(DSC_7824).jpg) | Tsungam | CC BY-SA 4.0 |
| `g-acropolis.jpg` | [Athens Acropolis at Daybreak.jpg](https://commons.wikimedia.org/wiki/File:Athens_Acropolis_at_Daybreak.jpg) | Andrew Parlette | CC BY 4.0 |
| `g-alishan.jpg` | [20240917 - Alishan - 13 (54379634495).jpg](https://commons.wikimedia.org/wiki/File:20240917_-_Alishan_-_13_(54379634495).jpg) | eugene_o | CC BY 2.0 |
| `g-assisi.jpg` | [Terrace Dinner in Assisi.jpg](https://commons.wikimedia.org/wiki/File:Terrace_Dinner_in_Assisi.jpg) | Andrew Parlette | CC BY 4.0 |
| `g-athena.jpg` | [Across the Hill to Athena's Temple.jpg](https://commons.wikimedia.org/wiki/File:Across_the_Hill_to_Athena%27s_Temple.jpg) | Andrew Parlette | CC BY 4.0 |
| `g-basilica.jpg` | [Basilica of Saint Francis, Through the Arch.jpg](https://commons.wikimedia.org/wiki/File:Basilica_of_Saint_Francis,_Through_the_Arch.jpg) | Andrew Parlette | CC BY 4.0 |
| `g-bee.jpg` | [Biene im Anflug (53876324859).jpg](https://commons.wikimedia.org/wiki/File:Biene_im_Anflug_(53876324859).jpg) | Ralf Hüsges | CC BY 2.0 |
| `g-bridge.jpg` | [London Millennium Bridge underside 2024-01-11.jpg](https://commons.wikimedia.org/wiki/File:London_Millennium_Bridge_underside_2024-01-11.jpg) | Tom Page | CC BY-SA 2.0 |
| `g-butterfly.jpg` | [Admiral butterfly (53884298773).jpg](https://commons.wikimedia.org/wiki/File:Admiral_butterfly_(53884298773).jpg) | Ralf Hüsges | CC BY 2.0 |
| `g-campo.jpg` | [Piazza del Campo from Above.jpg](https://commons.wikimedia.org/wiki/File:Piazza_del_Campo_from_Above.jpg) | Andrew Parlette | CC BY 4.0 |
| `g-cat.jpg` | [Cat, Walthamstow Wetlands detail 2024-02-01.jpg](https://commons.wikimedia.org/wiki/File:Cat,_Walthamstow_Wetlands_detail_2024-02-01.jpg) | Tom Page | CC BY-SA 2.0 |
| `g-concert.jpg` | [Woody & the Woulds.jpg](https://commons.wikimedia.org/wiki/File:Woody_%26_the_Woulds.jpg) | Jax T. | CC BY-SA 4.0 |
| `g-dandelion.jpg` | [Pusteblume (53682323088).jpg](https://commons.wikimedia.org/wiki/File:Pusteblume_(53682323088).jpg) | Ralf Hüsges | CC BY 2.0 |
| `g-deer.jpg` | [Rehbock (53685214294).jpg](https://commons.wikimedia.org/wiki/File:Rehbock_(53685214294).jpg) | Ralf Hüsges | CC BY 2.0 |
| `g-dome.jpg` | [Dome interior - National Pantheon - Lisbon - Portugal.jpg](https://commons.wikimedia.org/wiki/File:Dome_interior_-_National_Pantheon_-_Lisbon_-_Portugal.jpg) | NorbertNagel | CC BY-SA 4.0 |
| `g-dragonfly.jpg` | [Keilfleck Mosaikjungfer (53745213939).jpg](https://commons.wikimedia.org/wiki/File:Keilfleck_Mosaikjungfer_(53745213939).jpg) | Ralf Hüsges | CC BY 2.0 |
| `g-festival.jpg` | [LescoStijntjesFestibal2023-20.jpg](https://commons.wikimedia.org/wiki/File:LescoStijntjesFestibal2023-20.jpg) | Yalte | CC BY-SA 4.0 |
| `g-foot2.jpg` | [J1League-Football-2026-2027---YokohamaFM-and-Kashima---2026-08-07 00200.jpg](https://commons.wikimedia.org/wiki/File:J1League-Football-2026-2027---YokohamaFM-and-Kashima---2026-08-07_00200.jpg) | RuinDig/Yuki Uchida | CC BY 4.0 |
| `g-forth.jpg` | [River Forth (Explored 07-03-24) - Flickr - jkiscycling.jpg](https://commons.wikimedia.org/wiki/File:River_Forth_(Explored_07-03-24)_-_Flickr_-_jkiscycling.jpg) | John Knight from Clackmannanshire, Scotland | CC BY 2.0 |
| `g-ghosts.jpg` | [Liverpool Street Elizabeth line bench ghosts 2024-03-10.jpg](https://commons.wikimedia.org/wiki/File:Liverpool_Street_Elizabeth_line_bench_ghosts_2024-03-10.jpg) | Tom Page | CC BY-SA 2.0 |
| `g-heron.jpg` | [Graureiher beim Fischfang (53747693933).jpg](https://commons.wikimedia.org/wiki/File:Graureiher_beim_Fischfang_(53747693933).jpg) | Ralf Hüsges | CC BY 2.0 |
| `g-ladybug.jpg` | [Marienkäfer (53702628639).jpg](https://commons.wikimedia.org/wiki/File:Marienk%C3%A4fer_(53702628639).jpg) | Ralf Hüsges | CC BY 2.0 |
| `g-lightning.jpg` | [Lightning over the Atlantic - Flickr - aparlette.jpg](https://commons.wikimedia.org/wiki/File:Lightning_over_the_Atlantic_-_Flickr_-_aparlette.jpg) | Andrew Parlette from Elkridge,MD, US | CC BY 4.0 |
| `g-lrt.jpg` | [RapidKL LRT Kelana Jaya Line Train Departing KL Sentral.jpg](https://commons.wikimedia.org/wiki/File:RapidKL_LRT_Kelana_Jaya_Line_Train_Departing_KL_Sentral.jpg) | Kaerumy | CC BY 4.0 |
| `g-minneapolis.jpg` | [Thank You for Today - Minneapolis Reflections - Flickr - aparlette.jpg](https://commons.wikimedia.org/wiki/File:Thank_You_for_Today_-_Minneapolis_Reflections_-_Flickr_-_aparlette.jpg) | Andrew Parlette from Elkridge,MD, US | CC BY 4.0 |
| `g-neon.jpg` | [Burritos and Tacos neon sign Camden High Street 2024-02-08.jpg](https://commons.wikimedia.org/wiki/File:Burritos_and_Tacos_neon_sign_Camden_High_Street_2024-02-08.jpg) | Tom Page | CC BY-SA 2.0 |
| `g-orvieto.jpg` | [Dawn from the Fortezza, Orvieto.jpg](https://commons.wikimedia.org/wiki/File:Dawn_from_the_Fortezza,_Orvieto.jpg) | Andrew Parlette | CC BY 4.0 |
| `g-pano.jpg` | [Morning Light Over Orvieto’s Edge (Italy) (54589714303).jpg](https://commons.wikimedia.org/wiki/File:Morning_Light_Over_Orvieto%E2%80%99s_Edge_(Italy)_(54589714303).jpg) | Andrew Parlette from Elkridge,MD, US | CC BY 2.0 |
| `g-parrots.jpg` | [Pair of parrots (54385959873).jpg](https://commons.wikimedia.org/wiki/File:Pair_of_parrots_(54385959873).jpg) | Ralf Hüsges | CC BY 2.0 |
| `g-peacock.jpg` | [Tagpfauenauge (53975556728).jpg](https://commons.wikimedia.org/wiki/File:Tagpfauenauge_(53975556728).jpg) | Ralf Hüsges | CC BY 2.0 |
| `g-railway.jpg` | [20240917 - Alishan Forest Railway - 1 (54379443144).jpg](https://commons.wikimedia.org/wiki/File:20240917_-_Alishan_Forest_Railway_-_1_(54379443144).jpg) | eugene_o | CC BY 2.0 |
| `g-risotto.jpg` | [Wild Mushroom Risotto Borough Market 2024-01-11.jpg](https://commons.wikimedia.org/wiki/File:Wild_Mushroom_Risotto_Borough_Market_2024-01-11.jpg) | Tom Page | CC BY-SA 2.0 |
| `g-robin.jpg` | [Rotkehlchen (53660622341).jpg](https://commons.wikimedia.org/wiki/File:Rotkehlchen_(53660622341).jpg) | Ralf Hüsges | CC BY 2.0 |
| `g-siena.jpg` | [Siena Streets at Night.jpg](https://commons.wikimedia.org/wiki/File:Siena_Streets_at_Night.jpg) | Andrew Parlette | CC BY 4.0 |
| `g-station.jpg` | [Liverpool Street station 2024-02-28.jpg](https://commons.wikimedia.org/wiki/File:Liverpool_Street_station_2024-02-28.jpg) | Tom Page | CC BY-SA 2.0 |
| `g-towers.jpg` | [Two Towers - Cape Henlopen - Delaware (55008241793).jpg](https://commons.wikimedia.org/wiki/File:Two_Towers_-_Cape_Henlopen_-_Delaware_(55008241793).jpg) | Andrew Parlette from Elkridge,MD, US | CC BY 4.0 |
| `g-vasco.jpg` | [Vasco da Gama bridge.jpg](https://commons.wikimedia.org/wiki/File:Vasco_da_Gama_bridge.jpg) | Niko0193 | CC BY-SA 4.0 |
| `g-wren.jpg` | [Zaunkönig (54319039803).jpg](https://commons.wikimedia.org/wiki/File:Zaunk%C3%B6nig_(54319039803).jpg) | Ralf Hüsges | CC BY 2.0 |
