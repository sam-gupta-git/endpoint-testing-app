"use server";

export async function fetchApiData(url: string) {
  try {
    // Validate URL
    if (!url || typeof url !== 'string') {
      throw new Error('Please provide a valid URL');
    }

    // Check if URL is valid
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are allowed');
    }

    // Basic security checks
    const hostname = parsedUrl.hostname.toLowerCase();
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      '10.',
      '172.',
      '192.168.',
      '169.254.'
    ];

    if (blockedHosts.some(blocked => hostname.startsWith(blocked))) {
      throw new Error('Private/localhost URLs are not allowed for security reasons');
    }

    // Fetch the data
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'API-Data-Playground/1.0'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API must return JSON data');
    }

    const data = await response.json();
    
    // Validate that we got some data
    if (data === null || data === undefined) {
      throw new Error('API returned empty or null data');
    }

    return {
      success: true,
      data,
      url,
      timestamp: new Date().toISOString(),
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    };

  } catch (error) {
    console.error('API fetch error:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        url,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred while fetching the API',
      url,
      timestamp: new Date().toISOString()
    };
  }
}
