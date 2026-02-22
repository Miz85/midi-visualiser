import React, { KeyboardEventHandler, useEffect, useRef } from 'react';

export function useFrame(cb) {
  const animationFrameId = useRef<number | null>(null);

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
    function onKeyDown(this: Window, event: KeyboardEvent) {
      if (event.key === 's') {
        stopLoop();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    updateFrame();
    return () => {
      stopLoop();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [cb]);
}
