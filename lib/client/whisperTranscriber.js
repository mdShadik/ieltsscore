const WHISPER_MODEL = "Xenova/whisper-base.en";

let transcriberPromise = null;
let loadProgress = 0;

function createProgressHandler(onProgress) {
  return (progress) => {
    if (progress.status === "progress" && progress.total) {
      loadProgress = Math.round((progress.loaded / progress.total) * 100);
      onProgress?.(loadProgress);
    }
  };
}

async function loadTranscriber(onProgress) {
  const { pipeline, env } = await import("@huggingface/transformers");

  env.allowLocalModels = false;
  env.useBrowserCache = true;

  return pipeline("automatic-speech-recognition", WHISPER_MODEL, {
    dtype: "q8",
    progress_callback: createProgressHandler(onProgress),
  });
}

export function preloadWhisperModel(onProgress) {
  if (!transcriberPromise) {
    transcriberPromise = loadTranscriber(onProgress).catch((error) => {
      transcriberPromise = null;
      throw error;
    });
  } else if (onProgress && loadProgress > 0) {
    onProgress(loadProgress);
  }
  return transcriberPromise;
}

export function getWhisperLoadProgress() {
  return loadProgress;
}

export async function transcribeAudioBlob(blob) {
  const transcriber = await preloadWhisperModel();
  const url = URL.createObjectURL(blob);

  try {
    const result = await transcriber(url, {
      chunk_length_s: 30,
      stride_length_s: 5,
      language: "english",
      task: "transcribe",
    });
    return (result?.text ?? "").trim();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function isWhisperReady() {
  return Boolean(transcriberPromise);
}
