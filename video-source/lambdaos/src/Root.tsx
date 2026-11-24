import React from "react";
import { Composition } from "remotion";
import { loadAllFonts } from "./fonts";
import { Explainer, EXPLAINER_DURATION } from "./explainer/Explainer";
import { BootAnimation, BOOT, bootDuration } from "./boot/Boot";
import { LexMode, LEX_DURATION } from "./lex/Lex";
import { Cover } from "./covers/Covers";
import { Still } from "remotion";
import { LogoSting, STING_SECONDS } from "./sting/Sting";
import { LiveWallpaper, WP_SECONDS } from "./wallpaper/LiveWallpaper";
import { LambStates, LAMB_STATES_DURATION } from "./lambvid/LambStates";
import { LexExplainer, LEXX_DURATION } from "./social/LexExplainer";
import { OperatorExplainer, OPX_DURATION } from "./social/OperatorExplainer";
import { LambExplainer, LAMBX_DURATION } from "./social/LambExplainer";

loadAllFonts();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Explainer" component={Explainer} durationInFrames={EXPLAINER_DURATION} fps={30} width={1080} height={1920} defaultProps={{ withAudio: false }} />
      <Composition id="Boot" component={BootAnimation} durationInFrames={bootDuration(2)} fps={BOOT.FPS} width={BOOT.W} height={BOOT.H} defaultProps={{ loops: 2, withAudio: false }} />
      <Composition id="BootZip" component={BootAnimation} durationInFrames={bootDuration(1)} fps={BOOT.FPS} width={BOOT.W} height={BOOT.H} defaultProps={{ loops: 1, withAudio: false, compact: true }} />
      <Composition id="Lex" component={LexMode} durationInFrames={LEX_DURATION} fps={30} width={1920} height={1080} />
      <Still id="Cover" component={Cover} width={1080} height={1920} defaultProps={{ id: "explainer" as const }} />
      <Composition id="Sting" component={LogoSting} durationInFrames={STING_SECONDS * 60} fps={60} width={1920} height={1080} />
      <Composition id="StingSquare" component={LogoSting} durationInFrames={STING_SECONDS * 60} fps={60} width={1080} height={1080} />
      <Composition id="LiveWallpaper" component={LiveWallpaper} durationInFrames={WP_SECONDS * 30} fps={30} width={1080} height={2280} />
      <Composition id="LambStates" component={LambStates} durationInFrames={LAMB_STATES_DURATION} fps={30} width={1080} height={1080} />
      <Composition id="LexExplainer" component={LexExplainer} durationInFrames={LEXX_DURATION} fps={30} width={1080} height={1920} defaultProps={{ withAudio: false }} />
      <Composition id="OperatorExplainer" component={OperatorExplainer} durationInFrames={OPX_DURATION} fps={30} width={1080} height={1920} defaultProps={{ withAudio: false }} />
      <Composition id="LambExplainer" component={LambExplainer} durationInFrames={LAMBX_DURATION} fps={30} width={1080} height={1920} defaultProps={{ withAudio: false }} />
    </>
  );
};
