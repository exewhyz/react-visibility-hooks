import { useEffect } from "react";
import { useDocVisible } from "./useDocVisible";

export function useAutoPauseVideo(ref: React.RefObject<HTMLVideoElement>) {
  const visible = useDocVisible();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (!visible) video.pause();
    else video.play().catch(() => {});
  }, [visible, ref]);
}
