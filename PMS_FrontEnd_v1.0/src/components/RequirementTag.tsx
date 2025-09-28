import React from 'react';
import { Badge } from './ui/badge';
import { Link } from 'lucide-react';

interface Requirement {
  id: string;
  title: string;
  description: string;
  type: 'user-story' | 'feature' | 'bug' | 'epic';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  trackingNumber: string;
  projectId: string;
}

interface RequirementTagProps {
  requirement?: Requirement;
  reqIdString?: string;
  showTitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export function RequirementTag({ 
  requirement, 
  reqIdString, 
  showTitle = false, 
  className = '', 
  onClick 
}: RequirementTagProps) {
  if (requirement) {
    const getTypeColor = (type: Requirement['type']) => {
      switch (type) {
        case 'feature': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'bug': return 'bg-red-50 text-red-700 border-red-200';
        case 'epic': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'user-story': return 'bg-green-50 text-green-700 border-green-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    };

    const getPriorityColor = (priority: Requirement['priority']) => {
      switch (priority) {
        case 'critical': return 'text-red-600';
        case 'high': return 'text-orange-600';
        case 'medium': return 'text-yellow-600';
        case 'low': return 'text-green-600';
        default: return 'text-gray-600';
      }
    };

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge 
          variant="outline" 
          className={`text-xs hover:bg-opacity-80 cursor-pointer ${getTypeColor(requirement.type)}`}
          onClick={onClick}
        >
          <Link className="w-3 h-3 mr-1" />
          {requirement.trackingNumber}
        </Badge>
        {showTitle && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{requirement.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {requirement.type}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${getPriorityColor(requirement.priority)}`}
              >
                {requirement.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {requirement.status}
              </Badge>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback for legacy reqIdString usage
  if (reqIdString) {
    return (
      <Badge 
        variant="outline" 
        className={`text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer ${className}`}
        onClick={onClick}
      >
        <Link className="w-3 h-3 mr-1" />
        {reqIdString}
      </Badge>
    );
  }

  return null;
}