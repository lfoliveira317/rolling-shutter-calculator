# Rolling Shutter Calculator - Project TODO

## Phase 1: Database Schema & Planning
- [x] Design database schema for product pricing configuration
- [x] Design database schema for quotations storage
- [x] Design database schema for customer information

## Phase 2: Backend API Development
- [x] Create tRPC procedure for fetching product prices
- [x] Create tRPC procedure for calculating quotation (area, net/gross prices, discounts)
- [x] Create tRPC procedure for saving quotations to database
- [x] Create tRPC procedure for fetching quotation history
- [x] Create tRPC procedure for generating PDF quotations
- [x] Create admin-only tRPC procedure for updating product prices
- [x] Add authentication middleware for admin routes

## Phase 3: Calculator Interface
- [x] Install Bootstrap and React Bootstrap dependencies
- [x] Create calculator form with width/height inputs (cm)
- [x] Create quantity input field
- [x] Create product type selector (plastic, aluminium, mosquito net)
- [x] Implement automatic area calculation (m²)
- [x] Implement real-time net price calculation
- [x] Add VAT percentage configuration
- [x] Implement gross price calculation with VAT
- [x] Add discount input (percentage and fixed amount)
- [x] Add additional cost items (delivery, installation)
- [x] Create customer information form
- [x] Display quotation summary with all calculations
- [x] Add save quotation button with success feedback
- [x] Add generate PDF button
- [x] Create quotation history view
- [x] Make interface fully responsive (desktop + mobile)

## Phase 4: Admin Panel
- [x] Create admin login page
- [x] Create admin dashboard layout
- [x] Create price management interface
- [x] Add form to update m² prices for each product type
- [x] Add role-based access control
- [x] Display current prices in admin panel

## Phase 5: Testing & Deployment
- [x] Test calculator calculations accuracy
- [x] Test quotation save functionality
- [x] Test PDF generation
- [x] Test admin authentication
- [x] Test price update functionality
- [x] Test responsive design on mobile devices
- [x] Write vitest tests for critical backend procedures
- [x] Create project checkpoint
- [x] Document usage instructions
