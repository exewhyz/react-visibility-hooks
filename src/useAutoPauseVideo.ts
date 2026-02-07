import { useEffect, useRef } from "react";
import { useDocVisible } from "./useDocVisible";

/**
 * Automatically pauses a `<video>` when the page becomes hidden
 * and resumes playback when the page becomes visible again.
 *
 * Only resumes if the video was playing before it was paused by this hook.
 */
export function useAutoPauseVideo(
  ref: React.RefObject<HTMLVideoElement | null>,
): void {
  const visible = useDocVisible();
  const wasPausedByUs = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (!visible && !video.paused) {
      video.pause();
      wasPausedByUs.current = true;
    } else if (visible && wasPausedByUs.current) {
      video.play().catch(() => {
        /* autoplay may be blocked */
      });
      wasPausedByUs.current = false;
    }
  }, [visible, ref]);
}
