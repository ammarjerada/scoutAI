import React from 'react';
import { Users } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center">
          <Users className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">
          Aucun joueur trouvé
        </h3>
        <p className="text-slate-400">
          Modifiez vos critères de recherche pour découvrir des talents
        </p>
      </div>
    </div>
  );
};