
import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

// Implementation of required audio helper functions as per @google/genai documentation
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LiveView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Gotowy do połączenia');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startLive = useCallback(async () => {
    try {
      setStatus('Łączenie z Gemini Live...');
      setIsActive(true);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputAudioContext;
      nextStartTimeRef.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('Połączono! Możesz mówić.');
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              // CRITICAL: Always use sessionPromise to avoid race conditions and stale closures
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64EncodedAudioString = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              // Schedule gapless playback
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                outputAudioContext.currentTime,
              );
              
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                outputAudioContext,
                24000,
                1,
              );
              
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle interruption signal
            const interrupted = msg.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error(e);
            setStatus('Błąd połączenia.');
            setIsActive(false);
          },
          onclose: () => {
            setStatus('Połączenie zamknięte.');
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: 'Jesteś Wojtkiem Germankiem, mistrzem resetu. Rozmawiasz po polsku w sposób skrajnie nieambitny i humorystyczny. Zachęcaj do przerwania nauki i robienia resetu.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Błąd: Brak uprawnień do mikrofonu.');
      setIsActive(false);
    }
  }, []);

  const stopLive = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
    setStatus('Gotowy do połączenia');
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-950 to-blue-950/20">
      <div className="w-full max-w-md space-y-12 text-center">
        <div className="relative inline-block">
          <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${isActive ? 'bg-blue-500/40 animate-pulse scale-150' : 'bg-blue-500/5'}`}></div>
          <div className={`relative w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${isActive ? 'border-blue-400 shadow-[0_0_50px_rgba(59,130,246,0.5)] scale-110' : 'border-white/10'}`}>
            <i className={`fa-solid fa-microphone text-5xl transition-all ${isActive ? 'text-blue-400' : 'text-gray-700'}`}></i>
          </div>
          {isActive && (
            <div className="absolute -inset-4 border border-blue-400/30 rounded-full animate-ping"></div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Live <span className="gradient-text">Voice</span></h2>
          <p className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
            {status}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          {!isActive ? (
            <button
              onClick={startLive}
              className="px-8 py-4 bg-white text-gray-950 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all flex items-center gap-3 shadow-xl shadow-white/5"
            >
              <i className="fa-solid fa-play"></i>
              Rozpocznij Rozmowę
            </button>
          ) : (
            <button
              onClick={stopLive}
              className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-500 transition-all flex items-center gap-3 shadow-xl shadow-red-500/20"
            >
              <i className="fa-solid fa-stop"></i>
              Zatrzymaj
            </button>
          )}
        </div>

        <div className="p-6 glass rounded-2xl border border-white/5 text-xs text-gray-500 leading-relaxed text-left">
          <p className="flex items-start gap-3">
            <i className="fa-solid fa-info-circle text-blue-400 mt-0.5"></i>
            Ta funkcja wymaga dostępu do mikrofonu i korzysta z modelu Gemini 2.5 Flash Native Audio dla zapewnienia minimalnych opóźnień.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveView;
