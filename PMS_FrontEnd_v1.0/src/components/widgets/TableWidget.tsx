import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface TableWidgetProps {
  title: string;
  config: {
    columns: string[];
    sortable?: boolean;
    pagination?: boolean;
    highlighting?: boolean;
    searchable?: boolean;
  };
  data: any[];
}

export function TableWidget({ title, config, data }: TableWidgetProps) {
  const { columns, sortable = false, pagination = false, highlighting = false, searchable = false } = config;
  
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 데이터 필터링 (검색)
  const filteredData = searchable 
    ? data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  // 데이터 정렬
  const sortedData = sortConfig
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        let comparison = 0;
        if (aValue > bValue) comparison = 1;
        if (aValue < bValue) comparison = -1;
        
        return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
      })
    : filteredData;

  // 페이지네이션
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = pagination 
    ? sortedData.slice(startIndex, startIndex + itemsPerPage)
    : sortedData;

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  const getColumnKey = (column: string) => {
    // 컬럼명을 데이터 키로 변환 (한글 -> 영문 매핑)
    const keyMap: { [key: string]: string } = {
      '이름': 'name',
      '상태': 'status',
      '진행률': 'progress',
      '담당자': 'assignee',
      '위험 요소': 'risk',
      '심각도': 'severity',
      '발생 확률': 'probability',
      '영향도': 'impact',
      '부서': 'department',
      '예산': 'budget',
      '지출': 'spent',
      '완료율': 'completion'
    };
    return keyMap[column] || column.toLowerCase().replace(/\s+/g, '_');
  };

  const formatCellValue = (value: any, column: string) => {
    if (value === null || value === undefined) return '-';

    // 진행률이나 완료율인 경우
    if (column.includes('률') || column.includes('progress') || column.includes('completion')) {
      if (typeof value === 'number') {
        return `${value}%`;
      }
    }

    // 예산이나 지출인 경우
    if (column.includes('예산') || column.includes('지출') || column.includes('budget') || column.includes('spent')) {
      if (typeof value === 'number') {
        return `₩${value.toLocaleString()}`;
      }
    }

    // 상태 값인 경우 뱃지로 표시
    if (column === '상태' || column === 'status') {
      const statusColors: { [key: string]: string } = {
        '진행중': 'bg-blue-500',
        '완료': 'bg-green-500',
        '계획': 'bg-yellow-500',
        '대기': 'bg-gray-500',
        '지연': 'bg-red-500'
      };
      
      return (
        <Badge className={`${statusColors[value] || 'bg-gray-500'} text-white`}>
          {value}
        </Badge>
      );
    }

    // 심각도인 경우
    if (column === '심각도' || column === 'severity') {
      const severityColors: { [key: string]: string } = {
        '높음': 'bg-red-500 text-white',
        '중간': 'bg-yellow-500 text-white',
        '낮음': 'bg-green-500 text-white'
      };
      
      return (
        <Badge className={severityColors[value] || 'bg-gray-500'}>
          {value}
        </Badge>
      );
    }

    return String(value);
  };

  const getRowHighlight = (item: any) => {
    if (!highlighting) return '';

    // 위험도가 높은 항목 하이라이트
    if (item.severity === '높음' || item.status === '지연') {
      return 'bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500';
    }
    
    if (item.severity === '중간' || item.status === '대기') {
      return 'bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500';
    }

    return '';
  };

  return (
    <Card className="w-full h-full glass-card flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {searchable && (
            <div className="relative w-48">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          {paginatedData.length > 0 ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  {columns.map((column, index) => {
                    const columnKey = getColumnKey(column);
                    const isSorted = sortConfig?.key === columnKey;
                    
                    return (
                      <th 
                        key={index}
                        className={`text-left p-2 font-medium text-muted-foreground ${
                          sortable ? 'cursor-pointer hover:text-foreground' : ''
                        }`}
                        onClick={() => handleSort(columnKey)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column}</span>
                          {sortable && (
                            <div className="flex flex-col">
                              <ChevronUp 
                                className={`w-3 h-3 ${
                                  isSorted && sortConfig?.direction === 'asc' 
                                    ? 'text-primary' 
                                    : 'text-muted-foreground/50'
                                }`} 
                              />
                              <ChevronDown 
                                className={`w-3 h-3 -mt-1 ${
                                  isSorted && sortConfig?.direction === 'desc' 
                                    ? 'text-primary' 
                                    : 'text-muted-foreground/50'
                                }`} 
                              />
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr 
                    key={index} 
                    className={`border-b hover:bg-muted/50 transition-colors ${getRowHighlight(item)}`}
                  >
                    {columns.map((column, colIndex) => {
                      const columnKey = getColumnKey(column);
                      const value = item[columnKey];
                      
                      return (
                        <td key={colIndex} className="p-2">
                          {formatCellValue(value, column)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              {searchTerm ? '검색 결과가 없습니다' : '표시할 데이터가 없습니다'}
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} / {sortedData.length}
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-7 w-7 p-0"
              >
                ‹
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-7 w-7 p-0"
              >
                ›
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}