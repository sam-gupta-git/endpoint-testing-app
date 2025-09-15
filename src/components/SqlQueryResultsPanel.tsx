"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Table, BarChart3, Database } from "lucide-react";
import JsonViewer from "./JsonViewer";
import TableView from "./TableView";
import ChartView from "./ChartView";

interface SqlQueryResultsPanelProps {
  data: unknown;
  query: string;
  isVisible: boolean;
}

export default function SqlQueryResultsPanel({ data, query, isVisible }: SqlQueryResultsPanelProps) {
  if (!isVisible) {
    return null;
  }

  const isArray = Array.isArray(data);
  const hasNumericData = isArray && data.length > 0 && data.some((item: unknown) => 
    typeof item === 'object' && item !== null && 
    Object.values(item as Record<string, unknown>).some(value => typeof value === 'number')
  );

  // Determine default tab: charts if visualizable data, otherwise table if array, otherwise json
  const getDefaultTab = () => {
    if (hasNumericData) return "chart";
    if (isArray) return "table";
    return "json";
  };

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Database className="h-5 w-5" />
              SQL Query Results
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Results from your SQL query
              {query && (
                <span className="block mt-1 font-mono text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                  {query}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">
            {isArray && `${data.length} result${data.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={getDefaultTab()} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="json" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger 
              value="table" 
              className="flex items-center gap-2"
              disabled={!isArray}
            >
              <Table className="h-4 w-4" />
              Table
            </TabsTrigger>
            <TabsTrigger 
              value="chart" 
              className="flex items-center gap-2"
              disabled={!hasNumericData}
            >
              <BarChart3 className="h-4 w-4" />
              Charts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="mt-4">
            <JsonViewer data={data} />
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            {isArray ? (
              <TableView data={data} />
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Table className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Table view is only available for array data</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chart" className="mt-4">
            {hasNumericData ? (
              <ChartView data={data} />
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Charts are only available for data with numeric values</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
