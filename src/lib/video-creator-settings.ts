export type VideoDuration = "4" | "6" | "8";
export type VideoResolution = "720p" | "1080p";
export type VideoAspectRatio = "9:16" | "16:9" | "1:1" | "4:3";

export const VIDEO_DURATION_OPTIONS = [
  { value: "4", label: "4 seconds" },
  { value: "6", label: "6 seconds" },
  { value: "8", label: "8 seconds" },
] as const;

export const VIDEO_RESOLUTION_OPTIONS = [
  { value: "720p", label: "720p" },
  { value: "1080p", label: "1080p" },
] as const;

export const VIDEO_ASPECT_RATIO_OPTIONS = [
  { value: "9:16", label: "9:16 (vertical)" },
  { value: "16:9", label: "16:9 (horizontal)" },
  { value: "1:1", label: "1:1" },
  { value: "4:3", label: "4:3" },
] as const;

export function videoCreatorSettingsPayload(
  duration: VideoDuration,
  resolution: VideoResolution,
  aspectRatio: VideoAspectRatio,
  generateAudio: boolean
) {
  return {
    video_duration: `${duration}s`,
    resolution,
    aspect_ratio: aspectRatio,
    generate_audio: generateAudio,
  };
}
