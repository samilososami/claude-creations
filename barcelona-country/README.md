# Barcelona Country Festival · rediseño

Propuesta de rediseño de [barcelonacountry.com](https://barcelonacountry.com), el festival internacional de country y line dance de la Fira de Cornellà (22–24 de octubre de 2027). Mantiene la información y los textos de la web actual, con su paleta de colores (negro `#10100f`, papel `#f2f1eb` y rojo `#c40000`).

**En vivo:** https://www.samilososami.com/claudebcn/

Este proyecto no forma parte de la colección de Claude Creations: solo usa este repositorio para alojar los archivos.

## Qué incluye

- Hero con guirnalda de bombillas en canvas con física, «BARCELONA» con letras que caen y «Country» en neón.
- Slider de los 17 artistas con retratos, galerías a pantalla completa y biografías.
- Programa en cuatro paradas, cuenta atrás de persianas, mapa de Google que solo carga con consentimiento, suscripción a Barcelona Country News y páginas legales.
- Seis idiomas: español, catalán, inglés, francés, italiano y alemán.

## Estructura

```
barcelona-country/
├── index.html     Web compilada (Vite + React)
├── assets/        JS y CSS del build
├── resources/     Imágenes, galerías y tipografías
└── source/        Código fuente
```

Para compilar desde `source/`: copia `resources/` a `source/public/resources/`, y después `npm install` y `npm run build`. El resultado sale en `source/dist/`.

## Publicación

`samilososami.com/claudebcn` es una regla de Vercel (apartado Routes) del proyecto `samilososami_portfolio`, que reenvía esa ruta a `claude-creations.vercel.app/barcelona-country/`.

## Notas

- Es un prototipo de diseño. Los formularios de suscripción y contacto no envían ni guardan datos.
- Los textos legales son los del repositorio original y no se han tocado.

## Créditos

- Retratos y galerías de artistas, logotipo y el resto de imágenes del festival: material de Barcelona Country Festival.
- Fira de Cornellà: Zarateman, CC0 ([Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Cornell%C3%A1_de_Llobregat_-_Fira_de_Cornell%C3%A1_1.jpg)).
- Harley-Davidson de Shopping & Lifestyle: Dante Muñoz, licencia de Pexels ([Pexels](https://www.pexels.com/photo/harley-davidson-motorcycle-on-new-mexico-road-31439816/)).
- Fotos de ambiente de festivales: BeeMusicUK, Lizheen y Bambography (CC BY-SA 4.0), ckramer y Jamiecat (CC BY 2.0), en Wikimedia Commons. La lista completa está en «Créditos fotográficos», en el pie de la web.
- Tipografías: Cormorant Garamond, Manrope, Big Shoulders Display y Sacramento (SIL Open Font License), servidas desde la propia web.
