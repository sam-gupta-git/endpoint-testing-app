# API Data Playground

A modern web application for fetching, visualizing, and exporting data from any public API endpoint. Built with Next.js, TypeScript, and Tailwind CSS.

![API Data Playground](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🚀 Features

### Core Functionality
- **API Data Fetching**: Connect to any public API endpoint with real-time validation
- **Multiple Data Views**: JSON tree viewer, interactive tables, and dynamic charts
- **Data Filtering**: Advanced filtering capabilities for array data
- **Export Options**: Download data in CSV, Excel, or JSON formats
- **Sample APIs**: Quick access to popular public APIs for testing

### Data Visualization
- **JSON Viewer**: Collapsible tree structure with syntax highlighting
- **Table View**: Sortable columns with search functionality
- **Chart Generation**: 
  - Bar charts for categorical data
  - Line charts for trend analysis
  - Pie charts for proportional data
- **Auto-detection**: Automatically identifies numeric and string columns

### Security & Validation
- **URL Validation**: Real-time URL format checking
- **Security Restrictions**: Blocks private/localhost endpoints
- **Protocol Validation**: Only allows HTTP/HTTPS connections
- **Timeout Protection**: 10-second request timeout
- **Content Type Validation**: Ensures JSON response format

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI primitives with custom styling
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Export Libraries**: Papa Parse (CSV), XLSX (Excel)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd endpoint-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage Guide

### Getting Started

1. **Enter an API Endpoint**
   - Type or paste a public API URL in the input field
   - Use the built-in sample APIs for quick testing
   - Real-time validation ensures URL format is correct

2. **Fetch Data**
   - Click the "Fetch" button or press Enter
   - Wait for the API response (up to 10 seconds)
   - View success/error messages with detailed feedback

3. **Explore Your Data**
   - **JSON Tab**: Browse the raw data structure
   - **Table Tab**: View array data in a sortable table
   - **Charts Tab**: Generate visualizations (when numeric data is present)

### Data Filtering

When working with array data:
1. Use the **Filters** panel to create custom filter rules
2. Choose from multiple operators: equals, contains, greater than, etc.
3. Apply filters to focus on specific data subsets
4. Filters work across all data views (JSON, Table, Charts)

### Chart Customization

For data with numeric values:
1. Select chart type: Bar, Line, or Pie
2. Choose X-axis (categorical data) and Y-axis (numeric data)
3. Charts automatically adapt to your data structure
4. Hover for detailed tooltips and data points

### Exporting Data

1. Click the **Export** button in the data info section
2. Choose your format:
   - **CSV**: For spreadsheet applications
   - **Excel**: For advanced Excel features
   - **JSON**: For programming/development use
3. Files download automatically with descriptive names

## 🔧 API Requirements

### Supported APIs
- **Protocol**: HTTP/HTTPS only
- **Format**: JSON response required
- **Access**: Public endpoints only (no authentication)
- **Timeout**: 10-second maximum response time

### Blocked Endpoints
- Localhost/private IP addresses
- Internal network ranges (10.x.x.x, 192.168.x.x, etc.)
- Non-HTTP protocols

### Sample APIs to Try
- `https://jsonplaceholder.typicode.com/users` - User data
- `https://jsonplaceholder.typicode.com/posts` - Blog posts
- `https://catfact.ninja/facts?limit=20` - Cat facts
- `https://dog.ceo/api/breeds/list/all` - Dog breeds
- `https://api.quotable.io/quotes?limit=20` - Inspirational quotes

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── ApiInput.tsx      # API endpoint input with validation
│   ├── DataTabs.tsx      # Tab navigation for data views
│   ├── JsonViewer.tsx    # JSON tree viewer
│   ├── TableView.tsx     # Data table with sorting
│   ├── ChartView.tsx     # Chart generation and controls
│   ├── FilterPanel.tsx   # Data filtering interface
│   └── ExportMenu.tsx    # Export functionality
└── lib/                  # Utility functions
    ├── actions.ts        # Server actions for API fetching
    ├── sample-data.ts    # Sample data for testing
    └── utils.ts          # Helper utilities
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔒 Security Considerations

- **Public APIs Only**: Never use this tool with private or authenticated endpoints
- **No Data Storage**: All data is processed client-side and not stored
- **CORS Handling**: Some APIs may block browser requests due to CORS policies
- **Rate Limiting**: Respect API rate limits and terms of service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Recharts](https://recharts.org/) for beautiful chart components
- [Lucide](https://lucide.dev/) for the icon library

---

**⚠️ Important**: This tool is designed for educational and development purposes. Always respect API terms of service and never use it to access private or sensitive data.