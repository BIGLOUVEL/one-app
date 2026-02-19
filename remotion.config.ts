import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./remotion/index.ts");
Config.setOutputLocation("./out/OneCinematicAd.mp4");
Config.setCodec("h264");
Config.setCrf(18); // High quality
