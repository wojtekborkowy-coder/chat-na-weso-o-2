
import React, { useState, useEffect } from 'react';
import { generateImage } from '../geminiService';

const GalleryView: React.FC = () => {
  const [images, setImages] = useState({
    szaszlyk: localStorage.getItem('user_szaszlyk') || './input_file_0.png',
    egzamin: localStorage.getItem('user_egzamin') || './input_file_1.png'
  });

  const [isGenerating, setIsGenerating] = useState({ szaszlyk: false, egzamin: false });

  // Monitoruj zmiany w localStorage (np. po wgraniu w innej zakładce)
  useEffect(() => {
    const refresh = () => {
      setImages({
        szaszlyk: localStorage.getItem('user_szaszlyk') || './input_file_0.png',
        egzamin: localStorage.getItem('user_egzamin') || './input_file_1.png'
      });
    };
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const handleImageError = async (type: 'szaszlyk' | 'egzamin') => {
    // Jeśli to jest wgrane zdjęcie i nie działa, to usuwamy je z widoku (prawdopodobnie uszkodzony base64)
    if (images[type].startsWith('data:')) {
      return;
    }

    // Jeśli nie ma pliku na serwerze, odpal AI
    if (isGenerating[type]) return; // Nie generuj dwa razy naraz

    setIsGenerating(prev => ({ ...prev, [type]: true }));
    try {
      const prompt = type === 'szaszlyk' 
        ? "a funny middle-aged man with glasses eating a huge meat skewer in a sunny park, laughing, cinematic lighting" 
        : "a middle-aged man with glasses laughing loudly in a silent university exam hall, other students staring, funny scene";
      
      const generatedUrl = await generateImage(prompt);
      setImages(prev => ({ ...prev, [type]: generatedUrl }));
    } catch (err) {
      console.error("AI Generation failed", err);
    } finally {
      setIsGenerating(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 pb-32">
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-black italic uppercase tracking-tighter gradient-text">Archiwum <span className="text-white">Resetu</span></h2>
        <p className="text-yellow-500 font-black uppercase tracking-[0.3em] text-xs">Prawdziwe dowody na to, że gramatyka nie ma znaczenia</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Renderowanie zdjęcia 1 */}
        <div className="space-y-6">
          <div className="relative rounded-[40px] overflow-hidden border-8 border-yellow-500/10 shadow-2xl aspect-[3/4] bg-gray-900">
            {isGenerating.szaszlyk ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <i className="fa-solid fa-wand-magic-sparkles text-yellow-500 text-4xl animate-spin"></i>
                <span className="text-[10px] font-black uppercase text-yellow-500">Wojtek maluje szaszłyk...</span>
              </div>
            ) : (
              <img 
                src={images.szaszlyk} 
                className="w-full h-full object-cover"
                onError={() => handleImageError('szaszlyk')}
              />
            )}
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <h3 className="text-2xl font-black text-white uppercase italic">Szaszłyk-Power</h3>
              <p className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest italic">
                {images.szaszlyk.startsWith('data:') ? 'Twoja Legenda' : 'Wizja Wojtka'}
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
          </div>
        </div>

        {/* Renderowanie zdjęcia 2 */}
        <div className="space-y-6">
          <div className="relative rounded-[40px] overflow-hidden border-8 border-blue-500/10 shadow-2xl aspect-[3/4] bg-gray-900">
            {isGenerating.egzamin ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <i className="fa-solid fa-spinner text-blue-500 text-4xl animate-spin"></i>
                <span className="text-[10px] font-black uppercase text-blue-500">Wojtek śmieje się na sali...</span>
              </div>
            ) : (
              <img 
                src={images.egzamin} 
                className="w-full h-full object-cover"
                onError={() => handleImageError('egzamin')}
              />
            )}
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <h3 className="text-2xl font-black text-white uppercase italic">Śmiech w Salonie Gier</h3>
              <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest italic">
                {images.egzamin.startsWith('data:') ? 'Twoja Legenda' : 'Wizja Wojtka'}
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryView;
