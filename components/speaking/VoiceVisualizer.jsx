"use client";

import { useEffect, useRef } from "react";

export default function VoiceVisualizer({ active, className = "" }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const smoothedVolumeRef = useRef(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    if (!active) {
      // Clear canvas when inactive
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Draw a simple flat line
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

    let streamInstance = null;
    let audioCtxInstance = null;

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamInstance = stream;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        const audioCtx = new AudioCtx();
        audioCtxInstance = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }
      } catch (err) {
        console.error("VoiceVisualizer audio setup failed:", err);
      }
    };

    void initAudio();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Read real-time volume
      let rms = 0;
      if (analyserRef.current) {
        const bufferLength = analyserRef.current.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const floatVal = (dataArray[i] - 128) / 128;
          sum += floatVal * floatVal;
        }
        rms = Math.sqrt(sum / bufferLength);
      }

      // Smooth the volume changes
      smoothedVolumeRef.current = smoothedVolumeRef.current * 0.8 + rms * 0.2;
      const vol = smoothedVolumeRef.current;

      // Update phase (speed scales up when speaking)
      phaseRef.current += 0.04 + vol * 0.16;

      // Configure three overlapping glowing waves
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
          // Sine envelope to taper the wave at the edges
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

    // Start rendering loop
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamInstance) {
        streamInstance.getTracks().forEach((track) => track.stop());
      }
      if (audioCtxInstance && audioCtxInstance.state !== "closed") {
        void audioCtxInstance.close();
      }
      analyserRef.current = null;
    };
  }, [active]);

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
