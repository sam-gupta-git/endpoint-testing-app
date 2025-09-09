"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Table, BarChart3 } from "lucide-react";
import JsonViewer from "./JsonViewer";
import TableView from "./TableView";
import ChartView from "./ChartView";

interface DataTabsProps {
  data: unknown;
}

export default function DataTabs({ data }: DataTabsProps) {
  const isArray = Array.isArray(data);
  const hasNumericData = isArray && data.length > 0 && data.some((item: unknown) => 
    typeof item === 'object' && item !== null && 
    Object.values(item as Record<string, unknown>).some(value => typeof value === 'number')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Data Visualization
        </CardTitle>
        <CardDescription>
          View your data in different formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="json" className="w-full">
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
              {!isArray && <Badge variant="secondary" className="ml-1 text-xs">N/A</Badge>}
            </TabsTrigger>
            <TabsTrigger 
              value="chart" 
              className="flex items-center gap-2"
              disabled={!hasNumericData}
            >
              <BarChart3 className="h-4 w-4" />
              Charts
              {!hasNumericData && <Badge variant="secondary" className="ml-1 text-xs">N/A</Badge>}
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
