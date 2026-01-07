// Clock.js
import React, { useRef } from "react";
import Sketch from "react-p5";

// ★ Clockは timeLine も Audio も知らない
// ★ props で渡された情報だけ描画する

export default function Clock({ timeString, mode, visible }) {

  // -------------------------
  // p5.js
  // -------------------------
  const canvasWidth = 420;
  const canvasHeight = 180;
  const fontRef = useRef(null);

  const preload = (p5) => {
    fontRef.current = p5.loadFont("/fonts/digital_fonts.ttf");
  };

  const setup = (p5, parent) => {
    const existing = parent.querySelector("canvas");
    if (existing) existing.remove();
    p5.createCanvas(canvasWidth, canvasHeight).parent(parent);
    p5.textAlign(p5.CENTER, p5.CENTER);
  };

  const draw = (p5) => {
    p5.background(0);      // ★ 背景黒
    p5.fill(255);          // ★ 文字白

    if (fontRef.current) p5.textFont(fontRef.current);

    const [hh, mm, ss] = timeString.split(":");
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;

    if (!visible) {
      p5.textSize(60);
      p5.text("--:--:--", cx, cy);
      return;
    }

    if (mode === 1) {
      p5.textSize(60);
      p5.text(hh, cx - 120, cy);
      p5.text(":", cx - 60, cy);
      p5.text(mm, cx, cy);
      p5.text(":", cx + 60, cy);
      p5.text(ss, cx + 120, cy);
    }

    else if (mode === 2) {
      p5.textSize(60);
      p5.text(hh, cx - 160, cy + 20);
      p5.text(":", cx - 100, cy + 20);

      p5.textSize(100);
      p5.text(mm, cx - 10, cy);

      p5.textSize(60);
      p5.text(":", cx + 80, cy + 20);
      p5.text(ss, cx + 140, cy + 20);
    }

    else if (mode === 3) {
      p5.textSize(60);
      p5.text(hh, cx - 150, cy + 20);
      p5.text(":", cx - 90, cy + 20);
      p5.text(mm, cx - 30, cy + 20);

      p5.text(":", cx + 30, cy + 20);

      p5.textSize(100);
      p5.text(ss, cx + 120, cy);
    }
  };

  return (
    <Sketch
      preload={preload}
      setup={setup}
      draw={draw}
    />
  );
}