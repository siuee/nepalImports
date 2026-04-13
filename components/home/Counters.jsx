"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target, enabled) {
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    let s = 0;
    const dur = 2000;
    const step = target / (dur / 16);
    const id = setInterval(() => {
      s = Math.min(s + step, target);
      el.textContent = Math.floor(s).toLocaleString();
      if (s >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, enabled]);
  return ref;
}

export function Counters() {
  const rootRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const r394 = useCountUp(394, visible);
  const r37 = useCountUp(37, visible);
  const r94 = useCountUp(94, visible);
  const r25 = useCountUp(25, visible);

  return (
    <div className="counter-section" ref={rootRef}>
      <div className="counter-grid">
        <div className="counter-card fade-in-section visible">
          <span className="counter-icon">-</span>
          <div className="counter-value">
            <span ref={r394}>0</span>
            <span className="counter-suffix"> Billion</span>
          </div>
          <div className="counter-label">Rupees spent on food imports FY 2024/25</div>
          <div className="counter-nepali">वार्षिक खाद्य आयात</div>
          <div className="counter-sub">54% increase from previous year</div>
        </div>
        <div className="counter-card fade-in-section visible">
          <span className="counter-icon">+</span>
          <div className="counter-value">
            <span ref={r37}>0</span>
            <span className="counter-suffix">/77</span>
          </div>
          <div className="counter-label">Food deficit districts (indicator)</div>
          <div className="counter-nepali">जिल्ला खाद्य अपर्याप्त</div>
          <div className="counter-sub">Cannot feed population year-round</div>
        </div>
        <div className="counter-card fade-in-section visible">
          <span className="counter-icon">*</span>
          <div className="counter-value">
            Rs.<span ref={r94}>0</span>
          </div>
          <div className="counter-label">Farm gate price — ginger per kg</div>
          <div className="counter-nepali">अदुवा खेत मूल्य</div>
          <div className="counter-sub">Higher prices abroad after processing</div>
        </div>
        <div className="counter-card fade-in-section visible">
          <span className="counter-icon">^</span>
          <div className="counter-value">
            <span ref={r25}>0</span>
            <span className="counter-suffix">x</span>
          </div>
          <div className="counter-label">Average value if processed before export</div>
          <div className="counter-nepali">प्रशोधन गरी निर्यात</div>
          <div className="counter-sub">Processing multiplies export value</div>
        </div>
      </div>
    </div>
  );
}
