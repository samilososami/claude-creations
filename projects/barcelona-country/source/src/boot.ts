// Self-hosted fonts (no third-party font requests), served from public/resources.
const fonts = document.createElement('style');
fonts.textContent = `
@font-face { font-family: 'Big Shoulders Display'; src: url('resources/fonts/bigshoulders.woff2') format('woff2'); font-weight: 500 900; font-display: swap; }
@font-face { font-family: 'Manrope'; src: url('resources/fonts/manrope.woff2') format('woff2'); font-weight: 400 800; font-display: swap; }
@font-face { font-family: 'Cormorant Garamond'; src: url('resources/fonts/cormorant.woff2') format('woff2'); font-weight: 300 700; font-style: normal; font-display: swap; }
@font-face { font-family: 'Cormorant Garamond'; src: url('resources/fonts/cormorant-italic.woff2') format('woff2'); font-weight: 300 700; font-style: italic; font-display: swap; }
@font-face { font-family: 'Sacramento'; src: url('resources/fonts/sacramento.woff2') format('woff2'); font-weight: 400; font-display: swap; }
`;
document.head.appendChild(fonts);

const icon = document.createElement('link');
icon.rel = 'icon';
icon.type = 'image/webp';
icon.href = 'resources/img/isotype.webp';
document.head.appendChild(icon);

export {};
