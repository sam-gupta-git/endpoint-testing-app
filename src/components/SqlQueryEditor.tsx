"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Play, RotateCcw, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SqlQueryEditorProps {
  data: unknown;
  onQueryResult: (result: unknown, query: string) => void;
}

interface ColumnInfo {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  nullable: boolean;
}

interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  sampleData: unknown[];
  fullData: unknown[];
}

const SAMPLE_QUERIES = {
  users: [
    {
      name: "Select all users",
      query: "SELECT * FROM users"
    },
    {
      name: "Filter by department",
      query: "SELECT name, email, department FROM users WHERE department = 'Engineering'"
    },
    {
      name: "Sort by salary",
      query: "SELECT name, salary FROM users ORDER BY salary DESC"
    },
    {
      name: "Count by department",
      query: "SELECT department, COUNT(*) as count FROM users GROUP BY department"
    },
    {
      name: "Average salary by city",
      query: "SELECT city, AVG(salary) as avg_salary FROM users GROUP BY city"
    }
  ],
  posts: [
    {
      name: "Select all posts",
      query: "SELECT * FROM posts"
    },
    {
      name: "Published posts only",
      query: "SELECT title, views, likes FROM posts WHERE published = true"
    },
    {
      name: "Top posts by views",
      query: "SELECT title, views FROM posts ORDER BY views DESC LIMIT 5"
    },
    {
      name: "Posts by user",
      query: "SELECT title, body FROM posts WHERE userId = 1"
    }
  ],
  countries: [
    {
      name: "Select all countries",
      query: "SELECT * FROM data"
    },
    {
      name: "Largest countries by area",
      query: "SELECT name_common, area FROM data ORDER BY area DESC LIMIT 10"
    },
    {
      name: "Countries by continent",
      query: "SELECT continents, COUNT(*) as count FROM data GROUP BY continents"
    },
    {
      name: "Most populous countries",
      query: "SELECT name_common, population FROM data ORDER BY population DESC LIMIT 20"
    },
    {
      name: "Countries in Europe",
      query: "SELECT name_common, capital FROM data WHERE continents LIKE '%Europe%'"
    },
    {
      name: "Countries with area > 1M km²",
      query: "SELECT name_common, area FROM data WHERE area > 1000000 ORDER BY area DESC"
    },
    {
      name: "Countries by capital city",
      query: "SELECT name_common, capital FROM data WHERE capital IS NOT NULL ORDER BY name_common"
    }
  ],
  crypto: [
    {
      name: "Select all cryptocurrencies",
      query: "SELECT * FROM crypto"
    },
    {
      name: "Top by market cap",
      query: "SELECT name, current_price, market_cap FROM crypto ORDER BY market_cap DESC LIMIT 10"
    },
    {
      name: "Price changes",
      query: "SELECT name, price_change_percentage_24h FROM crypto WHERE price_change_percentage_24h > 0"
    }
  ],
  spacex: [
    {
      name: "All launches",
      query: "SELECT * FROM data"
    },
    {
      name: "Successful launches only",
      query: "SELECT mission_name, launch_date_utc, launch_success FROM data WHERE launch_success = true"
    },
    {
      name: "Recent launches",
      query: "SELECT mission_name, launch_date_utc, launch_success FROM data ORDER BY launch_date_utc DESC LIMIT 10"
    },
    {
      name: "Launch success rate by year",
      query: "SELECT YEAR(launch_date_utc) as year, COUNT(*) as total_launches, SUM(launch_success) as successful_launches FROM data GROUP BY YEAR(launch_date_utc)"
    },
    {
      name: "Falcon Heavy launches",
      query: "SELECT mission_name, launch_date_utc, rocket_name FROM data WHERE rocket_name LIKE '%Falcon Heavy%'"
    },
    {
      name: "Failed launches with details",
      query: "SELECT mission_name, launch_date_utc, details FROM data WHERE launch_success = false AND details IS NOT NULL"
    }
  ],
  pokemon: [
    {
      name: "All Pokemon",
      query: "SELECT * FROM data"
    },
    {
      name: "Top Pokemon by stats",
      query: "SELECT name, base_experience, height, weight FROM data ORDER BY base_experience DESC LIMIT 10"
    },
    {
      name: "Fire type Pokemon",
      query: "SELECT name, types FROM data WHERE types LIKE '%fire%'"
    },
    {
      name: "Heavy Pokemon",
      query: "SELECT name, weight FROM data WHERE weight > 100 ORDER BY weight DESC"
    },
    {
      name: "Pokemon with high HP",
      query: "SELECT name, stats_hp FROM data WHERE stats_hp > 100 ORDER BY stats_hp DESC"
    },
    {
      name: "Pokemon abilities",
      query: "SELECT name, abilities FROM data WHERE abilities IS NOT NULL"
    }
  ]
};

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET',
  'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS NULL', 'IS NOT NULL',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT', 'AS', 'ASC', 'DESC'
];

const OPERATORS = ['=', '!=', '<>', '<', '>', '<=', '>=', 'LIKE', 'IN', 'BETWEEN'];

export default function SqlQueryEditor({ data, onQueryResult }: SqlQueryEditorProps) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [selectedOperation, setSelectedOperation] = useState<string>("");

  // Flatten nested objects for better SQL querying
  const flattenObject = useCallback((obj: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
    const flattened: Record<string, unknown> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}_${key}` : key;
        const value = obj[key];
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Recursively flatten nested objects
          Object.assign(flattened, flattenObject(value as Record<string, unknown>, newKey));
        } else if (Array.isArray(value)) {
          // Handle arrays - convert to comma-separated string for SQL queries
          flattened[newKey] = value.map(item => 
            typeof item === 'object' ? JSON.stringify(item) : String(item)
          ).join(', ');
        } else {
          flattened[newKey] = value;
        }
      }
    }
    
    return flattened;
  }, []);

  // Analyze data structure to create table info
  const tableInfo = useMemo((): TableInfo | null => {
    if (!Array.isArray(data) || data.length === 0) return null;

    const sampleItem = data[0];
    if (typeof sampleItem !== 'object' || sampleItem === null) return null;

    // Flatten the data for better SQL querying
    const flattenedData = data.map(item => flattenObject(item));
    const flattenedSample = flattenedData[0];

    const columns: ColumnInfo[] = Object.entries(flattenedSample).map(([key, value]) => ({
      name: key,
      type: Array.isArray(value) ? 'array' : 
            value === null ? 'string' :
            typeof value === 'object' ? 'object' :
            typeof value as 'string' | 'number' | 'boolean',
      nullable: value === null
    }));

    return {
      name: 'data',
      columns,
      sampleData: flattenedData.slice(0, 3), // First 3 items for UI display
      fullData: flattenedData // Full dataset for querying
    };
  }, [data, flattenObject]);

  // Get sample queries based on data type
  const getSampleQueries = () => {
    if (!tableInfo) return [];
    
    const firstItem = tableInfo.sampleData[0] as Record<string, unknown>;
    
    // Determine data type based on common field names
    if (firstItem.mission_name && firstItem.launch_date_utc) return SAMPLE_QUERIES.spacex;
    if (firstItem.name && firstItem.types && firstItem.base_experience) return SAMPLE_QUERIES.pokemon;
    if (firstItem.name && firstItem.email) return SAMPLE_QUERIES.users;
    if (firstItem.title && firstItem.body) return SAMPLE_QUERIES.posts;
    if (firstItem.name && firstItem.population) return SAMPLE_QUERIES.countries;
    if (firstItem.name && firstItem.current_price) return SAMPLE_QUERIES.crypto;
    
    return SAMPLE_QUERIES.users; // Default fallback
  };

  const sampleQueries = getSampleQueries();

  // Simple SQL parser and executor
  const executeQuery = (sql: string): unknown => {
    if (!tableInfo) throw new Error("No data available for querying");

    const normalizedSql = sql.trim().toUpperCase();
    
    // Basic SELECT parsing
    if (!normalizedSql.startsWith('SELECT')) {
      throw new Error("Only SELECT queries are supported");
    }

    let result = [...tableInfo.fullData];

    // Parse WHERE clause
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+GROUP\s+BY|\s+LIMIT|$)/i);
    if (whereMatch) {
      const whereClause = whereMatch[1].trim();
      result = result.filter(item => evaluateWhereClause(item, whereClause));
    }

    // Parse ORDER BY clause
    const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
      const column = orderMatch[1];
      const direction = orderMatch[2]?.toUpperCase() === 'DESC' ? 'desc' : 'asc';
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[column];
        const bVal = (b as Record<string, unknown>)[column];
        
        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return direction === 'asc' ? -1 : 1;
        if (bVal == null) return direction === 'asc' ? 1 : -1;
        
        // Type-safe comparison
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        
        if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
          const aNum = aVal ? 1 : 0;
          const bNum = bVal ? 1 : 0;
          return direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // Fallback to string comparison
        const aStr = String(aVal);
        const bStr = String(bVal);
        return direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    // Parse LIMIT clause
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1]);
      result = result.slice(0, limit);
    }

    // Parse SELECT columns
    const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i);
    if (selectMatch) {
      const columns = selectMatch[1].trim();
      if (columns !== '*') {
        const columnList = columns.split(',').map(col => col.trim());
        result = result.map(item => {
          const filtered: Record<string, unknown> = {};
          columnList.forEach(col => {
            if (col in (item as Record<string, unknown>)) {
              filtered[col] = (item as Record<string, unknown>)[col];
            }
          });
          return filtered;
        });
      }
    }

    return result;
  };

  const evaluateWhereClause = (item: unknown, clause: string): boolean => {
    const obj = item as Record<string, unknown>;
    
    // Simple equality check
    const eqMatch = clause.match(/(\w+)\s*=\s*['"]?([^'"]*)['"]?/);
    if (eqMatch) {
      const [, column, value] = eqMatch;
      const itemValue = obj[column];
      const stringValue = value.replace(/['"]/g, '');
      
      if (typeof itemValue === 'string') {
        return itemValue === stringValue;
      } else if (typeof itemValue === 'number') {
        return itemValue === parseFloat(stringValue);
      } else if (typeof itemValue === 'boolean') {
        return itemValue === (stringValue.toLowerCase() === 'true');
      }
    }

    // LIKE operator
    const likeMatch = clause.match(/(\w+)\s+LIKE\s+['"]([^'"]*)['"]/);
    if (likeMatch) {
      const [, column, pattern] = likeMatch;
      const itemValue = obj[column];
      if (typeof itemValue === 'string') {
        const regex = new RegExp(pattern.replace(/%/g, '.*'));
        return regex.test(itemValue);
      }
    }

    return true; // Default to true if can't parse
  };

  const handleExecuteQuery = async () => {
    if (!query.trim()) return;

    setIsExecuting(true);
    setError(null);

    try {
      const result = executeQuery(query);
      onQueryResult(result, query);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query execution failed");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
    setError(null);
  };

  const handleReset = () => {
    setQuery("");
    setError(null);
    onQueryResult(data, "");
  };

  const handleCopyQuery = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopiedQuery(true);
      setTimeout(() => setCopiedQuery(false), 2000);
    } catch (err) {
      console.error('Failed to copy query:', err);
    }
  };

  const insertAtCursor = (text: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newQuery = query.substring(0, start) + text + query.substring(end);
      setQuery(newQuery);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.setSelectionRange(start + text.length, start + text.length);
        textarea.focus();
      }, 0);
    }
  };

  const handleTableSelect = (table: string) => {
    setSelectedTable(table);
    insertAtCursor(`FROM ${table} `);
  };

  const handleColumnSelect = (column: string) => {
    setSelectedColumn(column);
    insertAtCursor(column);
  };

  const handleOperationSelect = (operation: string) => {
    setSelectedOperation(operation);
    insertAtCursor(` ${operation} `);
  };

  if (!tableInfo) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-slate-500 dark:text-slate-400">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>SQL queries are only available for array data</p>
            <p className="text-xs mt-2">
              Data type: {Array.isArray(data) ? `Array (${data.length} items)` : typeof data}
              {Array.isArray(data) && data.length > 0 && (
                <span> | First item type: {typeof data[0]}</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Query Builder Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Query Builder
          </CardTitle>
          <CardDescription>
            Use these tools to help build your SQL query
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Table
              </label>
              <Select value={selectedTable} onValueChange={handleTableSelect}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={tableInfo.name}>{tableInfo.name}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Column
              </label>
              <Select value={selectedColumn} onValueChange={handleColumnSelect}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {tableInfo.columns.map((column) => (
                    <SelectItem key={column.name} value={column.name}>
                      <div className="flex items-center gap-2">
                        <span>{column.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {column.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Operation
              </label>
              <Select value={selectedOperation} onValueChange={handleOperationSelect}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((op) => (
                    <SelectItem key={op} value={op}>{op}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {SQL_KEYWORDS.map((keyword) => (
              <Button
                key={keyword}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => insertAtCursor(` ${keyword} `)}
              >
                {keyword}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sample Queries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Sample Queries</CardTitle>
          <CardDescription>
            Click on any query to load it into the editor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {sampleQueries.map((sample, index) => (
              <Button
                key={index}
                variant="ghost"
                className="h-auto p-4 justify-start text-left w-full"
                onClick={() => handleSampleQuery(sample.query)}
              >
                <div className="w-full">
                  <div className="font-medium text-sm mb-2">{sample.name}</div>
                  <code className="text-xs text-slate-500 dark:text-slate-400 block break-all whitespace-normal">
                    {sample.query}
                  </code>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Query Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                SQL Query Editor
              </CardTitle>
              <CardDescription>
                Write custom SQL queries to filter and transform your data
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyQuery}
                disabled={!query.trim()}
              >
                {copiedQuery ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!query.trim()}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT * FROM data WHERE column = 'value' ORDER BY column LIMIT 10"
              className={cn(
                "w-full h-32 p-3 border rounded-lg font-mono text-sm resize-none",
                "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500"
              )}
              style={{ tabSize: 2 }}
            />
            <div className="absolute top-2 right-2 text-xs text-slate-400">
              {query.length} characters
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!query.trim() && (
            <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              💡 <strong>Tip:</strong> Enter a SQL query above or click on one of the sample queries to get started.
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p>Available columns: {tableInfo.columns.map(c => c.name).join(', ')}</p>
              <p>Data type: {tableInfo.columns.map(c => `${c.name} (${c.type})`).join(', ')}</p>
            </div>
            <Button
              onClick={handleExecuteQuery}
              disabled={!query.trim() || isExecuting}
              className={`flex items-center gap-2 ${!query.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={!query.trim() ? "Enter a SQL query to enable execution" : isExecuting ? "Query is executing..." : "Execute SQL query"}
            >
              {isExecuting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isExecuting ? 'Executing...' : 'Execute Query'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
