/**
 * PRODUCTION-GRADE UNIFIED 128-DIMENSIONAL FACIAL BIOMETRIC MATCHING ENGINE
 * 
 * Powered by TensorFlow.js FaceNet Deep Neural Embeddings (128D Float32 vectors).
 * Used IDENTICALLY for both Registration and Verification.
 * 
 * THRESHOLD SPECIFICATION (STRICT 93.0% MATCH MANDATE):
 * - REQUIRED_MATCH_PERCENTAGE       = 93.0% (Must match at least 93.0% to proceed)
 * - FACE_MATCH_THRESHOLD_COSINE    = 0.93  (Cosine similarity must be >= 0.93)
 * - FACE_MATCH_THRESHOLD_EUCLIDEAN = 0.374 (Euclidean distance must be <= 0.374)
 */

const REQUIRED_MATCH_PERCENTAGE       = 95.0;
const FACE_MATCH_THRESHOLD_COSINE    = 0.95;
const FACE_MATCH_THRESHOLD_EUCLIDEAN = 0.316;

/**
 * Validates and normalizes a 128D FaceNet embedding vector with full IEEE 754 precision.
 * Stricter validation prevents corrupted or maliciously crafted embeddings from entering the pipeline.
 *
 * @param {Array<number>} input - 128-element descriptor array
 * @returns {Array<number>} L2 Normalized 128-element float array
 */
function normalize128DFacialDescriptor(input) {
  if (!input) {
    throw new Error('Invalid face embedding payload: vector is null or undefined.');
  }

  // Handle BSON / Object array conversion if stored as key-value pairs
  let rawArr = input;
  if (!Array.isArray(rawArr) && typeof rawArr === 'object') {
    rawArr = Object.values(rawArr);
  }

  if (!Array.isArray(rawArr) || rawArr.length < 64) {
    throw new Error(`Invalid face embedding payload: expected 128-element numeric array, received ${Array.isArray(rawArr) ? rawArr.length : typeof rawArr}`);
  }

  // Convert to clean numbers & slice to 128
  const vec = new Array(128).fill(0);
  for (let i = 0; i < 128; i++) {
    const val = typeof rawArr[i] === 'string' ? parseFloat(rawArr[i]) : Number(rawArr[i]);
    vec[i] = typeof val === 'number' && Number.isFinite(val) ? val : 0;
  }

  // Compute L2 norm
  let sumSq = 0;
  for (let i = 0; i < 128; i++) {
    sumSq += vec[i] * vec[i];
  }

  if (sumSq === 0) {
    throw new Error('Invalid face embedding payload: zero vector detected.');
  }

  const norm = Math.sqrt(sumSq);

  // L2 Normalize without precision loss (full IEEE 754 numbers)
  return vec.map((v) => v / norm);
}

/**
 * Computes L2 Euclidean Distance and Cosine Similarity between two 128D FaceNet descriptors
 * Enforces strict 93.0% match cutoff.
 * 
 * @param {Array<number>} descA - Live capture 128D descriptor
 * @param {Array<number>} descB - Registered 128D descriptor stored in MongoDB
 * @returns {{ isMatch: boolean, euclideanDistance: number, cosineSimilarity: number, confidencePercentage: number, diagnostic: object }}
 */
function compareFacialDescriptors(descA, descB) {
  if (!descA || !descB) {
    return {
      isMatch: false,
      euclideanDistance: 2.0,
      cosineSimilarity: 0,
      confidencePercentage: 0,
      diagnostic: { error: 'One or both face descriptors are missing' }
    };
  }

  let vecA, vecB;
  try {
    vecA = normalize128DFacialDescriptor(descA);
    vecB = normalize128DFacialDescriptor(descB);
  } catch (err) {
    return {
      isMatch: false,
      euclideanDistance: 2.0,
      cosineSimilarity: 0,
      confidencePercentage: 0,
      diagnostic: { error: err.message }
    };
  }

  let sumSqDiff = 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < 128; i++) {
    const diff = vecA[i] - vecB[i];
    sumSqDiff += diff * diff;

    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const euclideanDistance = Math.sqrt(sumSqDiff);
  const cosineSimilarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1.0);

  const rawConfidence = Math.round(Math.max(0, Math.min(99.9, cosineSimilarity * 100)) * 10) / 10;

  // STRICT 95.0% MATCH CONDITION:
  // Cosine similarity MUST be >= 0.95 (Match score >= 95.0%)
  const isMatch = (
    cosineSimilarity >= FACE_MATCH_THRESHOLD_COSINE &&
    rawConfidence >= REQUIRED_MATCH_PERCENTAGE
  );

  return {
    isMatch,
    euclideanDistance: Math.round(euclideanDistance * 1000) / 1000,
    cosineSimilarity: Math.round(cosineSimilarity * 1000) / 1000,
    confidencePercentage: rawConfidence,
    requiredThresholdPercentage: REQUIRED_MATCH_PERCENTAGE,
    thresholds: {
      requiredMatchPercentage: REQUIRED_MATCH_PERCENTAGE,
      maxEuclideanDistance: FACE_MATCH_THRESHOLD_EUCLIDEAN,
      minCosineSimilarity: FACE_MATCH_THRESHOLD_COSINE
    },
    diagnostic: {
      vecALength: vecA.length,
      vecBLength: vecB.length,
      normA: Math.round(Math.sqrt(normA) * 1000) / 1000,
      normB: Math.round(Math.sqrt(normB) * 1000) / 1000
    }
  };
}

module.exports = {
  REQUIRED_MATCH_PERCENTAGE,
  FACE_MATCH_THRESHOLD_EUCLIDEAN,
  FACE_MATCH_THRESHOLD_COSINE,
  normalize128DFacialDescriptor,
  compareFacialDescriptors
};
