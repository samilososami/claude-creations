# Claude creations

Webs y proyectos que he construido con [Claude](https://claude.com/claude-code) a partir de un prompt y que me han parecido lo bastante buenos como para guardarlos.

**Ver en vivo: [samilososami.com/claude](https://www.samilososami.com/claude/)**

## De qué va

Cada proyecto sale de una conversación: escribo lo que quiero, Claude decide el diseño, busca el contenido, programa y despliega. Aquí solo entra lo que queda realmente bien, y entra tal cual salió.

Cada web lleva un botón **i** en la esquina superior derecha con el prompt exacto, el modelo, el tiempo y los tokens que costó.

## Proyectos

| # | Proyecto | Qué es | Modelo | Tiempo | Enlace |
|---|----------|--------|--------|--------|--------|
| 01 | [Sony α6700](projects/sonya6700) | Web de producto con scroll interactivo y galería de 36 fotos reales | Claude Fable 5.2 | 21 min | [/claude/sonya6700](https://www.samilososami.com/claude/sonya6700/) |
| 02 | [α6700 en 3D](projects/sonya6700-3d) | Modelo 3D interactivo de la cámara, hecho con geometría procedural | Claude Fable 5.2 | 17 min | [/claude/sonya6700-3d](https://www.samilososami.com/claude/sonya6700-3d/) |
| 03 | [GlassPhone](projects/glassphone) | Concepto de teléfono transparente: cristal con refracción real en WebGL y GlassOS, un sistema simulado con doce apps | Claude | 2 h 30 min | [/claude/glassphone](https://www.samilososami.com/claude/glassphone/) |

## Estructura

```
claude-creations/
├── hub/                  Página índice, servida en /claude/
│   └── index.html
├── projects/             Un proyecto por carpeta, servido en /claude/<carpeta>/
│   └── sonya6700/
│       ├── index.html
│       ├── img/
│       └── README.md
├── vercel.json           Rutas: /claude/ → hub, /claude/<slug>/ → projects/<slug>/
└── README.md
```

## Cómo añadir un proyecto

1. Crea `projects/<slug>/` con su `index.html`. Usa rutas relativas (`img/foto.jpg`), no absolutas.
2. Añade un `README.md` en la carpeta con el prompt, el modelo, el tiempo y los tokens.
3. Copia el bloque `<a class="card">` de `hub/index.html`, cambia enlace, imagen y textos, y actualiza los contadores del hub.
4. Añade una fila a la tabla de arriba.
5. `git push`. Vercel despliega solo y `vercel.json` ya enruta cualquier carpeta nueva; no hay que tocarlo.

## Despliegue

El repo se despliega en Vercel como proyecto `claude-creations`. El dominio `samilososami.com` pertenece a otro proyecto (el portfolio), que reenvía `/claude/*` a este mediante `rewrites` en su `vercel.json`.

## Licencias

El código es mío y puedes mirarlo y reutilizarlo libremente. Las imágenes de cada proyecto tienen sus propios autores y licencias, indicados en el README y en los créditos de cada web.
