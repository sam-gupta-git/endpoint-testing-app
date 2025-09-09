"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, Copy, Check } from "lucide-react";

interface JsonViewerProps {
  data: unknown;
}

interface JsonNodeProps {
  data: unknown;
  keyName?: string;
  level?: number;
}

function JsonNode({ data, keyName, level = 0 }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const [copied, setCopied] = useState(false);

  const handleCopy = async (value: unknown) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getValueType = (value: unknown): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const getValueColor = (type: string): string => {
    switch (type) {
      case 'string': return 'text-green-600 dark:text-green-400';
      case 'number': return 'text-blue-600 dark:text-blue-400';
      case 'boolean': return 'text-purple-600 dark:text-purple-400';
      case 'null': return 'text-gray-500 dark:text-gray-400';
      case 'array': return 'text-orange-600 dark:text-orange-400';
      case 'object': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-300';
    }
  };

  const formatValue = (value: unknown, type: string): string => {
    if (type === 'string') return `"${value}"`;
    if (type === 'null') return 'null';
    if (type === 'boolean') return String(value);
    if (type === 'number') return String(value);
    if (type === 'array') return `Array(${(value as unknown[]).length})`;
    if (type === 'object') return `Object(${Object.keys(value as Record<string, unknown>).length})`;
    return String(value);
  };

  const indent = level * 20;

  if (data === null || data === undefined) {
    return (
      <div className="flex items-center" style={{ paddingLeft: indent }}>
        {keyName && (
          <span className="text-blue-600 dark:text-blue-400 font-medium mr-2">
            &quot;{keyName}&quot;:
          </span>
        )}
        <span className="text-gray-500 dark:text-gray-400">null</span>
      </div>
    );
  }

  const type = getValueType(data);

  if (type === 'array' || type === 'object') {
    const items = type === 'array' ? (data as unknown[]) : Object.entries(data as Record<string, unknown>);
    const isEmpty = items.length === 0;

    return (
      <div style={{ paddingLeft: indent }}>
        <div className="flex items-center group">
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 mr-1 hover:bg-transparent"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
          
          {keyName && (
            <span className="text-blue-600 dark:text-blue-400 font-medium mr-2">
              &quot;{keyName}&quot;:
            </span>
          )}
          
          <span className={`${getValueColor(type)} font-medium`}>
            {type === 'array' ? '[' : '{'}
          </span>
          
          {!isEmpty && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleCopy(data)}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>

        {isExpanded && !isEmpty && (
          <div className="mt-1">
            {items.map((item: unknown, index: number) => {
              if (type === 'array') {
                return (
                  <JsonNode
                    key={index}
                    data={item}
                    level={level + 1}
                  />
                );
              } else {
                const [key, value] = item as [string, unknown];
                return (
                  <JsonNode
                    key={key}
                    data={value}
                    keyName={key}
                    level={level + 1}
                  />
                );
              }
            })}
          </div>
        )}

        {isExpanded && (
          <div className="flex items-center" style={{ paddingLeft: indent + 20 }}>
            <span className={`${getValueColor(type)} font-medium`}>
              {type === 'array' ? ']' : '}'}
            </span>
          </div>
        )}

        {!isExpanded && (
          <span className={`${getValueColor(type)} font-medium ml-6`}>
            {type === 'array' ? ']' : '}'}
          </span>
        )}
      </div>
    );
  }

  // Primitive values
  return (
    <div className="flex items-center group" style={{ paddingLeft: indent }}>
      {keyName && (
        <span className="text-blue-600 dark:text-blue-400 font-medium mr-2">
          &quot;{keyName}&quot;:
        </span>
      )}
      <span className={getValueColor(type)}>
        {formatValue(data, type)}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => handleCopy(data)}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}

export default function JsonViewer({ data }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {Array.isArray(data) ? 'Array' : 'Object'}
          </Badge>
          {Array.isArray(data) && (
            <Badge variant="secondary">
              {data.length} items
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyAll}
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy JSON
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 overflow-auto h-[28rem]">
            <JsonNode data={data} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
