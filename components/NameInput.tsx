
import React, { useState } from 'react';
import { UserPlus, Play, Users } from 'lucide-react';

interface NameInputProps {
  onStart: (names: string[]) => void;
  isRtl: boolean;
}

export const NameInput: React.FC<NameInputProps> = ({ onStart, isRtl }) => {
  const [text, setText] = useState('');

  const namesArray = text.split('\n').map(n => n.trim()).filter(n => n !== '');
  const count = namesArray.length;

  const handleSubmit = () => {
    if (count < 2) {
      alert(isRtl ? 'يرجى إدخال اسمين على الأقل' : 'Please enter at least 2 names');
      return;
    }
    onStart(namesArray);
  };

  return (
    <div className={`max-w-md mx-auto mt-8 px-6 ${isRtl ? 'text-right' : 'text-left'}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-white">
              {isRtl ? 'إعداد القرعة' : 'Tournament Setup'}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold">
            <Users className="w-3 h-3" />
            <span>{count}</span>
          </div>
        </div>
        
        <p className="text-gray-400 mb-4 text-xs">
          {isRtl 
            ? 'أدخل الأسماء (اسم واحد في كل سطر).' 
            : 'Enter names (one per line).'}
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          dir={isRtl ? 'rtl' : 'ltr'}
          placeholder={isRtl ? 'محمد\nأحمد\nخالد...' : 'Team Alpha\nTeam Beta...'}
          className={`w-full h-48 bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
        />

        <button
          onClick={handleSubmit}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-500/20"
        >
          <Play className="w-4 h-4" />
          {isRtl ? 'ابدأ القرعة' : 'Start Draw'}
        </button>
      </div>
    </div>
  );
};
