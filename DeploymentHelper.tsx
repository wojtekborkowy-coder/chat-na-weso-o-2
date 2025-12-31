
import React, { useState } from 'react';

const DeploymentHelper: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [previews, setPreviews] = useState({
    szaszlyk: localStorage.getItem('user_szaszlyk'),
    egzamin: localStorage.getItem('user_egzamin')
  });

  const compressAndSave = (file: File, type: 'szaszlyk' | 'egzamin') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        try {
          const storageKey = type === 'szaszlyk' ? 'user_szaszlyk' : 'user_egzamin';
          localStorage.setItem(storageKey, dataUrl);
          setPreviews(prev => ({ ...prev, [type]: dataUrl }));
          setStatus(`Zapisano ${type}!`);
          setTimeout(() => setStatus(null), 2000);
        } catch (err) {
          alert("Błąd zapisu. Spróbuj mniejszego zdjęcia.");
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'szaszlyk' | 'egzamin') => {
    const file = e.target.files?.[0];
    if (file) compressAndSave(file, type);
  };

  const hardRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 pb-32">
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Centrum <span className="gradient-text">Personalizacji</span></h2>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
            Wgraj zdjęcia tutaj. Jeśli nie działają w Galerii, kliknij przycisk odświeżenia obok.
          </p>
        </div>
        <button 
          onClick={hardRefresh}
          className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-gray-400 group"
          title="Odśwież stronę"
        >
          <i className="fa-solid fa-rotate group-hover:rotate-180 transition-transform duration-500"></i>
        </button>
      </div>

      {status && (
        <div className="fixed top-10 right-10 bg-yellow-500 text-black px-6 py-4 rounded-2xl font-black shadow-2xl z-50 uppercase text-xs border-4 border-black">
          {status}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="group cursor-pointer block">
            <div className={`relative aspect-square rounded-[40px] border-4 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 ${previews.szaszlyk ? 'border-yellow-500/50' : 'border-white/10 bg-white/5 hover:border-yellow-500/30'}`}>
              {previews.szaszlyk ? (
                <img src={previews.szaszlyk} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                   <i className="fa-solid fa-camera text-3xl text-gray-700 mb-2"></i>
                   <p className="text-[9px] font-black uppercase text-gray-600">Dodaj Szaszłyk</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'szaszlyk')} />
            </div>
          </label>
        </div>

        <div className="space-y-4">
          <label className="group cursor-pointer block">
            <div className={`relative aspect-square rounded-[40px] border-4 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 ${previews.egzamin ? 'border-blue-500/50' : 'border-white/10 bg-white/5 hover:border-blue-500/30'}`}>
              {previews.egzamin ? (
                <img src={previews.egzamin} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                   <i className="fa-solid fa-school text-3xl text-gray-700 mb-2"></i>
                   <p className="text-[9px] font-black uppercase text-gray-600">Dodaj Salę</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'egzamin')} />
            </div>
          </label>
        </div>
      </div>
      
      <div className="glass p-8 rounded-[30px] border border-white/5 text-[11px] text-gray-500 uppercase font-bold tracking-widest leading-relaxed">
        <p className="text-white mb-2">Wskazówka Netlify:</p>
        Jeśli po wgraniu zdjęć nadal ich nie widzisz, upewnij się, że nie jesteś w trybie incognito (który czyści pamięć). <br/>
        Twoje zdjęcia są bezpieczne w "LocalStorage" Twojej przeglądarki.
      </div>
    </div>
  );
};

export default DeploymentHelper;
