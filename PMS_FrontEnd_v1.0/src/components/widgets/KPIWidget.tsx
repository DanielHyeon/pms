import React from 'react';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

interface KPIWidgetProps {
  title: string;
  config: {
    value: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    color?: string;
    description?: string;
  };
}

export function KPIWidget({ title, config }: KPIWidgetProps) {
  const { value, target, unit, trend, trendValue, color = 'blue', description } = config;
  
  const progressPercentage = Math.min((value / target) * 100, 100);
  const isOverTarget = value > target;
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'down':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getColorScheme = () => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <Card className="w-full h-full glass-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-1">
          {getTrendIcon()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* 메인 값 표시 */}
        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold">
              {value.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              {unit}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-muted-foreground">
              목표: {target.toLocaleString()}{unit}
            </span>
            {trendValue !== 0 && (
              <Badge 
                className={`px-2 py-0.5 text-xs ${getTrendColor()}`}
                variant="secondary"
              >
                {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
                {Math.abs(trendValue)}{unit}
              </Badge>
            )}
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>진행률</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          
          <div className="relative">
            <Progress 
              value={progressPercentage} 
              className="h-2" 
            />
            {isOverTarget && (
              <div className="absolute top-0 right-0 h-2 w-1 bg-gradient-to-r from-green-400 to-green-600 rounded-r-full"></div>
            )}
          </div>
          
          {isOverTarget && (
            <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
              <Target className="w-3 h-3" />
              <span>목표 달성!</span>
            </div>
          )}
        </div>

        {/* 설명 (선택사항) */}
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        {/* 컬러 인디케이터 */}
        <div className={`h-1 w-full bg-gradient-to-r ${getColorScheme()} rounded-full opacity-60`}></div>
      </CardContent>
    </Card>
  );
}