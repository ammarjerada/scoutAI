import React, { useState } from 'react';
import { Download, FileText, Image, Table, Mail } from 'lucide-react';
import { Player, FavoritePlayer } from '../../types/Player';
import { PDFService } from '../../services/pdfService';

interface ExportOptionsProps {
  data: Player[] | FavoritePlayer[];
  type: 'players' | 'favorites' | 'comparison';
  onExport?: (format: string) => void;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({
  data,
  type,
  onExport
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const exportOptions = [
    {
      id: 'pdf',
      label: 'Rapport PDF',
      icon: FileText,
      description: 'Rapport détaillé avec graphiques',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'csv',
      label: 'Données CSV',
      icon: Table,
      description: 'Données brutes pour analyse',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'image',
      label: 'Image PNG',
      icon: Image,
      description: 'Capture d\'écran haute qualité',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'email',
      label: 'Envoyer par email',
      icon: Mail,
      description: 'Partager par email',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handleExport = async (format: string) => {
    setLoading(format);
    
    try {
      switch (format) {
        case 'pdf':
          if (type === 'favorites') {
            await PDFService.exportFavoritesReport(data as FavoritePlayer[]);
          } else if (type === 'comparison' && data.length >= 2) {
            await PDFService.exportComparisonReport([data[0] as Player, data[1] as Player]);
          } else if (data.length > 0) {
            await PDFService.exportPlayerReport(data[0] as Player);
          }
          break;
        
        case 'csv':
          exportToCSV();
          break;
          
        case 'image':
          await exportToImage();
          break;
          
        case 'email':
          openEmailClient();
          break;
      }
      
      onExport?.(format);
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setLoading(null);
    }
  };

  const exportToCSV = () => {
    const csvData = data.map(item => {
      const player = 'player' in item ? item.player : item;
      return {
        Nom: player.Player,
        Age: player.Age,
        Position: player.Pos,
        Club: player.Squad,
        Style: player.style,
        Valeur: player.MarketValue,
        Buts: player.Gls,
        Assists: player.Ast,
        xG: player.xG,
        xAG: player.xAG,
        Tacles: player.Tkl
      };
    });

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `scoutai_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToImage = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.querySelector('.players-grid') as HTMLElement;
    
    if (element) {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0f172a',
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = `scoutai_players_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const openEmailClient = () => {
    const subject = encodeURIComponent('ScoutAI - Rapport de joueurs');
    const body = encodeURIComponent(`
Voici mon rapport ScoutAI avec ${data.length} joueur(s) sélectionné(s).

Généré le ${new Date().toLocaleDateString('fr-FR')} via ScoutAI.
    `);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Exporter</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-4">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
            Options d'export
          </h4>
          
          <div className="space-y-2">
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option.id)}
                disabled={loading === option.id}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                  loading === option.id
                    ? 'bg-slate-100 dark:bg-slate-700 opacity-50 cursor-not-allowed'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${option.color}`}>
                  <option.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {option.description}
                  </div>
                </div>
                {loading === option.id && (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};