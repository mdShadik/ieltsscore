"use client";

import { useEffect, useRef } from "react";

export default function VoiceVisualizer({
  active,
  voiceEngine = "browser",
  displayText = "",
  getVolume,
  className = "",
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const smoothedVolumeRef = useRef(0);
  const phaseRef = useRef(0);

  // Simulation refs for browser speech engine
  const lastTextRef = useRef("");
  const simVolumeRef = useRef(0);
  const lastActiveTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!active) {
      // Clear canvas when inactive and draw a simple flat line
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const centerY = canvas.height / 2;
          ctx.beginPath();
          ctx.strokeStyle = "rgba(99, 102, 241, 0.25)";
          ctx.lineWidth = 2;
          ctx.moveTo(0, centerY);
          ctx.lineTo(canvas.width, centerY);
          ctx.stroke();
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      let vol = 0;

      if (voiceEngine === "browser") {
        // 1. Browser Speech Recognition: Simulate volume based on text updates
        const currentText = displayText || "";
        if (currentText !== lastTextRef.current && currentText.trim().length > 0) {
          lastTextRef.current = currentText;
          lastActiveTimeRef.current = Date.now();
          simVolumeRef.current = 0.25 + Math.random() * 0.45;
        } else {
          const elapsed = Date.now() - lastActiveTimeRef.current;
          if (elapsed > 400) {
            simVolumeRef.current = simVolumeRef.current * 0.85; // Decay
          } else {
            simVolumeRef.current =
              simVolumeRef.current * 0.95 + (0.05 + Math.random() * 0.1) * 0.05;
          }
        }
        vol = simVolumeRef.current;
      } else {
        // 2. Local Whisper: Query the real volume from FilteredAudioCapture analyser
        const rms = getVolume ? getVolume() : 0;
        smoothedVolumeRef.current = smoothedVolumeRef.current * 0.8 + rms * 0.2;
        vol = smoothedVolumeRef.current;
      }

      // Update phase (speed scales up when speaking)
      phaseRef.current += 0.04 + vol * 0.16;

      const waves = [
        {
          amplitude: 3 + vol * 36,
          frequency: 0.015,
          phaseOffset: 0,
          color: "rgba(99, 102, 241, 0.8)", // Indigo
          lineWidth: 2.5,
          glow: 8,
        },
        {
          amplitude: 1.5 + vol * 24,
          frequency: 0.025,
          phaseOffset: Math.PI / 3,
          color: "rgba(168, 85, 247, 0.65)", // Purple
          lineWidth: 1.8,
          glow: 5,
        },
        {
          amplitude: 0.8 + vol * 12,
          frequency: 0.008,
          phaseOffset: -Math.PI / 4,
          color: "rgba(20, 184, 166, 0.5)", // Teal
          lineWidth: 1.2,
          glow: 3,
        },
      ];

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.lineWidth = w.lineWidth;
        ctx.strokeStyle = w.color;
        ctx.shadowBlur = w.glow;
        ctx.shadowColor = w.color;

        for (let x = 0; x < width; x++) {
          const envelope = Math.sin((x / width) * Math.PI);
          const y =
            centerY +
            Math.sin(x * w.frequency + phaseRef.current + w.phaseOffset) *
              w.amplitude *
              envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      ctx.restore();

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, voiceEngine, displayText, getVolume]);

  return (
    <div className={`flex items-center justify-center h-16 w-full ${className}`}>
      <canvas
        ref={canvasRef}
        width={360}
        height={64}
        className="w-full max-w-[360px] h-16 block"
      />
    </div>
  );
}
