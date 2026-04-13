"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ mx: 0, my: 0, rx: 0, ry: 0 });
  const frame = useRef(0);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    const onMove = (e) => {
      pos.current.mx = e.clientX;
      pos.current.my = e.clientY;
      cursor.style.left = `${e.clientX - 6}px`;
      cursor.style.top = `${e.clientY - 6}px`;
    };

    const loop = () => {
      const { mx, my, rx, ry } = pos.current;
      pos.current.rx += (mx - rx - 18) * 0.12;
      pos.current.ry += (my - ry - 18) * 0.12;
      ring.style.left = `${pos.current.rx}px`;
      ring.style.top = `${pos.current.ry}px`;
      frame.current = requestAnimationFrame(loop);
    };

    const scaleUp = () => {
      cursor.style.transform = "scale(2)";
      ring.style.transform = "scale(1.5)";
    };
    const scaleDown = () => {
      cursor.style.transform = "scale(1)";
      ring.style.transform = "scale(1)";
    };

    const onOver = (e) => {
      const t = e.target;
      if (
        t.matches?.("button,a,.product-card,.opp-card,.district,.market-card,.nav-badge")
      ) {
        scaleUp();
      }
    };
    const onOut = (e) => {
      const t = e.target;
      if (
        t.matches?.("button,a,.product-card,.opp-card,.district,.market-card,.nav-badge")
      ) {
        scaleDown();
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    frame.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="cursor" aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />
    </>
  );
}
