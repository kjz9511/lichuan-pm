// 通用 AI Hook — 调用内置 Forge API（OpenAI 兼容接口）
// 支持流式和非流式两种模式
import { useState, useCallback } from 'react';

const FORGE_BASE_URL =
  (import.meta.env.VITE_FRONTEND_FORGE_API_URL as string) ||
  'https://forge.butterfly-effect.dev';
const FORGE_API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY as string;
const CHAT_URL = `${FORGE_BASE_URL}/v1/chat/completions`;

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface UseAIOptions {
  model?: string;
  temperature?: number;
  stream?: boolean;
}

export function useAI(options: UseAIOptions = {}) {
  const { model = 'gpt-4o-mini', temperature = 0.4, stream = true } = options;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (messages: AIMessage[], onChunk?: (chunk: string) => void): Promise<string> => {
      setLoading(true);
      setResult('');
      setError(null);
      let fullText = '';

      try {
        const res = await fetch(CHAT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${FORGE_API_KEY}`,
          },
          body: JSON.stringify({ model, temperature, stream, messages }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`AI 请求失败 (${res.status}): ${errText}`);
        }

        if (stream) {
          const reader = res.body!.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
            for (const line of lines) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || '';
                if (delta) {
                  fullText += delta;
                  setResult(fullText);
                  onChunk?.(delta);
                }
              } catch {}
            }
          }
        } else {
          const json = await res.json();
          fullText = json.choices?.[0]?.message?.content || '';
          setResult(fullText);
        }

        return fullText;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        return '';
      } finally {
        setLoading(false);
      }
    },
    [model, temperature, stream]
  );

  const reset = useCallback(() => {
    setResult('');
    setError(null);
  }, []);

  return { run, loading, result, error, reset };
}
