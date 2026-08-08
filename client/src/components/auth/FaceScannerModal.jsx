import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineXMark as CloseIcon,
  HiOutlineCamera as CamIcon,
  HiOutlineCheckCircle as CheckIcon,
  HiOutlineExclamationTriangle as WarnIcon,
  HiOutlineShieldCheck as ShieldIcon,
  HiOutlineArrowPath as RefreshIcon
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { loadFaceApiModels, analyzeWebcamFrame } from '../../utils/faceApiLoader';

const FaceScannerModal = ({ isOpen, onClose, mode = 'login', onSuccess }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionTimerRef = useRef(null);
  const isVerifyingLockRef = useRef(false);

  const [stream, setStream] = useState(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [authState, setAuthState] = useState('IDLE');
  const [statusMsg, setStatusMsg] = useState('Initializing ML face detector...');
  const [matchResult, setMatchResult] = useState(null);
  const [latestDescriptor, setLatestDescriptor] = useState(null);

  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      loadFaceApiModels()
        .then(() => { if (isMounted) setModelsReady(true); })
        .catch(() => { if (isMounted) setStatusMsg('Failed to load face detection models'); });
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  const startCamera = useCallback(async () => {
    try {
      setAuthState('CAMERA_STARTING');
      setStatusMsg('Starting camera...');
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setAuthState('SEARCHING_FOR_FACE');
          setStatusMsg(mode === 'register' ? 'Position face inside oval to Register' : 'Position face inside oval to Scan');
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setAuthState('FAILED');
      setStatusMsg('Camera access denied or unavailable');
      toast.error('Unable to access camera. Please allow webcam permissions.');
    }
  }, [mode, stream]);

  const stopCamera = useCallback(() => {
    if (detectionTimerRef.current) {
      clearInterval(detectionTimerRef.current);
      detectionTimerRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen && modelsReady) {
      startCamera();
    } else {
      stopCamera();
      setMatchResult(null);
    }
    return () => stopCamera();
  }, [isOpen, modelsReady]);

  // Detection loop
  useEffect(() => {
    if (!isOpen || !modelsReady || authState === 'IDLE' || authState === 'CAMERA_STARTING' || authState === 'AUTHENTICATED' || authState === 'VERIFYING') {
      if (detectionTimerRef.current) clearInterval(detectionTimerRef.current);
      return;
    }

    detectionTimerRef.current = setInterval(async () => {
      if (!videoRef.current || isVerifyingLockRef.current) return;

      const analysis = await analyzeWebcamFrame(videoRef.current, canvasRef.current);

      if (analysis.status === 'SEARCHING_FOR_FACE') {
        setAuthState('SEARCHING_FOR_FACE');
        setStatusMsg(analysis.message);
        setLatestDescriptor(null);
      } else if (analysis.status === 'QUALITY_CHECK_FAILED') {
        setAuthState('QUALITY_CHECK_FAILED');
        setStatusMsg(analysis.message);
        setLatestDescriptor(null);
      } else if (analysis.status === 'FACE_DETECTED' && analysis.qualityPassed) {
        setAuthState('FACE_DETECTED');
        setStatusMsg(analysis.message);
        setLatestDescriptor(analysis.descriptor);
      }
    }, 200);

    return () => {
      if (detectionTimerRef.current) clearInterval(detectionTimerRef.current);
    };
  }, [isOpen, modelsReady, authState]);

  const handleProcessScan = async () => {
    if (!latestDescriptor || latestDescriptor.length < 64) {
      toast.error('No valid face detected. Please position your face inside frame.');
      return;
    }

    isVerifyingLockRef.current = true;
    setAuthState('VERIFYING');
    setStatusMsg('Matching 128D FaceNet Embedding against MongoDB Profile...');

    try {
      if (mode === 'register') {
        const { data } = await axiosInstance.post('/face/register', { faceDescriptor: latestDescriptor });
        setAuthState('AUTHENTICATED');
        setMatchResult({ success: true, message: '128D Face Biometric Registered in MongoDB!' });
        toast.success('Face ID Registered in MongoDB!');
        if (onSuccess) onSuccess(data);
        setTimeout(() => onClose(), 1500);
      } else {
        const { data } = await axiosInstance.post('/face/login', { faceDescriptor: latestDescriptor });
        const resultData = data?.data || data;

        if (resultData?.tokens?.accessToken) {
          localStorage.setItem('accessToken', resultData.tokens.accessToken);
          localStorage.setItem('refreshToken', resultData.tokens.refreshToken || '');
          if (resultData.user) updateUser(resultData.user);

          setAuthState('AUTHENTICATED');
          setMatchResult({
            success: true,
            name: resultData.user?.name || resultData.user?.firstName || 'User',
            score: resultData.faceMatch?.confidencePercentage || 96.0
          });

          toast.success(`Face ID Authenticated! Welcome ${resultData.user?.firstName || ''}`);
          setTimeout(() => {
            onClose();
            navigate('/dashboard');
          }, 1200);
        } else {
          setAuthState('FAILED');
          setMatchResult({ success: false, message: 'Face Not Recognized' });
          setStatusMsg('Face Match Failed. Captured face does not match MongoDB profile.');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Face recognition failed';
      setAuthState('FAILED');
      setMatchResult({ success: false, message: msg });
      setStatusMsg(msg);
      toast.error(msg);
    } finally {
      isVerifyingLockRef.current = false;
    }
  };

  const handleRetry = () => {
    setMatchResult(null);
    setLatestDescriptor(null);
    isVerifyingLockRef.current = false;
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldIcon size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {mode === 'register' ? 'Enroll Face ID' : 'Face ID Authentication'}
                </h3>
                <p className="text-xs text-slate-400">MongoDB 128D FaceNet Verification</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          {/* Webcam Viewport */}
          <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className={`w-52 h-64 rounded-[50%] border-2 transition-all duration-300 ${
                authState === 'FACE_DETECTED'
                  ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.6)]'
                  : authState === 'QUALITY_CHECK_FAILED'
                  ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] border-dashed'
                  : authState === 'VERIFYING'
                  ? 'border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.6)] animate-pulse'
                  : authState === 'FAILED'
                  ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]'
                  : 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)] border-dashed'
              }`} />
            </div>

            {/* Overlay Status Badge */}
            <div className="absolute bottom-3 left-3 right-3 py-1.5 px-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-center text-xs font-semibold text-slate-200">
              {statusMsg}
            </div>
          </div>

          {/* Result Alert */}
          {matchResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-xl border flex items-center gap-3 text-sm ${
                matchResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {matchResult.success ? <CheckIcon size={20}/> : <WarnIcon size={20}/>}
              <div>
                <p className="font-semibold">{matchResult.message || (matchResult.success ? 'Verified' : 'Access Denied')}</p>
                {matchResult.score && <p className="text-xs opacity-80">Match Confidence: {matchResult.score}%</p>}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 flex gap-3">
            {authState === 'FAILED' ? (
              <button
                onClick={handleRetry}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <RefreshIcon size={18} /> Retry Face Scan
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessScan}
                  disabled={authState !== 'FACE_DETECTED' || isVerifyingLockRef.current}
                  className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {authState === 'VERIFYING' ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Verifying Embedding...</>
                  ) : (
                    <><CamIcon size={18}/> {mode === 'register' ? 'Capture & Register' : 'Scan & Login'}</>
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FaceScannerModal;
