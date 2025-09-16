import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PropTypes from 'prop-types';

const AdminVoiceRecorder = ({ isOpen, onSendVoice, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const chunksRef = useRef([]);
  
  const { toast } = useToast();

  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to record voice messages.',
        variant: 'destructive',
      });
      onClose();
    }
  }, [toast, onClose]);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setIsRecording(false);
    setIsPaused(false);
    setIsPlaying(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setCurrentTime(0);
    setDuration(0);
  }, [audioUrl]);

  useEffect(() => {
    if (isOpen) {
      requestMicrophonePermission();
    } else {
      cleanup();
    }
  }, [isOpen, requestMicrophonePermission, cleanup]);

  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        await requestMicrophonePermission();
      }

      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Failed to start recording. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const sendVoiceMessage = () => {
    if (audioBlob) {
      onSendVoice(audioBlob);
      cleanup();
      onClose();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80 z-50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Voice Recorder
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!audioBlob ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {formatTime(recordingTime)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Ready to record'}
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600"
                >
                  <Mic className="h-6 w-6" />
                </Button>
              ) : (
                <>
                  <Button
                    onClick={pauseRecording}
                    variant="outline"
                    className="h-12 w-12 rounded-full"
                  >
                    {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
                  </Button>
                  <Button
                    onClick={stopRecording}
                    className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600"
                  >
                    <Square className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Voice Message Ready
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Duration: {formatTime(duration)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={handleAudioEnded}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />

            <div className="flex justify-center space-x-4">
              <Button
                onClick={playRecording}
                variant="outline"
                className="h-10 px-4"
              >
                {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                onClick={sendVoiceMessage}
                className="h-10 px-4 bg-blue-500 hover:bg-blue-600"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

AdminVoiceRecorder.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onSendVoice: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AdminVoiceRecorder;
