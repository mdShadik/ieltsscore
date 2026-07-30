/**
 * Captures microphone audio through a Web Audio high-pass filter and
 * dynamics compressor to reduce low-frequency rumble (fans, AC) before STT.
 */
export class FilteredAudioCapture {
  constructor() {
    this.audioContext = null;
    this.rawStream = null;
    this.mediaRecorder = null;
    this.chunks = [];
    this.mimeType = "audio/webm";
    this.analyser = null;
  }

  async start() {
    this.rawStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.rawStream);

    const highpass = this.audioContext.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 100;
    highpass.Q.value = 0.71;

    const lowCut = this.audioContext.createBiquadFilter();
    lowCut.type = "lowshelf";
    lowCut.frequency.value = 120;
    lowCut.gain.value = -10;

    const compressor = this.audioContext.createDynamicsCompressor();
    compressor.threshold.value = -28;
    compressor.knee.value = 18;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.15;

    const destination = this.audioContext.createMediaStreamDestination();

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;

    source.connect(highpass);
    highpass.connect(lowCut);
    lowCut.connect(compressor);
    compressor.connect(this.analyser);
    this.analyser.connect(destination);

    this.mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(destination.stream, {
      mimeType: this.mimeType,
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.mediaRecorder.start(1000);
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
        reject(new Error("Recorder is not active"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mimeType });
        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.onerror = () => {
        this.cleanup();
        reject(new Error("Recording failed"));
      };

      this.mediaRecorder.stop();
    });
  }

  getVolume() {
    if (!this.analyser) return 0;
    const bufferLength = this.analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const floatVal = (dataArray[i] - 128) / 128;
      sum += floatVal * floatVal;
    }
    return Math.sqrt(sum / bufferLength);
  }

  cleanup() {
    this.rawStream?.getTracks().forEach((track) => track.stop());
    this.rawStream = null;

    if (this.audioContext?.state !== "closed") {
      void this.audioContext?.close();
    }
    this.audioContext = null;
    this.mediaRecorder = null;
    this.chunks = [];
    this.analyser = null;
  }

  abort() {
    try {
      if (this.mediaRecorder?.state === "recording") {
        this.mediaRecorder.stop();
      }
    } catch {
      /* already stopped */
    }
    this.cleanup();
  }
}
