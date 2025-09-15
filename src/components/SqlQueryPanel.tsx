"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";
import SqlQueryEditor from "./SqlQueryEditor";

interface SqlQueryPanelProps {
  data: unknown;
  onQueryResult: (result: unknown, query: string) => void;
}

export default function SqlQueryPanel({ data, onQueryResult }: SqlQueryPanelProps) {
  const isArray = Array.isArray(data);

  if (!isArray) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            SQL Query Editor
          </CardTitle>
          <CardDescription>
            Write custom SQL queries to filter and transform your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>SQL queries are only available for array data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          SQL Query Editor
        </CardTitle>
        <CardDescription>
          Write custom SQL queries to filter and transform your data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SqlQueryEditor data={data} onQueryResult={onQueryResult} />
      </CardContent>
    </Card>
  );
}
