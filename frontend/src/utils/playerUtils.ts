import { Player, RadarDataPoint } from '../types/Player';

export const buildRadarData = (player: Player): RadarDataPoint[] => [
  { stat: "Buts", value: parseFloat(String(player.Gls || 0)) },
  { stat: "Assist", value: parseFloat(String(player.Ast || 0)) },
  { stat: "xG", value: parseFloat(String(player.xG || 0)) },
  { stat: "xAG", value: parseFloat(String(player.xAG || 0)) },
  { stat: "Tacles", value: parseFloat(String(player.Tkl || 0)) },
  { stat: "Passes clés", value: parseFloat(String(player.KP || 0)) },
];

export const formatMarketValue = (value: number): string => {
  return `${(value / 1000000).toFixed(1)}M€`;
};

export const getDefaultPlayerImage = (): string => {
  return "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400";
};