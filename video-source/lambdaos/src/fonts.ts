import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const faces: [string, string, string][] = [
  ["Montserrat", "fonts/Montserrat-SemiBold.ttf", "600"],
  ["Inter", "fonts/Inter-Light.otf", "300"],
  ["Inter", "fonts/Inter-Regular.otf", "400"],
  ["Inter", "fonts/Inter-Medium.otf", "500"],
  ["Inter", "fonts/Inter-SemiBold.otf", "600"],
  ["Inter", "fonts/Inter-Bold.otf", "700"],
  ["JetBrains Mono", "fonts/JetBrainsMono-Regular.ttf", "400"],
  ["JetBrains Mono", "fonts/JetBrainsMono-Medium.ttf", "500"],
  ["JetBrains Mono", "fonts/JetBrainsMono-Bold.ttf", "700"],
];

let started = false;
export const loadAllFonts = () => {
  if (started) return;
  started = true;
  for (const [family, file, weight] of faces) {
    loadFont({ family, url: staticFile(file), weight }).catch((e) =>
      console.error("font", family, weight, e),
    );
  }
};
