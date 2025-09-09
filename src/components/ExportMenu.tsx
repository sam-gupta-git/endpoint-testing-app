"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, Table, Check } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface ExportMenuProps {
  data: unknown;
}

export default function ExportMenu({ data }: ExportMenuProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<string | null>(null);

  const flattenObject = (obj: unknown, prefix = ''): Record<string, unknown> => {
    const flattened: Record<string, unknown> = {};
    
    if (typeof obj !== 'object' || obj === null) return flattened;
    
    for (const key in obj as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const value = (obj as Record<string, unknown>)[key];
        
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(flattened, flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
          flattened[newKey] = value.length > 0 ? JSON.stringify(value) : '';
        } else {
          flattened[newKey] = value;
        }
      }
    }
    
    return flattened;
  };

  const prepareDataForExport = (data: unknown): Record<string, unknown>[] => {
    if (Array.isArray(data)) {
      return data.map(item => 
        typeof item === 'object' && item !== null ? flattenObject(item) : { value: item }
      );
    } else if (typeof data === 'object' && data !== null) {
      return [flattenObject(data)];
    } else {
      return [{ value: data }];
    }
  };

  const exportToCSV = async () => {
    if (!data) return;
    
    setExporting('csv');
    try {
      const exportData = prepareDataForExport(data);
      const csv = Papa.unparse(exportData);
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `api-data-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExported('csv');
      setTimeout(() => setExported(null), 3000);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    } finally {
      setExporting(null);
    }
  };

  const exportToExcel = async () => {
    if (!data) return;
    
    setExporting('excel');
    try {
      const exportData = prepareDataForExport(data);
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Create blob and download
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `api-data-${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExported('excel');
      setTimeout(() => setExported(null), 3000);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setExporting(null);
    }
  };

  const exportToJSON = async () => {
    if (!data) return;
    
    setExporting('json');
    try {
      const jsonString = JSON.stringify(data, null, 2);
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `api-data-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExported('json');
      setTimeout(() => setExported(null), 3000);
    } catch (error) {
      console.error('Error exporting to JSON:', error);
    } finally {
      setExporting(null);
    }
  };

  const getDataInfo = () => {
    if (Array.isArray(data)) {
      return `${data.length} items`;
    } else if (typeof data === 'object' && data !== null) {
      return `${Object.keys(data).length} properties`;
    } else {
      return '1 item';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {getDataInfo()}
      </span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            {exported ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                {exported === 'csv' ? 'CSV Exported' : 
                 exported === 'excel' ? 'Excel Exported' : 
                 'JSON Exported'}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={exportToCSV}
            disabled={exporting === 'csv'}
            className="flex items-center gap-2"
          >
            {exporting === 'csv' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Exporting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Export as CSV
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={exportToExcel}
            disabled={exporting === 'excel'}
            className="flex items-center gap-2"
          >
            {exporting === 'excel' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Exporting...
              </>
            ) : (
              <>
                <Table className="h-4 w-4" />
                Export as Excel
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={exportToJSON}
            disabled={exporting === 'json'}
            className="flex items-center gap-2"
          >
            {exporting === 'json' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Exporting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Export as JSON
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
