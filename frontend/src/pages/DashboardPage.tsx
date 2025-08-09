import React, { useState, useEffect } from 'react';
import {
    Users,
    TrendingUp,
    Award,
    Target,
    BarChart3,
    PieChart,
    Activity,
    Star,
    AlertCircle
} from 'lucide-react';
import { usePlayerSearch } from '../hooks/usePlayerSearch';
import { FavoritesService } from '../services/favoritesService';
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
    LineChart,
    Line,
    Area,
    AreaChart,
    Pie
} from 'recharts';

export const DashboardPage: React.FC = () => {
    const { allPlayers, loadAllPlayers, error } = usePlayerSearch();
    const [favorites] = useState(() => FavoritesService.getFavorites());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            await loadAllPlayers();
            setLoading(false);
        };
        loadData();
    }, [loadAllPlayers]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // Analytics calculations
    const totalPlayers = allPlayers.length;
    const avgAge = allPlayers.reduce((sum, p) => sum + (p.Age || 0), 0) / totalPlayers;
    const avgMarketValue = allPlayers.reduce((sum, p) => sum + (p.MarketValue || 0), 0) / totalPlayers;
    const topScorer = allPlayers.reduce((max, p) => (p.Gls || 0) > (max.Gls || 0) ? p : max, allPlayers[0]);

    // Position distribution
    const positionData = allPlayers.reduce((acc, player) => {
        const pos = player.Pos || 'Unknown';
        acc[pos] = (acc[pos] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const positionChartData = Object.entries(positionData).map(([position, count]) => ({
        position,
        count,
        percentage: ((count / totalPlayers) * 100).toFixed(1)
    }));

    // Style distribution
    const styleData = allPlayers.reduce((acc, player) => {
        const style = player.style || 'Unknown';
        acc[style] = (acc[style] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const styleChartData = Object.entries(styleData).map(([style, count]) => ({
        style: style.length > 15 ? style.substring(0, 15) + '...' : style,
        count,
        fullStyle: style
    }));

    // Age distribution
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

    const ageChartData = Object.entries(ageRanges).map(([range, count]) => ({
        range,
        count
    }));

    // Market value ranges
    const valueRanges = {
        '0-10M': 0,
        '10-25M': 0,
        '25-50M': 0,
        '50-100M': 0,
        '100M+': 0
    };

    allPlayers.forEach(player => {
        const value = (player.MarketValue || 0) / 1000000;
        if (value < 10) valueRanges['0-10M']++;
        else if (value < 25) valueRanges['10-25M']++;
        else if (value < 50) valueRanges['25-50M']++;
        else if (value < 100) valueRanges['50-100M']++;
        else valueRanges['100M+']++;
    });

    const valueChartData = Object.entries(valueRanges).map(([range, count]) => ({
        range,
        count
    }));

    const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];

    const stats = [
        {
            title: 'Total Joueurs',
            value: totalPlayers.toLocaleString(),
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            change: '+12%'
        },
        {
            title: 'Âge Moyen',
            value: `${avgAge.toFixed(1)} ans`,
            icon: Activity,
            color: 'from-emerald-500 to-teal-500',
            change: '-0.5%'
        },
        {
            title: 'Valeur Moyenne',
            value: `${(avgMarketValue / 1000000).toFixed(1)}M€`,
            icon: TrendingUp,
            color: 'from-violet-500 to-purple-500',
            change: '+8%'
        },
        {
            title: 'Mes Favoris',
            value: favorites.length.toString(),
            icon: Star,
            color: 'from-pink-500 to-rose-500',
            change: `+${favorites.length}`
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
                        Vue d'ensemble des données et statistiques de la base de joueurs
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-emerald-500">
                                    {stat.change}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                {stat.value}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                {stat.title}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Position Distribution */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Distribution par Position
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={positionChartData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                        label={({ position, percentage }) => `${position} (${percentage}%)`}
                                    >
                                        {positionChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Age Distribution */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Distribution par Âge
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ageChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
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
                                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                                            border: "1px solid rgba(148, 163, 184, 0.3)",
                                            borderRadius: "12px",
                                            color: "#e2e8f0",
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Style Distribution */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Styles de Jeu
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={styleChartData} layout="horizontal">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
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
                                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                                            border: "1px solid rgba(148, 163, 184, 0.3)",
                                            borderRadius: "12px",
                                            color: "#e2e8f0",
                                        }}
                                        formatter={(value, name, props) => [value, props.payload.fullStyle]}
                                    />
                                    <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Market Value Distribution */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Valeurs Marchandes
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={valueChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
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
                                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                                            border: "1px solid rgba(148, 163, 184, 0.3)",
                                            borderRadius: "12px",
                                            color: "#e2e8f0",
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
                <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                        Top Performers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Top Scorer */}
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                Meilleur Buteur
                            </h4>
                            <p className="text-lg font-bold text-emerald-500">
                                {topScorer?.Player}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {topScorer?.Gls} buts
                            </p>
                        </div>

                        {/* Most Valuable */}
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                Plus Cher
                            </h4>
                            <p className="text-lg font-bold text-emerald-500">
                                {allPlayers.reduce((max, p) => (p.MarketValue || 0) > (max.MarketValue || 0) ? p : max, allPlayers[0])?.Player}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {((allPlayers.reduce((max, p) => (p.MarketValue || 0) > (max.MarketValue || 0) ? p : max, allPlayers[0])?.MarketValue || 0) / 1000000).toFixed(1)}M€
                            </p>
                        </div>

                        {/* Youngest */}
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                Plus Jeune
                            </h4>
                            <p className="text-lg font-bold text-emerald-500">
                                {allPlayers.reduce((min, p) => (p.Age || 100) < (min.Age || 100) ? p : min, allPlayers[0])?.Player}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {allPlayers.reduce((min, p) => (p.Age || 100) < (min.Age || 100) ? p : min, allPlayers[0])?.Age} ans
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};