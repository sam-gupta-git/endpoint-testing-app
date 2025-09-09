"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { fetchApiData } from "@/lib/actions";

interface EndpointHistory {
  url: string;
  name: string;
  timestamp: number;
}

interface ApiInputProps {
  onDataFetch: (data: unknown, url: string) => void;
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
  endpointHistory: EndpointHistory[];
}

export interface ApiInputRef {
  setUrl: (url: string) => void;
  clearInput: () => void;
}

const ApiInput = forwardRef<ApiInputRef, ApiInputProps>(({ onDataFetch, onError, onLoading, endpointHistory }, ref) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState("");

  useImperativeHandle(ref, () => ({
    setUrl: (newUrl: string) => {
      setUrl(newUrl);
      validateUrl(newUrl);
    },
    clearInput: () => {
      setUrl("");
      setValidationStatus('idle');
      setValidationMessage("");
    }
  }));

  const validateUrl = (inputUrl: string): boolean => {
    if (!inputUrl.trim()) {
      setValidationStatus('idle');
      setValidationMessage("");
      return false;
    }

    try {
      const parsedUrl = new URL(inputUrl);
      
      // Check protocol
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        setValidationStatus('invalid');
        setValidationMessage("Only HTTP and HTTPS URLs are allowed");
        return false;
      }

      // Check for basic URL structure
      if (!parsedUrl.hostname) {
        setValidationStatus('invalid');
        setValidationMessage("Invalid URL format");
        return false;
      }

      setValidationStatus('valid');
      setValidationMessage("URL looks good!");
      return true;
    } catch {
      setValidationStatus('invalid');
      setValidationMessage("Invalid URL format");
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    validateUrl(newUrl);
  };

  const handleFetch = async () => {
    if (!url.trim() || !validateUrl(url)) {
      onError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    onLoading(true);
    setValidationStatus('idle');
    setValidationMessage("");

    try {
      const result = await fetchApiData(url);
      
      if (result.success) {
        onDataFetch(result.data, url);
        setValidationStatus('valid');
        setValidationMessage("Data fetched successfully!");
      } else {
        onError(result.error || "Failed to fetch data");
        setValidationStatus('invalid');
        setValidationMessage(result.error || "Failed to fetch data");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      onError(errorMessage);
      setValidationStatus('invalid');
      setValidationMessage(errorMessage);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleFetch();
    }
  };

  const handleSampleClick = (sampleUrl: string) => {
    setUrl(sampleUrl);
    validateUrl(sampleUrl);
  };

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type="url"
              placeholder="https://api.example.com/data"
              value={url}
              onChange={handleUrlChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="pr-10"
            />
            {validationStatus === 'valid' && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
            {validationStatus === 'invalid' && (
              <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
            )}
          </div>
          <Button 
            onClick={handleFetch} 
            disabled={loading || !url.trim() || validationStatus === 'invalid'}
            className="min-w-[100px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Fetching
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Fetch
              </>
            )}
          </Button>
        </div>

        {/* Validation Message */}
        {validationMessage && (
          <div className="text-sm">
            {validationStatus === 'valid' ? (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {validationMessage}
              </span>
            ) : validationStatus === 'invalid' ? (
              <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {validationMessage}
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* History Buttons */}
      {endpointHistory.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Recent endpoints:
          </p>
          <div className="flex flex-wrap gap-2">
            {endpointHistory.map((endpoint, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => handleSampleClick(endpoint.url)}
                title={endpoint.url}
              >
                {endpoint.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Security Notice */}
      <Alert>
        <AlertDescription className="text-sm">
          <strong>Security Notice:</strong> Only use public APIs. This tool will not work with private endpoints, 
          localhost URLs, or APIs requiring authentication. Never share sensitive data or API keys.
        </AlertDescription>
      </Alert>
    </div>
  );
});

ApiInput.displayName = "ApiInput";

export default ApiInput;
