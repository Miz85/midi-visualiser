import { useEffect, useRef } from 'react';

export function useFrame(cb) {
  const animationFrameId = useRef();

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
    function onKeyDown(event) {
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
