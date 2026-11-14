# Barcelona Country Festival · rediseño

Nueva versión de la web de [barcelonacountry.com](https://barcelonacountry.com), el festival internacional de country y line dance de la Fira de Cornellà (22–24 de octubre de 2027). Mantiene la información y los textos de la web actual, con su paleta de colores (negro `#10100f`, papel `#f2f1eb` y rojo `#c40000`).

**En vivo:** https://www.samilososami.com/claudebcn/

Este proyecto no forma parte de la colección de Claude Creations: solo usa este repositorio para alojar los archivos.

## Qué incluye

- Cabecera con el logo grande y la franja roja, como en la web oficial.
- Hero con guirnalda de bombillas en canvas (cuerda con física verlet), «BARCELONA COUNTRY» y «Festival» en neón.
- Reel promocional de 62 s dentro de un iPhone, junto a «El evento internacional…»; se carga al acercarse y se puede activar el sonido.
- Slider de los 17 artistas con retratos, galerías a pantalla completa y biografías.
- Programa en cuatro paradas (en PC con scroll; en móvil una a una con «Siguiente parada»), cuenta atrás de persianas, mapa de Google que solo carga con consentimiento y páginas legales.
- Suscripción a Barcelona Country News con animación de imprenta (sale el periódico, se estampa el sello) y contacto con animación de carta en sobre de correo aéreo.
- Seis idiomas: español, catalán, inglés, francés, italiano y alemán.

## Estructura

```
barcelona-country/
├── index.html     Web compilada (Vite + React)
├── assets/        JS y CSS del build
├── resources/     Imágenes, galerías, tipografías y el reel (video/)
└── source/        Código fuente
```

Para compilar: `cd source && npm install && npm run build`. `source/public/resources` es un enlace a `../../resources`, así que no hace falta copiar nada. El resultado sale en `source/dist/`.

## Publicación

El código de trabajo vive en el repositorio `barcelonacountry`, carpeta `barcelona-country-new/`. Por ahora la web solo se publica en `samilososami.com/claudebcn`: tras compilar, se copian `index.html`, `assets/` y `resources/` a `barcelona-country/` del repositorio `claude-creations` y se sube. `samilososami.com/claudebcn` es una regla de Vercel (apartado Routes) del proyecto `samilososami_portfolio`, que reenvía esa ruta a `claude-creations.vercel.app/barcelona-country/`. El dominio oficial no se toca.

## Notas

- Es un prototipo de diseño. Los formularios de suscripción y contacto no envían ni guardan datos.
- Los textos legales son los del repositorio original y no se han tocado.

## Créditos

- Retratos y galerías de artistas, logotipo y el resto de imágenes del festival: material de Barcelona Country Festival.
- Fira de Cornellà: Zarateman, CC0 ([Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Cornell%C3%A1_de_Llobregat_-_Fira_de_Cornell%C3%A1_1.jpg)).
- Tienda western de Shopping & Lifestyle: Noé Villalta Photography, licencia de Pexels ([Pexels](https://www.pexels.com/photo/market-stall-with-cowboy-boots-and-cowboy-hats-9216217/)).
- Reel: vídeo promocional hecho con Claude (narración y música de ElevenLabs).
- Fotos de ambiente de festivales: BeeMusicUK, Lizheen y Bambography (CC BY-SA 4.0), ckramer y Jamiecat (CC BY 2.0), en Wikimedia Commons. La lista completa está en «Créditos fotográficos», en el pie de la web.
- Tipografías: Cormorant Garamond, Instrument Serif, Manrope, Big Shoulders Display y Sacramento (SIL Open Font License), servidas desde la propia web.
