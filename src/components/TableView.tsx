"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronUp, ChevronDown, Search, Filter } from "lucide-react";

interface TableViewProps {
  data: unknown[];
}

interface Column {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export default function TableView({ data }: TableViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // Extract columns from the first item
  const columns: Column[] = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const firstItem = data[0];
    if (typeof firstItem !== 'object' || firstItem === null) return [];
    
    return Object.keys(firstItem).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      type: getValueType((firstItem as Record<string, unknown>)[key])
    }));
  }, [data]);

  // Initialize selected columns with all columns
  useMemo(() => {
    if (columns.length > 0 && selectedColumns.length === 0) {
      setSelectedColumns(columns.map(col => col.key));
    }
  }, [columns, selectedColumns.length]);

  function getValueType(value: unknown): 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value as 'string' | 'number' | 'boolean';
  }

  function formatCellValue(value: unknown, type: Column['type']): string {
    if (value === null || value === undefined) return '—';
    
    switch (type) {
      case 'string':
        return String(value);
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'array':
        const arr = value as unknown[];
        if (arr.length === 0) return '—';
        if (arr.length === 1) return String(arr[0]);
        if (arr.length <= 3) return arr.join(', ');
        return `${arr.slice(0, 2).join(', ')} (+${arr.length - 2} more)`;
      case 'object':
        // Display object contents in a readable format
        const obj = value as Record<string, unknown>;
        
        // Handle specific object types with better formatting
        if (obj.common && typeof obj.common === 'string') {
          // Handle name objects like { common: "China", official: "People's Republic of China" }
          const common = obj.common;
          const official = obj.official;
          if (official && typeof official === 'string' && official !== common) {
            return `${common} (${official.length > 30 ? official.substring(0, 30) + '...' : official})`;
          }
          return common;
        }
        
        if (Array.isArray(obj) || (obj.length !== undefined && typeof obj.length === 'number')) {
          // Handle array-like objects
          const arr = Array.isArray(obj) ? obj : Object.values(obj);
          if (arr.length === 0) return '—';
          if (arr.length === 1) return String(arr[0]);
          return `${arr.slice(0, 2).join(', ')}${arr.length > 2 ? ` (+${arr.length - 2} more)` : ''}`;
        }
        
        // Handle other objects with key-value pairs
        const entries = Object.entries(obj).slice(0, 2); // Show first 2 key-value pairs
        const formatted = entries.map(([key, val]) => {
          if (typeof val === 'string' && val.length > 15) {
            return `${key}: "${val.substring(0, 15)}..."`;
          } else if (Array.isArray(val)) {
            return `${key}: [${val.length} items]`;
          } else if (typeof val === 'object' && val !== null) {
            return `${key}: {...}`;
          }
          return `${key}: ${val}`;
        }).join(', ');
        
        const hasMore = Object.keys(obj).length > 2;
        return hasMore ? `${formatted}...` : formatted;
      default:
        return String(value);
    }
  }

  function getCellClassName(type: Column['type']): string {
    switch (type) {
      case 'number':
        return 'text-right font-mono';
      case 'boolean':
        return 'text-center';
      case 'null':
        return 'text-gray-500 dark:text-gray-400 italic';
      default:
        return 'text-left';
    }
  }

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = data.filter(item => {
        return Object.values(item as Record<string, unknown>).some(value => {
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortConfig.key];
        const bVal = (b as Record<string, unknown>)[sortConfig.key];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // Fallback to string comparison
        const aStr = String(aVal);
        const bStr = String(bVal);
        return sortConfig.direction === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const toggleColumn = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const visibleColumns = columns.filter(col => selectedColumns.includes(col.key));

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p>No data available to display in table format</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <Select value="all" onValueChange={() => {}}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter columns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Columns</SelectItem>
              {columns.map(column => (
                <SelectItem key={column.key} value={column.key}>
                  {column.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Column Selection */}
      <div className="flex flex-wrap gap-2">
        {columns.map(column => (
          <Badge
            key={column.key}
            variant={selectedColumns.includes(column.key) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleColumn(column.key)}
          >
            {column.label}
          </Badge>
        ))}
      </div>

      {/* Table Info */}
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <div>
          Showing {filteredAndSortedData.length} of {data.length} rows
        </div>
        <div>
          {sortConfig && (
            <span>
              Sorted by {sortConfig.key} ({sortConfig.direction})
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-slate-50 dark:bg-slate-800">
                <tr>
                  {visibleColumns.map(column => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.label}</span>
                        <div className="flex flex-col">
                          <ChevronUp 
                            className={`h-3 w-3 ${
                              sortConfig?.key === column.key && sortConfig.direction === 'asc'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-400'
                            }`}
                          />
                          <ChevronDown 
                            className={`h-3 w-3 -mt-1 ${
                              sortConfig?.key === column.key && sortConfig.direction === 'desc'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-400'
                            }`}
                          />
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.map((row, index) => (
                  <tr 
                    key={index} 
                    className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {visibleColumns.map(column => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-sm ${getCellClassName(column.type)}`}
                      >
                        {formatCellValue((row as Record<string, unknown>)[column.key], column.type)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredAndSortedData.length === 0 && searchTerm && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <p>No results found for &quot;{searchTerm}&quot;</p>
        </div>
      )}
    </div>
  );
}
