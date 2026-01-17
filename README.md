# Rolling Shutter Price Calculator

A professional, production-ready Rolling Shutter Price Calculator with a modern React frontend and Node.js backend. This application provides accurate quotation generation, PDF export, and admin price management capabilities.

## Features

### Calculator Interface
- **Product Configuration**: Select from multiple product types (Plastic, Aluminium, Mosquito Net)
- **Automatic Calculations**: Real-time area calculation from width and height inputs (in centimeters)
- **Flexible Pricing**: Configurable VAT percentage and discount options (percentage or fixed amount)
- **Additional Costs**: Add custom cost items like delivery and installation
- **Customer Information**: Comprehensive customer details form
- **Quotation Summary**: Live preview of all calculations with breakdown

### Quotation Management
- **Save Quotations**: Store quotations with unique reference numbers
- **Quotation History**: View all past quotations with filtering and search
- **PDF Generation**: Professional PDF export with company branding
- **Database Storage**: All quotations stored securely in MySQL database

### Admin Panel
- **Price Management**: Update square meter prices for each product type
- **Role-Based Access**: Secure admin-only access with authentication
- **Real-time Updates**: Price changes reflect immediately in the calculator
- **Audit Trail**: Track price changes with timestamps

## Technology Stack

### Frontend
- **React 19**: Modern UI library with hooks
- **Bootstrap 5**: Responsive, mobile-first styling
- **React Bootstrap**: Bootstrap components for React
- **Tailwind CSS 4**: Utility-first CSS framework
- **tRPC**: Type-safe API client
- **Wouter**: Lightweight routing

### Backend
- **Node.js**: JavaScript runtime
- **Express 4**: Web application framework
- **tRPC 11**: End-to-end type-safe APIs
- **Drizzle ORM**: Type-safe database ORM
- **MySQL/TiDB**: Relational database
- **PDFKit**: PDF generation library

## Project Structure

```
rolling_shutter_calculator/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── Calculator.tsx    # Main calculator interface
│   │   │   ├── Admin.tsx         # Admin price management
│   │   │   └── QuotationHistory.tsx  # Quotation history view
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Utilities and tRPC client
│   │   └── index.css         # Global styles with Bootstrap
│   └── index.html            # HTML entry point
├── server/                    # Backend Node.js application
│   ├── routers.ts            # tRPC API routes
│   ├── db.ts                 # Database queries
│   ├── pdfGenerator.ts       # PDF generation logic
│   └── *.test.ts             # Vitest unit tests
├── drizzle/                   # Database schema and migrations
│   └── schema.ts             # Database table definitions
└── README.md                 # This file
```

## Getting Started

### Prerequisites
- Node.js 22.x or higher
- MySQL or TiDB database
- pnpm package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables (automatically configured in Manus environment)

4. Push database schema:
   ```bash
   pnpm db:push
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Access the application at `http://localhost:3000`

### Default Product Prices

The application comes pre-configured with default prices:
- **Plastic**: €45.00/m²
- **Aluminium**: €85.00/m²
- **Mosquito Net**: €35.00/m²

Admins can update these prices through the Admin Panel.

## Usage Guide

### Creating a Quotation

1. **Configure Product**:
   - Select product type from dropdown
   - Enter width and height in centimeters
   - Set quantity
   - Configure VAT percentage (default: 20%)

2. **Apply Discounts** (optional):
   - Choose discount type: None, Percentage, or Fixed Amount
   - Enter discount value

3. **Add Additional Costs** (optional):
   - Click "+ Add Cost"
   - Enter cost name (e.g., "Delivery", "Installation")
   - Enter amount in euros

4. **Enter Customer Information**:
   - Customer name (required)
   - Email, phone, and address (optional)
   - Additional notes

5. **Save and Generate**:
   - Review the quotation summary
   - Click "Save Quotation" to store in database
   - Click "Download PDF" to generate printable quotation

### Admin Price Management

1. Navigate to Admin Panel (admin users only)
2. View current prices for all product types
3. Enter new price in the "New Price" column
4. Click "Update" to save changes
5. Changes are immediately reflected in the calculator

### Viewing Quotation History

1. Click "📋 History" in the navigation
2. Browse all saved quotations
3. Click "PDF" button to download any quotation
4. View customer details, product info, and totals

## API Endpoints

### Public Endpoints
- `products.getPrices`: Fetch all product prices
- `products.getPrice`: Fetch specific product price
- `calculator.calculate`: Calculate quotation with all pricing logic
- `quotations.create`: Save new quotation
- `quotations.getAll`: Fetch all quotations
- `quotations.getByNumber`: Fetch specific quotation
- `quotations.generatePDF`: Generate PDF for quotation

### Admin Endpoints (Authentication Required)
- `products.updatePrice`: Update product price (admin only)

## Testing

The application includes comprehensive unit tests covering:
- Product price fetching
- Calculator logic (area, pricing, discounts, VAT)
- Quotation creation and retrieval
- Admin authentication and authorization
- PDF generation

Run tests with:
```bash
pnpm test
```

All tests are written using Vitest and test the backend tRPC procedures directly.

## Calculation Logic

### Area Calculation
```
Area (m²) = (Width (cm) × Height (cm)) / 10,000
```

### Price Calculation
```
Net Price = Area × Price per m² × Quantity
Discount Amount = Net Price × Discount % / 100  (or fixed amount)
Gross Price = Net Price - Discount Amount
VAT Amount = Gross Price × VAT % / 100
Additional Costs Total = Sum of all additional costs
Final Total = Gross Price + VAT Amount + Additional Costs Total
```

## Security Features

- **Authentication**: Manus OAuth integration
- **Role-Based Access Control**: Admin-only routes protected
- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Prevention**: Drizzle ORM with parameterized queries
- **Type Safety**: End-to-end TypeScript type checking

## Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers (1024px and above)
- Tablets (768px - 1023px)
- Mobile phones (below 768px)

Bootstrap's responsive grid system ensures optimal layout on all devices.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Real-time Calculations**: Instant feedback as inputs change
- **Optimized Database Queries**: Indexed columns for fast lookups
- **Lazy Loading**: Components loaded on demand
- **Efficient PDF Generation**: Server-side rendering

## Deployment

The application is designed to run on the Manus platform with built-in:
- Database provisioning
- Environment variable management
- OAuth authentication
- SSL/TLS encryption
- Automatic scaling

For external deployment, ensure:
1. MySQL/TiDB database is configured
2. Environment variables are set
3. Node.js 22.x is installed
4. Build the application: `pnpm build`
5. Start the production server: `pnpm start`

## Maintenance

### Updating Product Prices
Use the Admin Panel to update prices. Historical quotations retain their original prices.

### Database Backups
Regular database backups are recommended. Use the Manus platform's built-in backup features.

### Monitoring
Monitor application logs and database performance through the Manus dashboard.

## Support

For issues, questions, or feature requests, please contact the development team.

## License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ using React, Node.js, and Bootstrap**
