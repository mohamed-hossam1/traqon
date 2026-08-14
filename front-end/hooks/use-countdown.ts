"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdown(cooldownSeconds: number = 60) {
  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(
    (deadline: number) => {
      clearTick();
      intervalRef.current = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.ceil((deadline - Date.now()) / 1000),
        );
        setSecondsLeft(remaining);
        if (remaining <= 0) clearTick();
      }, 1000);
    },
    [clearTick],
  );

  useEffect(() => {
    const deadline = Date.now() + cooldownSeconds * 1000;
    startInterval(deadline);
    return clearTick;
  }, [startInterval, cooldownSeconds, clearTick]);

  const start = useCallback(() => {
    setSecondsLeft(cooldownSeconds);
    startInterval(Date.now() + cooldownSeconds * 1000);
  }, [cooldownSeconds, startInterval]);

  return {
    secondsLeft,
    isCoolingDown: secondsLeft > 0,
    start,
  };
}
