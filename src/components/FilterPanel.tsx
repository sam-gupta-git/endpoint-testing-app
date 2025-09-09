"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { X, Plus, Filter } from "lucide-react";

interface FilterPanelProps {
  data: unknown[];
  onFilterChange: (filteredData: unknown[]) => void;
}

interface FilterRule {
  id: string;
  column: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'greaterEqual' | 'lessEqual';
  value: string;
}

export default function FilterPanel({ data, onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterRule[]>([]);

  // Extract available columns from data
  const availableColumns = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const firstItem = data[0];
    if (typeof firstItem !== 'object' || firstItem === null) return [];
    
    return Object.keys(firstItem).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      type: getValueType((firstItem as Record<string, unknown>)[key])
    }));
  }, [data]);

  function getValueType(value: unknown): 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value as 'string' | 'number' | 'boolean';
  }

  function getOperatorsForType(type: string) {
    switch (type) {
      case 'string':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'contains', label: 'Contains' }
        ];
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greater', label: 'Greater than' },
          { value: 'less', label: 'Less than' },
          { value: 'greaterEqual', label: 'Greater or equal' },
          { value: 'lessEqual', label: 'Less or equal' }
        ];
      case 'boolean':
        return [
          { value: 'equals', label: 'Equals' }
        ];
      default:
        return [
          { value: 'equals', label: 'Equals' }
        ];
    }
  }

  function applyFilters(data: unknown[], filters: FilterRule[]): unknown[] {
    if (filters.length === 0) return data;

    return data.filter(item => {
      return filters.every(filter => {
        const itemValue = (item as Record<string, unknown>)[filter.column];
        const filterValue = filter.value;

        if (itemValue === null || itemValue === undefined) {
          return filter.operator === 'equals' && filterValue === '';
        }

        switch (filter.operator) {
          case 'equals':
            if (typeof itemValue === 'boolean') {
              return itemValue.toString() === filterValue;
            }
            return String(itemValue).toLowerCase() === filterValue.toLowerCase();
          
          case 'contains':
            return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
          
          case 'greater':
            return typeof itemValue === 'number' && itemValue > Number(filterValue);
          
          case 'less':
            return typeof itemValue === 'number' && itemValue < Number(filterValue);
          
          case 'greaterEqual':
            return typeof itemValue === 'number' && itemValue >= Number(filterValue);
          
          case 'lessEqual':
            return typeof itemValue === 'number' && itemValue <= Number(filterValue);
          
          default:
            return true;
        }
      });
    });
  }

  // Apply filters whenever filters change
  useMemo(() => {
    const filteredData = applyFilters(data, filters);
    onFilterChange(filteredData);
  }, [data, filters, onFilterChange]);

  const addFilter = () => {
    const newFilter: FilterRule = {
      id: Date.now().toString(),
      column: availableColumns[0]?.key || '',
      operator: 'equals',
      value: ''
    };
    setFilters(prev => [...prev, newFilter]);
  };

  const removeFilter = (id: string) => {
    setFilters(prev => prev.filter(filter => filter.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<FilterRule>) => {
    setFilters(prev => prev.map(filter => 
      filter.id === id ? { ...filter, ...updates } : filter
    ));
  };

  const clearAllFilters = () => {
    setFilters([]);
  };

  const getSelectedColumnType = (columnKey: string) => {
    const column = availableColumns.find(col => col.key === columnKey);
    return column?.type || 'string';
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4 text-slate-500 dark:text-slate-400">
        <p>No data available for filtering</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">
            {filters.length > 0 ? `${filters.length} filter${filters.length === 1 ? '' : 's'} applied` : 'No filters applied'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addFilter}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Filter
          </Button>
          {filters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="space-y-2">
          {filters.map(filter => {
            const columnType = getSelectedColumnType(filter.column);
            const operators = getOperatorsForType(columnType);
            
            return (
              <Card key={filter.id} className="p-3">
                <div className="flex items-center gap-2">
                  {/* Column Select */}
                  <Select
                    value={filter.column}
                    onValueChange={(value) => updateFilter(filter.id, { column: value, operator: 'equals' })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColumns.map(column => (
                        <SelectItem key={column.key} value={column.key}>
                          {column.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Operator Select */}
                  <Select
                    value={filter.operator}
                    onValueChange={(value) => updateFilter(filter.id, { operator: value as FilterRule['operator'] })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map(operator => (
                        <SelectItem key={operator.value} value={operator.value}>
                          {operator.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Value Input */}
                  <Input
                    placeholder="Enter value..."
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    className="flex-1"
                    type={columnType === 'number' ? 'number' : 'text'}
                  />

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(filter.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Filter Summary */}
      {filters.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No filters applied. Click &quot;Add Filter&quot; to start filtering your data.</p>
        </div>
      )}
    </div>
  );
}
