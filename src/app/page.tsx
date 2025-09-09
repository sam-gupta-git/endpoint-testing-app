"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe, Database, Filter } from "lucide-react";
import ApiInput, { ApiInputRef } from "@/components/ApiInput";
import DataTabs from "@/components/DataTabs";
import FilterPanel from "@/components/FilterPanel";
import ThemeToggle from "@/components/ThemeToggle";

interface EndpointHistory {
  url: string;
  name: string;
  timestamp: number;
}

export default function Home() {
  const [apiData, setApiData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<unknown>(null);
  const [activeFilters, setActiveFilters] = useState<unknown[]>([]);
  const [endpointHistory, setEndpointHistory] = useState<EndpointHistory[]>([]);
  const apiInputRef = useRef<ApiInputRef>(null);

  const getEndpointName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;
      
      // Extract meaningful name from URL
      if (hostname.includes('jsonplaceholder')) {
        if (pathname.includes('/users')) return 'JSONPlaceholder Users';
        if (pathname.includes('/posts')) return 'JSONPlaceholder Posts';
        return 'JSONPlaceholder API';
      }
      if (hostname.includes('restcountries')) return 'Countries Data';
      if (hostname.includes('dog.ceo')) return 'Dog Breeds';
      if (hostname.includes('openweathermap')) return 'Weather Data';
      if (hostname.includes('coingecko')) return 'Cryptocurrency Prices';
      if (hostname.includes('quotable')) return 'Random Quotes';
      
      // Fallback to hostname + path
      return `${hostname}${pathname}`;
    } catch {
      return url;
    }
  };

  const handleDataFetch = (data: unknown, url: string) => {
    setApiData(data);
    setFilteredData(data);
    setError(null);
    
    // Add to history
    const endpointName = getEndpointName(url);
    const newHistoryItem: EndpointHistory = {
      url,
      name: endpointName,
      timestamp: Date.now()
    };
    
    setEndpointHistory(prev => {
      // Remove if already exists to avoid duplicates
      const filtered = prev.filter(item => item.url !== url);
      // Add to beginning and limit to 5 items
      return [newHistoryItem, ...filtered].slice(0, 5);
    });
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setApiData(null);
    setFilteredData(null);
  };

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  const handleFilterChange = (filtered: unknown, filters?: unknown[]) => {
    setFilteredData(filtered);
    setActiveFilters(filters || []);
  };

  const handleLogoClick = () => {
    setApiData(null);
    setFilteredData(null);
    setActiveFilters([]);
    setError(null);
    setLoading(false);
    apiInputRef.current?.clearInput();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="p-2 bg-blue-600 rounded-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  API Data Playground
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Fetch, visualize, and export data from any public API
                </p>
              </div>
            </button>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Badge variant="secondary" className="hidden sm:flex">
                <Globe className="h-3 w-3 mr-1" />
                Public APIs Only
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* API Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API Endpoint
              </CardTitle>
              <CardDescription>
                Enter a public API endpoint to fetch and visualize its data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiInput
                ref={apiInputRef}
                onDataFetch={handleDataFetch}
                onError={handleError}
                onLoading={handleLoading}
                endpointHistory={endpointHistory}
              />
              {apiData && !loading && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Data loaded successfully</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error as string}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Fetching data from API...
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Display Section */}
          {apiData && (
            <div className="space-y-6">
              {/* Data Visualization */}
              <DataTabs data={filteredData || apiData} activeFilters={activeFilters} />

              {/* Filters - Under the table view */}
              {Array.isArray(apiData) && apiData.length > 0 && (
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Filter className="h-4 w-4" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <FilterPanel
                      data={apiData}
                      onFilterChange={handleFilterChange}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Sample APIs */}
          {!apiData && !loading && (
            <Card>
              <CardHeader>
                <CardTitle>Try These Sample APIs</CardTitle>
                <CardDescription>
                  Click on any of these endpoints to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      name: "JSONPlaceholder Users",
                      url: "https://jsonplaceholder.typicode.com/users",
                      description: "Sample user data with names, emails, and addresses"
                    },
                    {
                      name: "JSONPlaceholder Posts",
                      url: "https://jsonplaceholder.typicode.com/posts",
                      description: "Sample blog posts with titles and content"
                    },
                    {
                      name: "Countries Data",
                      url: "https://restcountries.com/v3.1/all?fields=name,population,area,continents,capital",
                      description: "Country data with population, area, and continent information"
                    },
                    {
                      name: "Dog Breeds",
                      url: "https://dog.ceo/api/breeds/list/all",
                      description: "List of dog breeds organized by type"
                    },
                    {
                      name: "Weather (London)",
                      url: "https://api.openweathermap.org/data/2.5/weather?q=London&appid=demo",
                      description: "Current weather data (demo key)"
                    },
                    {
                      name: "Cryptocurrency Prices",
                      url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false",
                      description: "Top 20 cryptocurrencies with prices, market cap, and volume data"
                    }
                  ].map((api, index) => (
                    <Card 
                      key={index} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        apiInputRef.current?.setUrl(api.url);
                      }}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-2">{api.name}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                          {api.description}
                        </p>
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded break-all">
                          {api.url}
                        </code>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <p>Built with Next.js, Tailwind CSS, and ShadCN UI</p>
            <p className="mt-1">
              ⚠️ Only use public APIs. Never send sensitive data or API keys.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
