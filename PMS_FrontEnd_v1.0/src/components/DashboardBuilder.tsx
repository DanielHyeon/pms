import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit3, Move, BarChart3, PieChart, TrendingUp, DollarSign, Users, Save, Eye, Grid3X3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { WidgetLibrary } from './WidgetLibrary';
import { KPIWidget } from './widgets/KPIWidget';
import { ChartWidget } from './widgets/ChartWidget';
import { TableWidget } from './widgets/TableWidget';

interface User {
  id: string;
  name: string;
  role: string;
}

interface DashboardBuilderProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

// 위젯 타입 정의
interface Widget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'metric';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: any;
  data?: any;
}

// 대시보드 레이아웃 정의
interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  createdAt: string;
  updatedAt: string;
}

// 그리드 설정
const GRID_SIZE = 20;
const SNAP_TO_GRID = true;

export function DashboardBuilder({ user, onBack, onLogout, isDarkMode }: DashboardBuilderProps) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [dashboardName, setDashboardName] = useState('새 대시보드');
  const [dashboardDescription, setDashboardDescription] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  // 초기 샘플 위젯들
  useEffect(() => {
    const sampleWidgets: Widget[] = [
      {
        id: 'widget-1',
        type: 'kpi',
        title: '전체 프로젝트 수',
        position: { x: 20, y: 20 },
        size: { width: 280, height: 160 },
        config: {
          value: 24,
          target: 20,
          unit: '개',
          trend: 'up',
          trendValue: 4
        }
      },
      {
        id: 'widget-2',
        type: 'kpi',
        title: '예산 효율성',
        position: { x: 320, y: 20 },
        size: { width: 280, height: 160 },
        config: {
          value: 87,
          target: 85,
          unit: '%',
          trend: 'up',
          trendValue: 5
        }
      },
      {
        id: 'widget-3',
        type: 'chart',
        title: '월별 성과 추이',
        position: { x: 20, y: 200 },
        size: { width: 580, height: 300 },
        config: {
          chartType: 'line',
          xAxis: 'month',
          yAxis: 'value',
          color: '#6366f1'
        },
        data: [
          { month: '1월', value: 85 },
          { month: '2월', value: 88 },
          { month: '3월', value: 82 },
          { month: '4월', value: 90 },
          { month: '5월', value: 92 },
          { month: '6월', value: 87 }
        ]
      }
    ];
    setWidgets(sampleWidgets);
  }, []);

  // 위젯 드래그 시작
  const handleMouseDown = (widget: Widget, e: React.MouseEvent) => {
    if (previewMode) return;
    
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setSelectedWidget(widget);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left - widget.position.x,
      y: e.clientY - rect.top - widget.position.y
    });
  };

  // 위젯 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedWidget || previewMode) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    let newX = e.clientX - rect.left - dragOffset.x;
    let newY = e.clientY - rect.top - dragOffset.y;

    // 그리드에 스냅
    if (SNAP_TO_GRID) {
      newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
      newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
    }

    // 경계 제한
    newX = Math.max(0, Math.min(newX, (rect.width - selectedWidget.size.width)));
    newY = Math.max(0, Math.min(newY, (rect.height - selectedWidget.size.height)));

    setWidgets(prev => prev.map(w => 
      w.id === selectedWidget.id 
        ? { ...w, position: { x: newX, y: newY }}
        : w
    ));
  };

  // 위젯 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  // 위젯 추가
  const addWidget = (type: Widget['type'], config: any) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: config.title || `새 ${type} 위젯`,
      position: { x: 20, y: 20 },
      size: { width: 280, height: 160 },
      config
    };
    
    setWidgets(prev => [...prev, newWidget]);
    setShowWidgetLibrary(false);
  };

  // 위젯 삭제
  const deleteWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    setSelectedWidget(null);
  };

  // 위젯 크기 조정
  const resizeWidget = (widgetId: string, newSize: { width: number; height: number }) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId 
        ? { ...w, size: newSize }
        : w
    ));
  };

  // 대시보드 저장
  const saveDashboard = () => {
    const dashboard: DashboardLayout = {
      id: `dashboard-${Date.now()}`,
      name: dashboardName,
      description: dashboardDescription,
      widgets,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // localStorage에 저장 (실제로는 API 호출)
    const savedDashboards = JSON.parse(localStorage.getItem('customDashboards') || '[]');
    savedDashboards.push(dashboard);
    localStorage.setItem('customDashboards', JSON.stringify(savedDashboards));

    alert('대시보드가 저장되었습니다!');
  };

  // 위젯 렌더링
  const renderWidget = (widget: Widget) => {
    const commonProps = {
      key: widget.id,
      style: {
        position: 'absolute' as const,
        left: widget.position.x,
        top: widget.position.y,
        width: widget.size.width,
        height: widget.size.height,
        cursor: previewMode ? 'default' : 'move',
        zIndex: selectedWidget?.id === widget.id ? 10 : 1
      },
      className: `border-2 ${selectedWidget?.id === widget.id ? 'border-primary' : 'border-transparent'} rounded-lg`,
      onMouseDown: (e: React.MouseEvent) => handleMouseDown(widget, e)
    };

    switch (widget.type) {
      case 'kpi':
        return (
          <div {...commonProps}>
            <KPIWidget config={widget.config} title={widget.title} />
          </div>
        );
      case 'chart':
        return (
          <div {...commonProps}>
            <ChartWidget config={widget.config} data={widget.data} title={widget.title} />
          </div>
        );
      case 'table':
        return (
          <div {...commonProps}>
            <TableWidget config={widget.config} data={widget.data} title={widget.title} />
          </div>
        );
      default:
        return (
          <div {...commonProps}>
            <Card className="w-full h-full glass-card">
              <CardHeader>
                <CardTitle className="text-sm">{widget.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground">
                  위젯 타입: {widget.type}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 상단 툴바 */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">대시보드 편집기</h1>
              <p className="text-sm text-muted-foreground">드래그앤드롭으로 위젯을 배치하세요</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowWidgetLibrary(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>위젯 추가</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>{previewMode ? '편집 모드' : '미리보기'}</span>
            </Button>
            
            <Button
              onClick={saveDashboard}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>저장</span>
            </Button>
          </div>
        </div>

        {/* 대시보드 정보 */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex-1">
            <Input
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="대시보드 이름"
              className="font-medium"
            />
          </div>
          <div className="flex-1">
            <Input
              value={dashboardDescription}
              onChange={(e) => setDashboardDescription(e.target.value)}
              placeholder="대시보드 설명"
            />
          </div>
        </div>
      </div>

      {/* 캔버스 영역 */}
      <div className="flex-1 flex">
        {/* 왼쪽 사이드바 (선택된 위젯 속성) */}
        {selectedWidget && !previewMode && (
          <div className="w-80 border-r bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">위젯 속성</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteWidget(selectedWidget.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label>제목</Label>
                <Input
                  value={selectedWidget.title}
                  onChange={(e) => {
                    setWidgets(prev => prev.map(w => 
                      w.id === selectedWidget.id 
                        ? { ...w, title: e.target.value }
                        : w
                    ));
                    setSelectedWidget({ ...selectedWidget, title: e.target.value });
                  }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>너비</Label>
                  <Input
                    type="number"
                    value={selectedWidget.size.width}
                    onChange={(e) => {
                      const newWidth = parseInt(e.target.value);
                      resizeWidget(selectedWidget.id, { 
                        width: newWidth, 
                        height: selectedWidget.size.height 
                      });
                    }}
                  />
                </div>
                <div>
                  <Label>높이</Label>
                  <Input
                    type="number"
                    value={selectedWidget.size.height}
                    onChange={(e) => {
                      const newHeight = parseInt(e.target.value);
                      resizeWidget(selectedWidget.id, { 
                        width: selectedWidget.size.width, 
                        height: newHeight 
                      });
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>X 위치</Label>
                  <Input
                    type="number"
                    value={selectedWidget.position.x}
                    onChange={(e) => {
                      const newX = parseInt(e.target.value);
                      setWidgets(prev => prev.map(w => 
                        w.id === selectedWidget.id 
                          ? { ...w, position: { x: newX, y: w.position.y }}
                          : w
                      ));
                    }}
                  />
                </div>
                <div>
                  <Label>Y 위치</Label>
                  <Input
                    type="number"
                    value={selectedWidget.position.y}
                    onChange={(e) => {
                      const newY = parseInt(e.target.value);
                      setWidgets(prev => prev.map(w => 
                        w.id === selectedWidget.id 
                          ? { ...w, position: { x: w.position.x, y: newY }}
                          : w
                      ));
                    }}
                  />
                </div>
              </div>

              <Separator />
              
              <div>
                <Label>위젯 타입</Label>
                <Badge variant="outline">{selectedWidget.type}</Badge>
              </div>
            </div>
          </div>
        )}

        {/* 메인 캔버스 */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full relative bg-muted/5"
            style={{
              backgroundImage: previewMode ? 'none' : `
                linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {widgets.map(renderWidget)}
            
            {/* 빈 캔버스 메시지 */}
            {widgets.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Grid3X3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">빈 대시보드</h3>
                  <p className="text-sm">위젯을 추가하여 커스텀 대시보드를 만들어보세요</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setShowWidgetLibrary(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    첫 번째 위젯 추가
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 위젯 라이브러리 모달 */}
      <Dialog open={showWidgetLibrary} onOpenChange={setShowWidgetLibrary}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>위젯 라이브러리</DialogTitle>
            <DialogDescription>
              대시보드에 추가할 위젯을 선택하세요
            </DialogDescription>
          </DialogHeader>
          <WidgetLibrary onAddWidget={addWidget} />
        </DialogContent>
      </Dialog>
    </div>
  );
}