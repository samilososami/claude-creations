# Barcelona Country Festival

Rediseño completo de [barcelonacountry.com](https://barcelonacountry.com), el festival internacional de country y line dance de la Fira de Cornellà (22–24 de octubre de 2027). Misma información y mismos textos que la web real, con una distribución, un diseño y una interacción hechos desde cero.

**En vivo:** https://www.samilososami.com/claude/barcelona-country/

| Dato | Valor |
|------|-------|
| Modelo | Claude |
| Fecha | Nov 2026 |
| Tiempo | ≈ 1 h 40 min en dos sesiones (≈ 56 min la primera, ≈ 45 min la segunda) |
| Tokens | ≈ 520 k de salida · ≈ 95 M procesados en total, casi todo lectura de caché |

## Qué incluye

- Hero con una guirnalda de bombillas en canvas que se balancea con física de muelles y reacciona al cursor, «BARCELONA» con letras que caen una a una y «Country» en neón que parpadea al encenderse.
- Capa elegante en la segunda pasada: Cormorant Garamond para titulares y cifras, filetes finos, marcos dorados dentro de las fotos en arco y una paleta más sobria de tinta, papel, rojo y oro.
- Slider de los 17 artistas con los mismos retratos, encuadres, galerías y biografías que la web original: arrastre con ratón, autoplay que se para al tocarlo, contador, barra de progreso y galería a pantalla completa con miniaturas, teclado y swipe.
- Programa en cuatro paradas con imagen fija que cambia al hacer scroll, cuenta atrás con tablero de persianas, mapa de Google que solo carga con consentimiento, ticket de suscripción a Barcelona Country News y páginas legales.
- Seis idiomas: español, catalán, inglés, francés, italiano y alemán.

## Estructura

```
barcelona-country/
├── index.html        Web compilada (Vite + React), con el botón i del proyecto
├── assets/           JS y CSS del build
├── resources/        Imágenes, galerías y tipografías
├── preview.jpg       Portada para el hub
└── source/           Código fuente
```

Para compilar desde `source/`: copia `resources/` a `source/public/resources/`, y después `npm install` y `npm run build`.

## Notas

- Es un prototipo de diseño. Los formularios de suscripción y contacto no envían ni guardan datos.
- Los textos legales son los del repositorio original y no se han tocado.

## Prompt

Los dos mensajes literales del usuario están en el botón **i** de la esquina inferior derecha de la web.

## Créditos

- Retratos y galerías de artistas, logotipo y el resto de imágenes del festival: material de Barcelona Country Festival.
- Fira de Cornellà: Zarateman, CC0 ([Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Cornell%C3%A1_de_Llobregat_-_Fira_de_Cornell%C3%A1_1.jpg)).
- Harley-Davidson de Shopping & Lifestyle: Dante Muñoz, licencia de Pexels ([Pexels](https://www.pexels.com/photo/harley-davidson-motorcycle-on-new-mexico-road-31439816/)).
- Fotos de ambiente de festivales: BeeMusicUK, Lizheen y Bambography (CC BY-SA 4.0), ckramer y Jamiecat (CC BY 2.0), en Wikimedia Commons. La lista completa está en «Créditos fotográficos», en el pie de la web.
- Tipografías: Cormorant Garamond, Manrope, Big Shoulders Display y Sacramento (SIL Open Font License), servidas desde la propia web.
