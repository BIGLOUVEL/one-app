import { Composition, Folder } from "remotion";
import { OneCinematicAd } from "./OneCinematicAd";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="ONE-Cinematic-Ad">
        {/* 9:16 for TikTok / Reels - 24 seconds at 30fps */}
        <Composition
          id="OneCinematicAd-9x16"
          component={OneCinematicAd}
          durationInFrames={720}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            aspectRatio: "9:16" as const,
          }}
        />

        {/* 1:1 for Instagram Feed - 24 seconds at 30fps */}
        <Composition
          id="OneCinematicAd-1x1"
          component={OneCinematicAd}
          durationInFrames={720}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{
            aspectRatio: "1:1" as const,
          }}
        />
      </Folder>
    </>
  );
};
