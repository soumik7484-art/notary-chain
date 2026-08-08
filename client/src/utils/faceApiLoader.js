import * as faceapi from '@vladmandic/face-api';

let modelsLoadingPromise = null;
let modelsLoaded = false;

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

/**
 * Loads face-api ML neural models (TinyFaceDetector, 68 Landmarks, FaceRecognition)
 */
export const loadFaceApiModels = async () => {
  if (modelsLoaded) return true;
  if (modelsLoadingPromise) return modelsLoadingPromise;

  modelsLoadingPromise = (async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      modelsLoaded = true;
      return true;
    } catch (err) {
      console.error('Failed to load ML face recognition models:', err);
      modelsLoadingPromise = null;
      throw err;
    }
  })();

  return modelsLoadingPromise;
};

/**
 * Evaluates webcam video frame for real human face presence, 68 landmarks, and quality checks.
 * Rejects walls, backgrounds, objects, multiple faces, bad exposure, and off-center faces.
 */
export const analyzeWebcamFrame = async (videoElement, canvasElement) => {
  if (!videoElement || !modelsLoaded) {
    return {
      faceDetected: false,
      status: 'CAMERA_STARTING',
      message: 'Initializing face recognition models...'
    };
  }

  const width = videoElement.videoWidth || 640;
  const height = videoElement.videoHeight || 480;

  if (width < 50 || height < 50) {
    return {
      faceDetected: false,
      status: 'SEARCHING_FOR_FACE',
      message: 'Position your face in the frame.'
    };
  }

  // 1. Detect ALL faces in frame to enforce single face constraint
  const detectorOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.5
  });

  const allDetections = await faceapi.detectAllFaces(videoElement, detectorOptions);

  if (!allDetections || allDetections.length === 0) {
    return {
      faceDetected: false,
      qualityPassed: false,
      status: 'SEARCHING_FOR_FACE',
      message: 'Face not detected — position your face in the frame.'
    };
  }

  // 2. Reject if multiple faces detected
  if (allDetections.length > 1) {
    return {
      faceDetected: false,
      qualityPassed: false,
      multipleFaces: true,
      status: 'QUALITY_CHECK_FAILED',
      message: 'Only one face should be visible.'
    };
  }

  // 3. Single face detected! Extract 68 facial landmarks & 128D FaceNet descriptor
  const singleDetection = await faceapi
    .detectSingleFace(videoElement, detectorOptions)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!singleDetection || !singleDetection.landmarks || !singleDetection.descriptor) {
    return {
      faceDetected: false,
      qualityPassed: false,
      status: 'QUALITY_CHECK_FAILED',
      message: 'Face is not clearly visible. Please face the camera directly.'
    };
  }

  const box = singleDetection.detection.box;
  const landmarks = singleDetection.landmarks;

  // 4. Quality Check A: Bounding Box Size (Must be >= 90px width/height and reasonable scale)
  if (box.width < 90 || box.height < 90) {
    return {
      faceDetected: true,
      qualityPassed: false,
      status: 'QUALITY_CHECK_FAILED',
      message: 'Move closer to the camera.'
    };
  }

  if (box.width > width * 0.90 || box.height > height * 0.90) {
    return {
      faceDetected: true,
      qualityPassed: false,
      status: 'QUALITY_CHECK_FAILED',
      message: 'Move slightly further back from the camera.'
    };
  }

  // 5. Quality Check B: Centering Check (Box center within 28% of viewport center)
  const faceCenterX = box.x + box.width / 2;
  const faceCenterY = box.y + box.height / 2;
  const frameCenterX = width / 2;
  const frameCenterY = height / 2;

  const offsetX = Math.abs(faceCenterX - frameCenterX) / width;
  const offsetY = Math.abs(faceCenterY - frameCenterY) / height;

  if (offsetX > 0.28) {
    return {
      faceDetected: true,
      qualityPassed: false,
      status: 'QUALITY_CHECK_FAILED',
      message: faceCenterX < frameCenterX ? 'Move slightly right' : 'Move slightly left'
    };
  }

  if (offsetY > 0.30) {
    return {
      faceDetected: true,
      qualityPassed: false,
      status: 'QUALITY_CHECK_FAILED',
      message: faceCenterY < frameCenterY ? 'Move slightly down' : 'Move slightly up'
    };
  }

  // 6. Quality Check C: Exposure Check on face pixels
  if (canvasElement) {
    canvasElement.width = width;
    canvasElement.height = height;
    const ctx = canvasElement.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, width, height);

    try {
      const startX = Math.max(0, Math.floor(box.x));
      const startY = Math.max(0, Math.floor(box.y));
      const boxW = Math.min(width - startX, Math.floor(box.width));
      const boxH = Math.min(height - startY, Math.floor(box.height));

      const imgData = ctx.getImageData(startX, startY, boxW, boxH);
      const pixels = imgData.data;

      let sumLum = 0;
      const count = pixels.length / 4;

      for (let i = 0; i < pixels.length; i += 4) {
        const lum = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
        sumLum += lum;
      }

      const avgLum = sumLum / count;

      if (avgLum < 25) {
        return {
          faceDetected: true,
          qualityPassed: false,
          status: 'QUALITY_CHECK_FAILED',
          message: 'Lighting is too dark. Increase room lighting.'
        };
      }

      if (avgLum > 240) {
        return {
          faceDetected: true,
          qualityPassed: false,
          status: 'QUALITY_CHECK_FAILED',
          message: 'Lighting is too bright. Reduce harsh glare.'
        };
      }
    } catch (e) {
      // Ignore cross-origin canvas errors if any
    }
  }

  // 7. Quality Check D: Landmark Completeness (Eyes, Nose, Mouth landmark positions)
  const nose = landmarks.getNose();
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const mouth = landmarks.getMouth();

  if (!nose.length || !leftEye.length || !rightEye.length || !mouth.length) {
    return {
      faceDetected: true,
      qualityPassed: false,
      status: 'QUALITY_CHECK_FAILED',
      message: 'Face is not clearly visible. Remove obstructions.'
    };
  }

  // ALL QUALITY CHECKS PASSED!
  return {
    faceDetected: true,
    qualityPassed: true,
    status: 'FACE_DETECTED',
    message: 'Valid face detected — Ready to verify',
    box: { x: box.x, y: box.y, width: box.width, height: box.height },
    descriptor: Array.from(singleDetection.descriptor),
    landmarks: {
      noseTip: nose[3] ? { x: nose[3].x, y: nose[3].y } : null
    }
  };
};
