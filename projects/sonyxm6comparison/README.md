# Sony XM6 comparison

Lista de webs sobre los Sony WH-1000XM6. Todas salen del mismo prompt, hechas por distintos modelos de Claude, para poder compararlas.

**Ver: [samilososami.com/claude/sonyxm6comparison](https://www.samilososami.com/claude/sonyxm6comparison/)**

## Webs

| # | Modelo | Enlace | Carpeta |
|---|--------|--------|---------|
| 01 | Haiku 5.5 | [/claude/sonyxm6comparison/haiku](https://www.samilososami.com/claude/sonyxm6comparison/haiku/) | [`haiku/`](haiku) |
| 02 | Sonnet 5.5 | [/claude/sonyxm6comparison/sonnet](https://www.samilososami.com/claude/sonyxm6comparison/sonnet/) | [`sonnet/`](sonnet) |
| 03 | Fable 5.2 | [/claude/sonyxm6comparison/fable](https://www.samilososami.com/claude/sonyxm6comparison/fable/) | [`fable/`](fable) |
| 04 | Opus 5.5 | [/claude/sonyxm6comparison/opus](https://www.samilososami.com/claude/sonyxm6comparison/opus/) | [`opus/`](opus) |

Cada carpeta tiene su propio README con los créditos de las imágenes. Las cuatro están también alojadas en AppDeploy (enlaces en cada README).

## El prompt (el mismo para todas)

> creame una página web llamativa, que muestre los cascos sony xm6. añade imagenes publicas y tal y todo eso. lo que tu veas. que hable de las funciones y de todas las caracteristicas. que muestre tambien ejemplos de imagenes de todo tipo. añade por ejemplo una galeria que muestre imagenes, igual lo puedes hacer estilo mosaico. que sea una experiencia visual de página web, que conforme el usuario scrollea se sienta increible. que se vaya adaptando y modificando la web conforme el usuario baja o sube. el estilo de diseño decidelo tu, en función de lo que veas que pega. preparala, y cuando la tengas, la hosteas en appdeploy

## Cómo añadir otra web

1. Crea `<modelo>/index.html` en esta carpeta.
2. Copia un `<li>` de `index.html` (la lista), cambia enlace, imagen y textos. La miniatura va en `img/`.
3. Sube los cambios. La ruta `/claude/sonyxm6comparison/<modelo>/` ya funciona gracias a `vercel.json`.
