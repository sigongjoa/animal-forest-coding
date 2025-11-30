import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export interface Content {
  id: string;
  character: string;
  topic: string;
  title: string;
  description: string;
  text: string;
  imageId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
}

export const useContent = (character: string, topic: string) => {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!character || !topic) {
      setContent(null);
      return;
    }

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(
          `/content/${encodeURIComponent(character)}/${topic}`
        );

        if (response.data.success) {
          setContent(response.data.data);
        } else {
          throw new Error(response.data.error.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [character, topic]);

  return { content, loading, error };
};
