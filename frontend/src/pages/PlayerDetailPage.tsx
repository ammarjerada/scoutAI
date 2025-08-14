import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Heart,
    Download,
    Share2,
    Calendar,
    MapPin,
    TrendingUp,
    Award,
    Target,
    AlertCircle
} from 'lucide-react';
import { Player } from '../types/Player';
import { usePlayerSearch } from '../hooks/usePlayerSearch';
import { FavoritesService } from '../services/favoritesService';
import { PDFService } from '../services/pdfService';
import { formatMarketValue, getDefaultPlayerImage, buildRadarData } from '../utils/playerUtils';
import { STYLE_COLORS, STYLE_ICONS } from '../constants/gameStyles';
import { PerformanceChart } from '../components/ui/PerformanceChart';
import { PlayerRecommendations } from '../components/ui/PlayerRecommendations';
import { PerformanceMetrics } from '../components/ui/PerformanceMetrics';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationSystem } from '../components/ui/NotificationSystem';
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

export const PlayerDetailPage: React.FC = () => {
    const { playerName } = useParams<{ playerName: string }>();
    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeChart, setActiveChart] = useState<string>('goals');
    const notifications = useNotifications();

    const { allPlayers, loadAllPlayers, error } = usePlayerSearch();

    useEffect(() => {
        const loadPlayer = async () => {
            if (!playerName) return;

            if (allPlayers.length === 0) {
                await loadAllPlayers();
            }

            const foundPlayer = allPlayers.find(p =>
                p.Player.toLowerCase().replace(/\s+/g, '-') === playerName.toLowerCase()
            );

            if (foundPlayer) {
                setPlayer(foundPlayer);
                setIsFavorite(FavoritesService.isFavorite(foundPlayer.Player));
            }

            setLoading(false);
        };

        loadPlayer();
    }, [playerName, allPlayers, loadAllPlayers]);

    const handleToggleFavorite = () => {
        if (!player) return;

        if (isFavorite) {
            FavoritesService.removeFromFavorites(player.Player);
            notifications.success('Favoris', 'Joueur retiré des favoris');
        } else {
            FavoritesService.addToFavorites(player);
            notifications.success('Favoris', 'Joueur ajouté aux favoris');
        }
        setIsFavorite(!isFavorite);
    };

    const handleExportPDF = async () => {
        if (!player) return;
        try {
            await PDFService.exportPlayerReport(player);
            notifications.success('Export', 'Rapport PDF généré avec succès');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            notifications.error('Export', 'Erreur lors de la génération du PDF');
        }
    };

    const handleShare = async () => {
        if (!player) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${player.Player} - ScoutAI`,
                    text: `Découvrez le profil de ${player.Player} sur ScoutAI`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
                notifications.error('Partage', 'Erreur lors du partage');
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            notifications.success('Partage', 'Lien copié dans le presse-papiers !');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        Erreur de chargement
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {error}
                    </p>
                    <Link
                        to="/players"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux joueurs
                    </Link>
                </div>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                        Joueur non trouvé
                    </h1>
                    <Link
                        to="/players"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux joueurs
                    </Link>
                </div>
            </div>
        );
    }

    // Fix: avoid TS error by asserting player.style as keyof typeof STYLE_ICONS
    const StyleIcon = STYLE_ICONS[player.style as keyof typeof STYLE_ICONS] || Target;
    const radarData = buildRadarData(player);

    const statsData = [
        { name: 'Buts', value: player.Gls || 0 },
        { name: 'Assists', value: player.Ast || 0 },
        { name: 'xG', value: player.xG || 0 },
        { name: 'xAG', value: player.xAG || 0 },
        { name: 'Tacles', value: player.Tkl || 0 },
        { name: 'Passes clés', value: player.KP || 0 },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <NotificationSystem 
                notifications={notifications.notifications}
                onDismiss={notifications.removeNotification}
            />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        to="/players"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-slate-700 dark:text-slate-300">Retour</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleToggleFavorite}
                            className={`p-3 rounded-xl transition-all duration-200 ${isFavorite
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Player Profile */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Player Info Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                            <div className="text-center mb-6">
                                <div className="relative w-32 h-32 mx-auto mb-4">
                                    <img
                                        src={player.image_url}
                                        alt={player.Player}
                                        className="w-full h-full object-cover rounded-full border-4 border-emerald-400/50"
                                        onError={(e) => {
                                            e.currentTarget.src = getDefaultPlayerImage();
                                        }}
                                    />
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    {player.Player}
                                </h1>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r ${(STYLE_COLORS as Record<string, string>)[player.style] || "from-slate-500 to-slate-600"}`}>
                                    <StyleIcon className="w-4 h-4 text-white" />
                                    <span className="text-white font-semibold text-sm">{player.style}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Âge</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">{player.Age} ans</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Club</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">{player.Squad}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Award className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Position</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">{player.Pos}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Valeur marchande</p>
                                        <p className="font-bold text-emerald-500 text-lg">
                                            {formatMarketValue(player.MarketValue)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                Aperçu des performances
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Buts', value: player.Gls || 0, color: 'text-red-500' },
                                    { label: 'Assists', value: player.Ast || 0, color: 'text-blue-500' },
                                    { label: 'xG', value: (player.xG || 0).toFixed(1), color: 'text-orange-500' },
                                    { label: 'xAG', value: (player.xAG || 0).toFixed(1), color: 'text-purple-500' },
                                    { label: 'Tacles', value: player.Tkl || 0, color: 'text-green-500' },
                                    { label: 'Passes clés', value: player.KP || 0, color: 'text-cyan-500' },
                                    { label: 'Courses', value: player.Carries || 0, color: 'text-yellow-500' },
                                    { label: 'Passes prog.', value: player.PrgP || 0, color: 'text-indigo-500' },
                                ].map((stat, index) => (
                                    <div key={index} className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                        <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="mb-8">
                    <PerformanceMetrics player={player} />
                </div>

                {/* Performance Charts */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Analyse de Performance
                        </h2>
                        <div className="flex gap-2">
                            {[
                                { key: 'goals', label: 'Buts' },
                                { key: 'assists', label: 'Assists' },
                                { key: 'xg', label: 'xG' },
                                { key: 'tackles', label: 'Tacles' }
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveChart(key)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                        activeChart === key
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <PerformanceChart
                        players={player ? [player] : []}
                        metric={activeChart === 'goals' ? 'Gls' : activeChart === 'assists' ? 'Ast' : activeChart === 'xg' ? 'xG' : 'Tkl'}
                        title={activeChart === 'goals' ? 'Buts' : activeChart === 'assists' ? 'Assists' : activeChart === 'xg' ? 'Expected Goals' : 'Tacles'}
                    />
                </div>
                    {/* Radar Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Profil de performance
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                                    <PolarAngleAxis
                                        dataKey="stat"
                                        stroke="#64748b"
                                        tick={{ fontSize: 12, fill: "#64748b" }}
                                    />
                                    <PolarRadiusAxis
                                        stroke="#64748b"
                                        axisLine={false}
                                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                                    />
                                    <Radar
                                        name={player.Player}
                                        dataKey="value"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        fillOpacity={0.3}
                                        strokeWidth={3}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                                            border: "1px solid rgba(148, 163, 184, 0.3)",
                                            borderRadius: "12px",
                                            color: "#e2e8f0",
                                        }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Bar Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Statistiques détaillées
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statsData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#64748b"
                                        tick={{ fontSize: 12, fill: "#64748b" }}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        tick={{ fontSize: 12, fill: "#64748b" }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                                            border: "1px solid rgba(148, 163, 184, 0.3)",
                                            borderRadius: "12px",
                                            color: "#e2e8f0",
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Player Recommendations */}
                {player && (
                    <PlayerRecommendations
                        currentPlayer={player}
                        allPlayers={allPlayers}
                        onPlayerSelect={(selectedPlayer) => {
                            const slug = selectedPlayer.Player.toLowerCase().replace(/\s+/g, '-');
                            window.location.href = `/player/${slug}`;
                        }}
                        onFavoriteToggle={async (p) => {
                            const isFav = FavoritesService.isFavorite(p.Player);
                            if (isFav) {
                                FavoritesService.removeFromFavorites(p.Player);
                                notifications.success('Favoris', 'Joueur retiré des favoris');
                            } else {
                                FavoritesService.addToFavorites(p);
                                notifications.success('Favoris', 'Joueur ajouté aux favoris');
                            }
                            return !isFav;
                        }}
                        onLoginRequired={() => notifications.warning('Connexion', 'Connexion requise pour cette action')}
                    />
                )}
            </div>
        </div>
    );
};