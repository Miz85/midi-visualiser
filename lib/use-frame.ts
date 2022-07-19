import { useEffect, useRef } from "react";

export function useFrame(cb: Function) {
  const animationFrameId = useRef<number>();

  useEffect(() => {
    function updateFrame() {
      animationFrameId.current = requestAnimationFrame(() => {
        cb();
        updateFrame();
      });
    }
    function stopLoop() {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    updateFrame();
    return () => {
      stopLoop();
    };
  }, [cb]);
}
