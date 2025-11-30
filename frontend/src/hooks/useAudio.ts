import { useState, useCallback, useRef } from 'react';
import apiClient from '../services/apiClient';

export const useAudio = () => {
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateAudio = useCallback(
    async (text: string, character: string) => {
      if (!text || !character) {
        setError(new Error('Text and character are required'));
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.post('/tts', {
          text,
          character,
        });

        if (response.data.success) {
          setAudioUrl(response.data.data.audioUrl);
          return response.data.data.audioUrl;
        } else {
          throw new Error(response.data.error.message);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to generate audio';
        setError(new Error(errorMsg));
        setAudioUrl('');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const playAudio = useCallback(async (audioUrl: string) => {
    if (!audioUrl || !audioRef.current) return;

    try {
      audioRef.current.src = audioUrl;
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play audio:', err);
      setError(err instanceof Error ? err : new Error('Failed to play audio'));
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return {
    audioUrl,
    audioRef,
    loading,
    error,
    isPlaying,
    generateAudio,
    playAudio,
    stopAudio,
    handleAudioEnded,
  };
};
