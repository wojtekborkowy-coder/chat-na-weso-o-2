
import React, { useState } from 'react';
import { generateImage } from './geminiService';
import { GeneratedImage } from './types';

const ImageView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const url = await generateImage(prompt);
      setHistory(prev => [{ url, prompt, timestamp: new Date() }, ...prev]);
      setPrompt('');
    } catch (error) {
      console.error(error);
      alert("Wojtek upuścił pędzel. Reset!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Wojtek <span className="gradient-text">Maluje</span></h2>
        <p className="text-gray-500 text-sm font-medium">Opisz co Wojtek ma namalować, żebyś Ty mógł zrobić reset.</p>
        
        <div className="relative group">
          <div className="absolute -inset-1 bg-yellow-500 rounded-3xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
          <div className="relative glass rounded-3xl border border-white/10 flex items-center p-2 pr-4 shadow-2xl">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Wojtek w Berlinie je wursta..."
              className="bg-transparent border-none focus:ring-0 flex-1 px-5 py-4 text-sm placeholder-gray-600 font-medium"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="bg-yellow-500 text-black px-8 py-3.5 rounded-2xl text-xs font-black hover:bg-yellow-400 transition-all disabled:opacity-30 flex items-center gap-2 shrink-0 shadow-lg shadow-yellow-500/20 uppercase italic"
            >
              {isGenerating ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  Szkicuje...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paint-brush"></i>
                  Maluj, Wojtek!
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {history.map((img, idx) => (
          <div key={idx} className="group glass rounded-[40px] border border-white/5 overflow-hidden hover:border-yellow-500/20 transition-all duration-700 shadow-2xl">
            <div className="aspect-square relative overflow-hidden bg-gray-900/50">
              <img src={img.url} alt={img.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <a 
                  href={img.url} 
                  download={`wojtek-art-${idx}.png`}
                  className="w-14 h-14 rounded-full bg-yellow-500 text-black flex items-center justify-center hover:scale-110 transition-all self-end shadow-2xl"
                >
                  <i className="fa-solid fa-download text-lg"></i>
                </a>
              </div>
            </div>
            <div className="p-8">
              <p className="text-sm font-bold text-gray-200 mb-2 italic">"{img.prompt}"</p>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Dzieło Wojtka • {img.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
        {history.length === 0 && !isGenerating && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center border-4 border-dashed border-white/5 rounded-[50px] text-gray-700 group hover:border-yellow-500/10 transition-colors">
             <i className="fa-solid fa-palette text-6xl mb-6 opacity-10 group-hover:text-yellow-500 transition-colors"></i>
             <p className="text-sm font-black uppercase tracking-widest opacity-30">Puste płótno. Wojtek czeka na muzę (albo kawę).</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageView;
