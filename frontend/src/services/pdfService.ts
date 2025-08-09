import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Player } from '../types/Player';
import { formatMarketValue } from '../utils/playerUtils';

export class PDFService {
    static async exportPlayerReport(player: Player): Promise<void> {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();

        // Header
        pdf.setFontSize(20);
        pdf.setTextColor(16, 185, 129); // emerald-500
        pdf.text('ScoutAI - Rapport de Joueur', 20, 30);

        // Player info
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Joueur: ${player.Player}`, 20, 50);

        pdf.setFontSize(12);
        pdf.text(`Âge: ${player.Age} ans`, 20, 65);
        pdf.text(`Position: ${player.Pos}`, 20, 75);
        pdf.text(`Club: ${player.Squad}`, 20, 85);
        pdf.text(`Style de jeu: ${player.style}`, 20, 95);
        pdf.text(`Valeur marchande: ${formatMarketValue(player.MarketValue)}`, 20, 105);

        // Statistics
        pdf.setFontSize(14);
        pdf.text('Statistiques:', 20, 125);

        const stats = [
            { label: 'Buts', value: player.Gls },
            { label: 'Assists', value: player.Ast },
            { label: 'xG (Expected Goals)', value: player.xG },
            { label: 'xAG (Expected Assists)', value: player.xAG },
            { label: 'Tacles', value: player.Tkl },
            { label: 'Passes progressives', value: player.PrgP },
            { label: 'Courses avec ballon', value: player.Carries },
            { label: 'Passes clés', value: player.KP }
        ];

        let yPos = 140;
        pdf.setFontSize(10);
        stats.forEach(stat => {
            pdf.text(`${stat.label}: ${stat.value || 0}`, 25, yPos);
            yPos += 10;
        });

        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} par ScoutAI`, 20, 280);

        // Save
        pdf.save(`ScoutAI_${player.Player.replace(/\s+/g, '_')}_Report.pdf`);
    }

    static async exportComparisonReport(players: [Player, Player]): Promise<void> {
        const pdf = new jsPDF();

        // Header
        pdf.setFontSize(20);
        pdf.setTextColor(16, 185, 129);
        pdf.text('ScoutAI - Comparaison de Joueurs', 20, 30);

        // Player 1
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Joueur 1: ${players[0].Player}`, 20, 50);
        pdf.setFontSize(10);
        pdf.text(`${players[0].Age} ans | ${players[0].Pos} | ${players[0].Squad}`, 20, 60);
        pdf.text(`Valeur: ${formatMarketValue(players[0].MarketValue)}`, 20, 70);

        // Player 2
        pdf.setFontSize(14);
        pdf.text(`Joueur 2: ${players[1].Player}`, 110, 50);
        pdf.setFontSize(10);
        pdf.text(`${players[1].Age} ans | ${players[1].Pos} | ${players[1].Squad}`, 110, 60);
        pdf.text(`Valeur: ${formatMarketValue(players[1].MarketValue)}`, 110, 70);

        // Comparison table
        pdf.setFontSize(12);
        pdf.text('Comparaison des statistiques:', 20, 90);

        const stats = [
            { label: 'Buts', key: 'Gls' },
            { label: 'Assists', key: 'Ast' },
            { label: 'xG', key: 'xG' },
            { label: 'xAG', key: 'xAG' },
            { label: 'Tacles', key: 'Tkl' },
            { label: 'Passes clés', key: 'KP' }
        ];

        let yPos = 105;
        pdf.setFontSize(10);

        // Table header
        pdf.text('Statistique', 20, yPos);
        pdf.text(players[0].Player.substring(0, 15), 80, yPos);
        pdf.text(players[1].Player.substring(0, 15), 140, yPos);
        yPos += 10;

        // Table rows
        stats.forEach(stat => {
            const val1 = players[0][stat.key as keyof Player] || 0;
            const val2 = players[1][stat.key as keyof Player] || 0;

            pdf.text(stat.label, 20, yPos);
            pdf.text(String(val1), 80, yPos);
            pdf.text(String(val2), 140, yPos);
            yPos += 10;
        });

        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} par ScoutAI`, 20, 280);

        // Save
        pdf.save(`ScoutAI_Comparaison_${players[0].Player}_vs_${players[1].Player}.pdf`.replace(/\s+/g, '_'));
    }

    static async exportFavoritesReport(favorites: any[]): Promise<void> {
        const pdf = new jsPDF();

        // Header
        pdf.setFontSize(20);
        pdf.setTextColor(16, 185, 129);
        pdf.text('ScoutAI - Mes Joueurs Favoris', 20, 30);

        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${favorites.length} joueur(s) dans vos favoris`, 20, 45);

        let yPos = 60;

        favorites.forEach((favorite, index) => {
            if (yPos > 250) {
                pdf.addPage();
                yPos = 30;
            }

            const player = favorite.player;

            pdf.setFontSize(14);
            pdf.text(`${index + 1}. ${player.Player}`, 20, yPos);

            pdf.setFontSize(10);
            pdf.text(`${player.Age} ans | ${player.Pos} | ${player.Squad}`, 25, yPos + 10);
            pdf.text(`Valeur: ${formatMarketValue(player.MarketValue)} | Style: ${player.style}`, 25, yPos + 20);

            if (favorite.notes) {
                pdf.text(`Notes: ${favorite.notes}`, 25, yPos + 30);
                yPos += 45;
            } else {
                yPos += 35;
            }
        });

        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} par ScoutAI`, 20, 280);

        pdf.save('ScoutAI_Mes_Favoris.pdf');
    }
}