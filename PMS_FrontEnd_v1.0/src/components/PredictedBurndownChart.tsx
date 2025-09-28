import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PredictedBurndownChartProps {
  projectId: string;
}

const mockBurndownData: Record<string, any[]> = {
  '4': [
    { date: '2025-03-01', planned: 23, actual: 23, predicted: null },
    { date: '2025-03-05', planned: 21, actual: 21, predicted: null },
    { date: '2025-03-10', planned: 19, actual: 20, predicted: 19.8 },
    { date: '2025-03-15', planned: 17, actual: 18, predicted: 17.5 },
    { date: '2025-03-20', planned: 15, actual: 15, predicted: 15.2 },
    { date: '2025-03-25', planned: 13, actual: null, predicted: 13.8 },
    { date: '2025-03-30', planned: 11, actual: null, predicted: 12.1 },
    { date: '2025-04-05', planned: 9, actual: null, predicted: 10.5 },
    { date: '2025-04-10', planned: 7, actual: null, predicted: 8.9 },
    { date: '2025-04-15', planned: 5, actual: null, predicted: 7.2 },
    { date: '2025-04-20', planned: 3, actual: null, predicted: 5.6 },
    { date: '2025-04-25', planned: 1, actual: null, predicted: 3.8 },
    { date: '2025-04-30', planned: 0, actual: null, predicted: 2.1 },
    { date: '2025-05-05', planned: 0, actual: null, predicted: 0.8 },
    { date: '2025-05-10', planned: 0, actual: null, predicted: 0 }
  ],
  '1': [
    { date: '2024-01-15', planned: 12, actual: 12, predicted: null },
    { date: '2024-02-01', planned: 10, actual: 11, predicted: null },
    { date: '2024-02-15', planned: 8, actual: 9, predicted: 8.5 },
    { date: '2024-03-01', planned: 6, actual: 7, predicted: 6.2 },
    { date: '2024-03-15', planned: 4, actual: 4, predicted: 3.8 },
    { date: '2024-04-01', planned: 2, actual: 2, predicted: 1.5 },
    { date: '2024-04-15', planned: 0, actual: 0, predicted: 0 }
  ]
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="font-medium mb-2">{`날짜: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.dataKey === 'planned' && `계획: ${entry.value}개 작업`}
            {entry.dataKey === 'actual' && `실제: ${entry.value}개 작업`}
            {entry.dataKey === 'predicted' && `AI 예측: ${entry.value}개 작업`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PredictedBurndownChart({ projectId }: PredictedBurndownChartProps) {
  const data = mockBurndownData[projectId] || [];
  
  // Find the current date index to draw reference line
  const currentDate = new Date().toISOString().split('T')[0];
  const currentIndex = data.findIndex(item => item.date >= currentDate);
  const todayData = currentIndex >= 0 ? data[currentIndex] : null;

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: '남은 작업 수', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Today reference line */}
          {todayData && (
            <ReferenceLine 
              x={todayData.date} 
              stroke="#94a3b8" 
              strokeDasharray="5 5" 
              label={{ value: "오늘", position: "top" }}
            />
          )}
          
          {/* Planned line */}
          <Line
            type="monotone"
            dataKey="planned"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
            name="계획"
          />
          
          {/* Actual line */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            connectNulls={false}
            name="실제 진행"
          />
          
          {/* Predicted line */}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="8 4"
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            connectNulls={false}
            name="AI 예측"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-blue-600"></div>
          <span>계획된 진행도</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-green-600"></div>
          <span>실제 진행도</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-yellow-600 border-dashed"></div>
          <span>AI 예측 경로</span>
        </div>
      </div>
    </div>
  );
}