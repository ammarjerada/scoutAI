import React from 'react';
import { Link } from 'react-router-dom';
import {
    Target,
    Users,
    BarChart3,
    GitCompare,
    Sparkles,
    ArrowRight,
    TrendingUp,
    Shield,
    Zap
} from 'lucide-react';

export const HomePage: React.FC = () => {
    const features = [
        {
            icon: Users,
            title: 'Base de données complète',
            description: 'Accédez à des milliers de profils de joueurs avec statistiques détaillées',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: BarChart3,
            title: 'Analytics avancées',
            description: 'Visualisez les performances avec des graphiques interactifs',
            color: 'from-emerald-500 to-teal-500'
        },
        {
            icon: GitCompare,
            title: 'Comparaison intelligente',
            description: 'Comparez les joueurs côte à côte avec des métriques précises',
            color: 'from-violet-500 to-purple-500'
        },
        {
            icon: TrendingUp,
            title: 'Prédictions IA',
            description: 'Découvrez les futurs talents grâce à notre intelligence artificielle',
            color: 'from-orange-500 to-red-500'
        }
    ];

    const stats = [
        { value: '10,000+', label: 'Joueurs analysés' },
        { value: '50+', label: 'Ligues couvertes' },
        { value: '97%', label: 'Précision IA' },
        { value: '24/7', label: 'Mise à jour' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="p-4 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl shadow-xl">
                            <Target className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight">
                            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                                Scout
                            </span>
                            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                AI
                            </span>
                        </h1>
                    </div>

                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
                        Révolutionnez votre scouting avec l'intelligence artificielle.
                        Découvrez, analysez et comparez les talents de demain.
                    </p>

                    <div className="flex items-center justify-center gap-2 mb-12">
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                        <span className="text-slate-500 dark:text-slate-400">Powered by Advanced AI Analytics</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/players"
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-full font-bold text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                        >
                            <Users className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                            <span>Explorer les joueurs</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>

                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full font-semibold text-slate-700 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-slate-800/70 transition-all duration-300"
                        >
                            <BarChart3 className="w-5 h-5" />
                            <span>Voir le dashboard</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-slate-600 dark:text-slate-400 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Fonctionnalités avancées
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            Des outils professionnels pour optimiser votre processus de scouting
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300"
                            >
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {feature.description}
                                </p>
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Prêt à découvrir les talents de demain ?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Rejoignez les professionnels qui font confiance à ScoutAI pour leurs décisions de recrutement.
                    </p>
                    <Link
                        to="/players"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                        <Target className="w-5 h-5" />
                        <span>Commencer maintenant</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};