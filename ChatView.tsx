
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { generateWojtekResponse, generateWojtekSpeech } from '../geminiService';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: 'Siema, tu Wojtek. Chcesz żebym Cię zniechęcił do nauki, czy mam Ci opowiedzieć jak się robi prawdziwy reset w Niemczech podczas świąt i Sylwestra? Kliknij głośnik, żeby usłyszeć moją mądrość!', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const avatarImg = localStorage.getItem('user_szaszlyk') || './input_file_0.png';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await generateWojtekResponse(input, isStoryMode);
      const modelMsg: Message = { role: 'model', text: response, timestamp: new Date() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Wojtek ma *Kopfschmerzen*. Reset!", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = async (text: string, index: number) => {
    if (isSpeaking === index) return;
    setIsSpeaking(index);
    try {
      // Usunięcie gwiazdek z tekstu, żeby lektor nie czytał "gwiazdka kopfschmerzen gwiazdka"
      const cleanText = text.replace(/\*/g, '');
      await generateWojtekSpeech(cleanText);
    } catch (err) {
      console.error("Speech error", err);
    } finally {
      // Czas trwania animacji pulsu (zależny od długości tekstu w przybliżeniu)
      const duration = Math.min(text.length * 60, 5000); 
      setTimeout(() => setIsSpeaking(null), duration);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] relative overflow-hidden">
      {/* Wojtek Header */}
      <div className="px-6 py-4 bg-yellow-500/5 border-b border-yellow-500/10 flex items-center justify-between z-10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-[20px] bg-yellow-500 flex items-center justify-center text-black font-black border-2 border-black rotate-3 shadow-lg shadow-yellow-500/20 overflow-hidden relative group">
             <img 
               src={avatarImg} 
               className="w-full h-full object-cover opacity-40 absolute transition-opacity group-hover:opacity-100" 
               onError={(e) => e.currentTarget.style.display = 'none'}
             />
             <span className="relative z-10 text-xl">WB</span>
          </div>
          <div>
            <h3 className="text-base font-black text-yellow-500 uppercase italic leading-none mb-1">Wojtek Germanek</h3>
            <div className="flex gap-2">
               <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest transition-all ${isStoryMode ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-500/20 text-yellow-500'}`}>
                 {isStoryMode ? 'Tryb: Opowieści z DE 🎄' : 'Tryb: Mentor Resetu'}
               </span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsStoryMode(!isStoryMode)}
          className={`px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-xl uppercase tracking-widest italic flex items-center gap-2 ${isStoryMode ? 'bg-red-600 text-white scale-105' : 'bg-white text-black hover:bg-yellow-500'}`}
        >
          <i className={`fa-solid ${isStoryMode ? 'fa-holly-berry' : 'fa-beer-mug-empty'}`}></i>
          {isStoryMode ? 'Wróć do Resetu' : 'Feierabend Mode!'}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-10 z-10">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[30px] p-6 group ${
              msg.role === 'user' 
                ? 'bg-yellow-500 text-black font-bold shadow-xl rounded-tr-none' 
                : 'glass border border-white/10 text-gray-100 rounded-tl-none relative shadow-2xl'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
              
              <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-gray-500 uppercase italic">
                    {msg.role === 'model' ? (isStoryMode ? 'Gawędziarz Wojtek' : 'Wojciech Borkowy') : 'Resetowicz'}
                  </span>
                  {msg.role === 'model' && (
                    <button 
                      onClick={() => speakText(msg.text, i)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all border ${isSpeaking === i ? 'bg-yellow-500 border-black text-black scale-110 shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                      title="Posłuchaj Wojtka"
                    >
                      <i className={`fa-solid ${isSpeaking === i ? 'fa-volume-high animate-pulse' : 'fa-volume-low'}`}></i>
                      {isSpeaking === i && <span className="text-[8px] font-black uppercase">Mówię...</span>}
                    </button>
                  )}
                </div>
                <span className="text-[9px] opacity-20">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass border border-white/5 rounded-full px-6 py-3 flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce"></div>
              <span className="text-[10px] text-yellow-500 font-black uppercase">Wojtek wspomina...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 shrink-0 z-10">
        <div className="relative glass rounded-[35px] border border-white/10 overflow-hidden shadow-2xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isStoryMode ? "Zapytaj o życie w Niemczech, święta, Sylwestra..." : "Zadaj pytanie..."}
            className="w-full bg-transparent border-none focus:ring-0 p-6 pb-12 resize-none text-sm placeholder-gray-600 font-bold"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute bottom-4 right-4 px-6 py-2 bg-yellow-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-yellow-500/20"
          >
            Wyślij
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
