import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Progress } from './ui/progress';
import { AlertTriangle, ChevronDown, ChevronRight, Calendar, User, TrendingUp } from 'lucide-react';

interface RiskTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  riskScore: number;
  delayProbability: number;
  reasons: string[];
  estimatedDelay: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
}

interface RiskTaskItemProps {
  task: RiskTask;
}

export function RiskTaskItem({ task }: RiskTaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'bg-red-100 border-red-300 text-red-800';
    if (score >= 50) return 'bg-orange-100 border-orange-300 text-orange-800';
    return 'bg-yellow-100 border-yellow-300 text-yellow-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue(task.dueDate);

  return (
    <Card className={`border-l-4 ${getRiskColor(task.riskScore)} transition-all duration-200 hover:shadow-md`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  )}
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <h4 className="font-medium text-sm truncate">{task.title}</h4>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{task.assignee}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(task.dueDate)}</span>
                    {daysUntilDue <= 7 && (
                      <Badge variant="destructive" className="text-xs py-0 px-1 ml-1">
                        {daysUntilDue}일 남음
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>지연 확률</span>
                      <span className="font-medium">{task.delayProbability}%</span>
                    </div>
                    <Progress value={task.delayProbability} className="h-2" />
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(task.priority)} variant="outline">
                      {task.priority.toUpperCase()}
                    </Badge>
                    {task.estimatedDelay > 0 && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +{task.estimatedDelay}일
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {task.description}
              </p>
              
              <div className="mb-4">
                <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  지연 위험 요인
                </h5>
                <ul className="space-y-1">
                  {task.reasons.map((reason, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs">
                  담당자 면담 예약
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  추가 리소스 요청
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  일정 재검토
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}