import React, { useState, useEffect } from 'react';
import {
    Users,
    TrendingUp,
    Award,
    Target,
    BarChart3,
    Activity,
    Star,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { ApiService } from '../services/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Cell,
    Area,
    AreaChart,
    Pie
} from 'recharts';

interface DashboardStats {
    totalPlayers: number;
    avgAge: number;
    avgMarketValue: number;
    topScorer: {
        name: string;
        goals: number;
        squad: string;
    };
    positionDistribution: Array<{ position: string; count: number }>;
    styleDistribution: Array<{ style: string; count: number }>;
    ageDistribution: Array<{ range: string; count: number }>;
    valueDistribution: Array<{ range: string; count: number }>;
}

export const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Charger tous les joueurs pour calculer les statistiques
            const allPlayers = await ApiService.filterPlayers({
                style: "",
                position: "",
                budget: "",
                minAge: "",
                maxAge: "",
                sort_order: "desc"
            });

            if (allPlayers.length === 0) {
                throw new Error('Aucune donnée disponible');
            }

            // Calculer les statistiques
            const totalPlayers = allPlayers.length;
            const avgAge = allPlayers.reduce((sum, p) => sum + (p.Age || 0), 0) / totalPlayers;
            const avgMarketValue = allPlayers.reduce((sum, p) => sum + (p.MarketValue || 0), 0) / totalPlayers;
            const topScorer = allPlayers.reduce((max, p) => (p.Gls || 0) > (max.Gls || 0) ? p : max, allPlayers[0]);

            // Distribution par position
            const positionCounts = allPlayers.reduce((acc, player) => {
                const pos = player.Pos || 'Unknown';
                acc[pos] = (acc[pos] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const positionDistribution = Object.entries(positionCounts).map(([position, count]) => ({
                position,
                count
            }));

            // Distribution par style
            const styleCounts = allPlayers.reduce((acc, player) => {
                const style = player.style || 'Non défini';
                acc[style] = (acc[style] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const styleDistribution = Object.entries(styleCounts).map(([style, count]) => ({
                style,
                count
            }));

            // Distribution par âge
            const ageRanges = {
                '16-20': 0,
                '21-25': 0,
                '26-30': 0,
                '31-35': 0,
                '36+': 0
            };

            allPlayers.forEach(player => {
                const age = player.Age || 0;
                if (age <= 20) ageRanges['16-20']++;
                else if (age <= 25) ageRanges['21-25']++;
                else if (age <= 30) ageRanges['26-30']++;
                else if (age <= 35) ageRanges['31-35']++;
                else ageRanges['36+']++;
            });

            const ageDistribution = Object.entries(ageRanges).map(([range, count]) => ({
                range,
                count
            }));

            // Distribution par valeur marchande
            const valueRanges = {
                '0-10M€': 0,
                '10-25M€': 0,
                '25-50M€': 0,
                '50-100M€': 0,
                '100M€+': 0
            };

            allPlayers.forEach(player => {
                const value = (player.MarketValue || 0) / 1000000;
                if (value < 10) valueRanges['0-10M€']++;
                else if (value < 25) valueRanges['10-25M€']++;
                else if (value < 50) valueRanges['25-50M€']++;
                else if (value < 100) valueRanges['50-100M€']++;
                else valueRanges['100M€+']++;
            });

            const valueDistribution = Object.entries(valueRanges).map(([range, count]) => ({
                range,
                count
            }));

            setStats({
                totalPlayers,
                avgAge,
                avgMarketValue,
                topScorer: {
                    name: topScorer.Player,
                    goals: topScorer.Gls || 0,
                    squad: topScorer.Squad
                },
                positionDistribution,
                styleDistribution,
                ageDistribution,
                valueDistribution
            });

        } catch (error: any) {
            console.error('Error loading dashboard data:', error);
            setError(error.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-blue-600 dark:text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Chargement du dashboard...</p>
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
                    <button
                        onClick={loadDashboardData}
                        className="px-4 py-2 bg-blue-600 dark:bg-emerald-500 hover:bg-blue-700 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const COLORS = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

    const dashboardCards = [
        {
            title: 'Total Joueurs',
            value: stats.totalPlayers.toLocaleString(),
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            change: '+12%'
        },
        {
            title: 'Âge Moyen',
            value: `${stats.avgAge.toFixed(1)} ans`,
            icon: Activity,
            color: 'from-emerald-500 to-emerald-600',
            change: '-0.5%'
        },
        {
            title: 'Valeur Moyenne',
            value: `${(stats.avgMarketValue / 1000000).toFixed(1)}M€`,
            icon: TrendingUp,
            color: 'from-violet-500 to-violet-600',
            change: '+8%'
        },
        {
            title: 'Meilleur Buteur',
            value: `${stats.topScorer.goals} buts`,
            icon: Award,
            color: 'from-orange-500 to-orange-600',
            change: stats.topScorer.name
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Dashboard Analytics
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Vue d'ensemble des données et statistiques en temps réel
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {dashboardCards.map((card, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color}`}>
                                    <card.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-emerald-500">
                                    {card.change}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                {card.value}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                {card.title}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Position Distribution */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Distribution par Position
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={stats.positionDistribution}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                        label={({ position, count }) => `${position} (${count})`}
                                    >
                                        {stats.positionDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Age Distribution */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Distribution par Âge
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.ageDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="range"
                                        stroke="#64748b"
                                        tick={{ fontSize: 12, fill: "#64748b" }}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        tick={{ fontSize: 12, fill: "#64748b" }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            color: "#1e293b",
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Style Distribution */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Styles de Jeu
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.styleDistribution} layout="horizontal">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        type="number"
                                        stroke="#64748b"
                                        tick={{ fontSize: 12, fill: "#64748b" }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="style"
                                        stroke="#64748b"
                                        tick={{ fontSize: 10, fill: "#64748b" }}
                                        width={100}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            color: "#1e293b",
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Market Value Distribution */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Valeurs Marchandes
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.valueDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="range"
                                        stroke="#64748b"
                                        tick={{ fontSize: 12, fill: "#64748b" }}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        tick={{ fontSize: 12, fill: "#64748b" }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            color: "#1e293b",
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#8b5cf6"
                                        fill="#8b5cf6"
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Top Performers */}
                <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                        Performances Exceptionnelles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Top Scorer */}
                        <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                            <Award className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                                Meilleur Buteur
                            </h4>
                            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                {stats.topScorer.name}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {stats.topScorer.goals} buts • {stats.topScorer.squad}
                            </p>
                        </div>

                        {/* Most Valuable */}
                        <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <TrendingUp className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                                Valeur Moyenne
                            </h4>
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                {(stats.avgMarketValue / 1000000).toFixed(1)}M€
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Sur {stats.totalPlayers.toLocaleString()} joueurs
                            </p>
                        </div>

                        {/* Age Average */}
                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <Target className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                                Âge Moyen
                            </h4>
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {stats.avgAge.toFixed(1)} ans
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Profil expérimenté
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};