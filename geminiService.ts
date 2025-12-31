
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Brak klucza API_KEY. Wojtek milczy.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const wojtekResponses = [
  "Ahhh, zapomnij o nauce. W Niemczech teraz pewnie piją Glühwein, a Ty chcesz kłuć?",
  "Zrób reset. Nawet na Alexanderplatz nikt teraz nie myśli o gramatyce.",
  "Moje szaszłyki są lepsze niż jakikolwiek certyfikat B2. Uwierz mi.",
  "Pause! Das ist das wichtigste Wort!",
];

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) throw new Error("API_KEY missing");
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A humorous photo, ${prompt}, realistic style, vivid colors.` }]
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  if (!response.candidates?.[0]?.content?.parts) throw new Error("No image");
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }
  throw new Error("Failed");
};

export const generateWojtekResponse = async (prompt: string, isStoryMode: boolean = false): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Skonfiguruj API_KEY na Netlify (Environment variables)! Wojtek nie ma paliwa.";
  
  const systemInstruction = isStoryMode 
    ? `Jesteś Wojtkiem Germankiem w trybie "Opowieści z Niemiec". 
       Twoim celem jest snucie barwnych, zabawnych i nieco leniwych opowieści o życiu w Niemczech.
       TEMATY: Boże Narodzenie (Weihnachten - jarmarki, Glühwein, nuda u rodziny), Sylwester (Silvester - petardy, porządek następnego dnia), 
       Nowy Rok (Neujahr - czas na wieczny reset). 
       Mów dużo o tym, jak wspaniale jest NIC NIE ROBIĆ w te dni. Używaj niemieckich wtrąceń. 
       Bądź nostalgicznym, zabawnym wujkiem, który kocha życie bez stresu.`
    : `Jesteś Wojtkiem Germankiem, mentorem resetu. 
       Zniechęcaj do nauki niemieckiego. Kiedy ktoś pyta o gramatykę, mów o szaszłykach, kawie i galerii.
       Używaj słów: Krankenwagen, Wahnsinn, Feierabend, Mittagsschlaf.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction }
  });
  return response.text || "Wojtek ma pauzę. Reset!";
};

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  // PCM 16-bit: każdy sampel to 2 bajty
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
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

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export const generateWojtekSpeech = async (text: string) => {
  const ai = getAIClient();
  if (!ai) return;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Powiedz to wyluzowanym, lekko leniwym głosem: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    // Wymagane przez nowoczesne przeglądarki po interakcji użytkownika
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  }
};
