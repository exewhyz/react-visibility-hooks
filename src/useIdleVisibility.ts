import { useEffect, useState } from "react";
import { useDocVisible } from "./useDocVisible";

export function useIdleVisibility(timeout = 60000) {
  const visible = useDocVisible();
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let timer: any;

    const reset = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), timeout);
    };

    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    reset();

    return () => {
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
      clearTimeout(timer);
    };
  }, [timeout]);

  return { visible, idle };
}
