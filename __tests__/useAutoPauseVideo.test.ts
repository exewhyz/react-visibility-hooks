import { renderHook, act } from "@testing-library/react";
import { useAutoPauseVideo } from "../src/useAutoPauseVideo";
import { useRef } from "react";

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    value: state,
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  setVisibility("visible");
});

describe("useAutoPauseVideo", () => {
  it("pauses video when tab becomes hidden", () => {
    setVisibility("visible");

    const pause = jest.fn();
    const play = jest.fn().mockResolvedValue(undefined);
    const fakeVideo = { pause, play, paused: false } as unknown as HTMLVideoElement;

    renderHook(() => {
      const ref = useRef<HTMLVideoElement>(fakeVideo);
      useAutoPauseVideo(ref);
      return ref;
    });

    act(() => {
      setVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(pause).toHaveBeenCalled();
  });

  it("resumes video when tab becomes visible if paused by hook", () => {
    setVisibility("visible");

    const pause = jest.fn();
    const play = jest.fn().mockResolvedValue(undefined);
    let paused = false;
    const fakeVideo = {
      pause: () => { paused = true; pause(); },
      play: () => { paused = false; return play(); },
      get paused() { return paused; },
    } as unknown as HTMLVideoElement;

    renderHook(() => {
      const ref = useRef<HTMLVideoElement>(fakeVideo);
      useAutoPauseVideo(ref);
      return ref;
    });

    // Hide tab
    act(() => {
      setVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(pause).toHaveBeenCalled();

    // Show tab again
    act(() => {
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(play).toHaveBeenCalled();
  });

  it("does not resume video if it was already paused by user", () => {
    setVisibility("visible");

    const pause = jest.fn();
    const play = jest.fn().mockResolvedValue(undefined);
    // Video is already paused by user
    const fakeVideo = { pause, play, paused: true } as unknown as HTMLVideoElement;

    renderHook(() => {
      const ref = useRef<HTMLVideoElement>(fakeVideo);
      useAutoPauseVideo(ref);
      return ref;
    });

    // Hide tab — should NOT call pause since already paused
    act(() => {
      setVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(pause).not.toHaveBeenCalled();

    // Show tab — should NOT call play since hook didn't pause it
    act(() => {
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(play).not.toHaveBeenCalled();
  });

  it("does nothing when ref is null", () => {
    setVisibility("visible");

    // Should not throw
    renderHook(() => {
      const ref = useRef<HTMLVideoElement>(null);
      useAutoPauseVideo(ref);
      return ref;
    });

    act(() => {
      setVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
  });
});
