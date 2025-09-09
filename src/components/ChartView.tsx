"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";

interface ChartViewProps {
  data: unknown[];
}

interface ChartConfig {
  xAxis: string;
  yAxis: string;
  chartType: 'bar' | 'line' | 'pie';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export default function ChartView({ data }: ChartViewProps) {
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    xAxis: '',
    yAxis: '',
    chartType: 'bar'
  });

  // Extract numeric columns and string columns
  const { numericColumns, stringColumns } = useMemo(() => {
    if (!data || data.length === 0) return { numericColumns: [], stringColumns: [] };

    const firstItem = data[0];
    if (typeof firstItem !== 'object' || firstItem === null) {
      return { numericColumns: [], stringColumns: [] };
    }

    const numeric: string[] = [];
    const string: string[] = [];

    Object.keys(firstItem).forEach(key => {
      const value = (firstItem as Record<string, unknown>)[key];
      if (typeof value === 'number') {
        numeric.push(key);
      } else if (typeof value === 'string' && value.length < 50) {
        string.push(key);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle nested objects - look for common string properties
        const obj = value as Record<string, unknown>;
        if (obj.common && typeof obj.common === 'string') {
          string.push(`${key}.common`);
        } else if (obj.name && typeof obj.name === 'string') {
          string.push(`${key}.name`);
        } else if (obj.symbol && typeof obj.symbol === 'string') {
          string.push(`${key}.symbol`);
        }
      }
    });

    return { numericColumns: numeric, stringColumns: string };
  }, [data]);

  // Initialize chart config when data changes
  useMemo(() => {
    if (stringColumns.length > 0 && numericColumns.length > 0 && !chartConfig.xAxis && !chartConfig.yAxis) {
      setChartConfig({
        xAxis: stringColumns[0],
        yAxis: numericColumns[0],
        chartType: 'bar'
      });
    }
  }, [stringColumns, numericColumns, chartConfig.xAxis, chartConfig.yAxis]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!chartConfig.xAxis || !chartConfig.yAxis || !data) return [];

    if (chartConfig.chartType === 'pie') {
      // For pie charts, we need to aggregate data
      const aggregated = data.reduce((acc: Record<string, number>, item: unknown) => {
        const itemObj = item as Record<string, unknown>;
        
        // Handle nested object paths
        const getNestedValue = (path: string) => {
          const keys = path.split('.');
          let value: unknown = itemObj;
          for (const key of keys) {
            if (value && typeof value === 'object' && value !== null && key in value) {
              value = (value as Record<string, unknown>)[key];
            } else {
              return undefined;
            }
          }
          return value;
        };
        
        const key = getNestedValue(chartConfig.xAxis);
        const value = getNestedValue(chartConfig.yAxis);
        
        if (key && typeof key === 'string' && typeof value === 'number') {
          acc[key] = (acc[key] || 0) + value;
        }
        
        return acc;
      }, {});

      return Object.entries(aggregated).map(([name, value]) => ({
        name: String(name).substring(0, 20), // Truncate long names
        value: value as number,
        fullName: name
      }));
    } else {
      // For bar and line charts
      return data.map((item: unknown, index: number) => {
        const itemObj = item as Record<string, unknown>;
        
        // Handle nested object paths like "name.common"
        const getNestedValue = (path: string) => {
          const keys = path.split('.');
          let value: unknown = itemObj;
          for (const key of keys) {
            if (value && typeof value === 'object' && value !== null && key in value) {
              value = (value as Record<string, unknown>)[key];
            } else {
              return undefined;
            }
          }
          return value;
        };
        
        const xValue = getNestedValue(chartConfig.xAxis);
        const yValue = getNestedValue(chartConfig.yAxis);
        
        return {
          ...itemObj,
          index,
          [chartConfig.xAxis]: String(xValue || '').substring(0, 20), // Truncate long labels
          fullLabel: xValue,
          [chartConfig.yAxis]: yValue
        };
      });
    }
  }, [data, chartConfig]);

  const renderChart = () => {
    if (!chartData.length) {
      return (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <p>No data available for the selected chart configuration</p>
        </div>
      );
    }

    switch (chartConfig.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={chartConfig.xAxis}
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{
                  color: "#000000"
                }}
                formatter={(value: unknown) => [String(value), chartConfig.yAxis]}
                labelFormatter={(label: unknown, payload: unknown) => {
                  if (payload && Array.isArray(payload) && payload[0] && (payload[0] as { payload: { fullLabel: unknown } }).payload.fullLabel) {
                    return String((payload[0] as { payload: { fullLabel: unknown } }).payload.fullLabel);
                  }
                  return String(label);
                }}
              />
              <Bar dataKey={chartConfig.yAxis} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={chartConfig.xAxis}
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{
                  color: "#000000"
                }}
                formatter={(value: unknown) => [String(value), chartConfig.yAxis]}
                labelFormatter={(label: unknown, payload: unknown) => {
                  if (payload && Array.isArray(payload) && payload[0] && (payload[0] as { payload: { fullLabel: unknown } }).payload.fullLabel) {
                    return String((payload[0] as { payload: { fullLabel: unknown } }).payload.fullLabel);
                  }
                  return String(label);
                }}
              />
              <Line 
                type="monotone" 
                dataKey={chartConfig.yAxis} 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  color: "#000000"
                }}
                formatter={(value: unknown) => [
                  String(value), 
                  chartConfig.yAxis
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p>No data available for chart visualization</p>
      </div>
    );
  }

  if (numericColumns.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p>No numeric data found for chart visualization</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Chart Type:</span>
            <div className="flex gap-1">
              <Button
                variant={chartConfig.chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartConfig(prev => ({ ...prev, chartType: 'bar' }))}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Bar
              </Button>
              <Button
                variant={chartConfig.chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartConfig(prev => ({ ...prev, chartType: 'line' }))}
              >
                <LineChartIcon className="h-4 w-4 mr-1" />
                Line
              </Button>
              <Button
                variant={chartConfig.chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartConfig(prev => ({ ...prev, chartType: 'pie' }))}
              >
                <PieChartIcon className="h-4 w-4 mr-1" />
                Pie
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">X-Axis:</span>
            <Select 
              value={chartConfig.xAxis} 
              onValueChange={(value) => setChartConfig(prev => ({ ...prev, xAxis: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stringColumns.map(column => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Y-Axis:</span>
            <Select 
              value={chartConfig.yAxis} 
              onValueChange={(value) => setChartConfig(prev => ({ ...prev, yAxis: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {numericColumns.map(column => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Chart Info */}
      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
        <Badge variant="outline">
          {chartData.length} data points
        </Badge>
        <span>
          {chartConfig.xAxis} vs {chartConfig.yAxis}
        </span>
      </div>

      {/* Chart */}
      <Card>
        <CardContent className="p-6">
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  );
}
