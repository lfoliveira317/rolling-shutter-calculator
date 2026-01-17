import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(user?: AuthenticatedUser): TrpcContext {
  const ctx: TrpcContext = {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Calculator and Quotation Tests", () => {
  beforeAll(async () => {
    // Ensure database is available
    const db = await getDb();
    expect(db).toBeTruthy();
  });

  describe("Product Prices", () => {
    it("should fetch all product prices", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const prices = await caller.products.getPrices();

      expect(prices).toBeDefined();
      expect(Array.isArray(prices)).toBe(true);
      expect(prices.length).toBeGreaterThan(0);
      
      // Check that plastic product exists
      const plastic = prices.find(p => p.productType === 'plastic');
      expect(plastic).toBeDefined();
      expect(plastic?.pricePerSqm).toBeDefined();
    });

    it("should fetch specific product price", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const price = await caller.products.getPrice({ productType: 'plastic' });

      expect(price).toBeDefined();
      expect(price?.productType).toBe('plastic');
      expect(Number(price?.pricePerSqm)).toBeGreaterThan(0);
    });
  });

  describe("Calculator", () => {
    it("should calculate quotation correctly", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.calculator.calculate({
        width: 200, // 200 cm
        height: 150, // 150 cm
        quantity: 2,
        productType: 'plastic',
        vatPercentage: 20,
        discountType: 'none',
        discountValue: 0,
        additionalCosts: []
      });

      // Area should be (200 * 150) / 10000 = 3 m²
      expect(parseFloat(result.area)).toBeCloseTo(3.0, 2);
      
      // Net price should be 3 m² * 45 €/m² * 2 = 270 €
      expect(parseFloat(result.netPrice)).toBeCloseTo(270.0, 2);
      
      // No discount
      expect(parseFloat(result.discountAmount)).toBe(0);
      
      // Gross price should equal net price (no discount)
      expect(parseFloat(result.grossPrice)).toBeCloseTo(270.0, 2);
      
      // VAT should be 20% of gross price = 54 €
      expect(parseFloat(result.vatAmount)).toBeCloseTo(54.0, 2);
      
      // Final total should be 270 + 54 = 324 €
      expect(parseFloat(result.finalTotal)).toBeCloseTo(324.0, 2);
    });

    it("should calculate with percentage discount", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.calculator.calculate({
        width: 100,
        height: 100,
        quantity: 1,
        productType: 'plastic',
        vatPercentage: 20,
        discountType: 'percentage',
        discountValue: 10, // 10% discount
        additionalCosts: []
      });

      // Area: 1 m²
      expect(parseFloat(result.area)).toBeCloseTo(1.0, 2);
      
      // Net price: 1 * 45 = 45 €
      expect(parseFloat(result.netPrice)).toBeCloseTo(45.0, 2);
      
      // Discount: 10% of 45 = 4.5 €
      expect(parseFloat(result.discountAmount)).toBeCloseTo(4.5, 2);
      
      // Gross price: 45 - 4.5 = 40.5 €
      expect(parseFloat(result.grossPrice)).toBeCloseTo(40.5, 2);
      
      // VAT: 20% of 40.5 = 8.1 €
      expect(parseFloat(result.vatAmount)).toBeCloseTo(8.1, 2);
      
      // Final: 40.5 + 8.1 = 48.6 €
      expect(parseFloat(result.finalTotal)).toBeCloseTo(48.6, 2);
    });

    it("should calculate with fixed discount", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.calculator.calculate({
        width: 100,
        height: 100,
        quantity: 1,
        productType: 'plastic',
        vatPercentage: 20,
        discountType: 'fixed',
        discountValue: 5, // 5 € discount
        additionalCosts: []
      });

      // Net price: 45 €
      expect(parseFloat(result.netPrice)).toBeCloseTo(45.0, 2);
      
      // Discount: 5 €
      expect(parseFloat(result.discountAmount)).toBeCloseTo(5.0, 2);
      
      // Gross price: 45 - 5 = 40 €
      expect(parseFloat(result.grossPrice)).toBeCloseTo(40.0, 2);
      
      // VAT: 20% of 40 = 8 €
      expect(parseFloat(result.vatAmount)).toBeCloseTo(8.0, 2);
      
      // Final: 40 + 8 = 48 €
      expect(parseFloat(result.finalTotal)).toBeCloseTo(48.0, 2);
    });

    it("should calculate with additional costs", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.calculator.calculate({
        width: 100,
        height: 100,
        quantity: 1,
        productType: 'plastic',
        vatPercentage: 20,
        discountType: 'none',
        discountValue: 0,
        additionalCosts: [
          { name: 'Delivery', amount: 20 },
          { name: 'Installation', amount: 30 }
        ]
      });

      // Additional costs total: 20 + 30 = 50 €
      expect(parseFloat(result.additionalCostsTotal)).toBeCloseTo(50.0, 2);
      
      // Net: 45, Gross: 45, VAT: 9, Additional: 50
      // Final: 45 + 9 + 50 = 104 €
      expect(parseFloat(result.finalTotal)).toBeCloseTo(104.0, 2);
    });
  });

  describe("Quotations", () => {
    it("should create a quotation", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.quotations.create({
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        customerPhone: "+1234567890",
        customerAddress: "123 Test St",
        productType: "plastic",
        width: 100,
        height: 100,
        quantity: 1,
        area: 1.0,
        pricePerSqm: 45.0,
        netPrice: 45.0,
        vatPercentage: 20,
        vatAmount: 9.0,
        grossPrice: 45.0,
        discountType: "none",
        discountValue: 0,
        discountAmount: 0,
        additionalCosts: [],
        additionalCostsTotal: 0,
        finalTotal: 54.0,
        notes: "Test quotation"
      });

      expect(result.success).toBe(true);
      expect(result.quotationNumber).toBeDefined();
      expect(result.quotationNumber).toMatch(/^QT-\d+$/);
    });

    it("should fetch quotation by number", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // First create a quotation
      const created = await caller.quotations.create({
        customerName: "Test Customer 2",
        productType: "aluminium",
        width: 150,
        height: 120,
        quantity: 1,
        area: 1.8,
        pricePerSqm: 85.0,
        netPrice: 153.0,
        vatPercentage: 20,
        vatAmount: 30.6,
        grossPrice: 153.0,
        discountType: "none",
        discountValue: 0,
        discountAmount: 0,
        additionalCosts: [],
        additionalCostsTotal: 0,
        finalTotal: 183.6
      });

      // Then fetch it
      const quotation = await caller.quotations.getByNumber({
        quotationNumber: created.quotationNumber
      });

      expect(quotation).toBeDefined();
      expect(quotation?.quotationNumber).toBe(created.quotationNumber);
      expect(quotation?.customerName).toBe("Test Customer 2");
      expect(quotation?.productType).toBe("aluminium");
    });

    it("should fetch all quotations", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const quotations = await caller.quotations.getAll();

      expect(Array.isArray(quotations)).toBe(true);
      expect(quotations.length).toBeGreaterThan(0);
    });
  });

  describe("Admin Functions", () => {
    it("should reject non-admin user from updating prices", async () => {
      const regularUser: AuthenticatedUser = {
        id: 999,
        openId: "regular-user",
        email: "user@example.com",
        name: "Regular User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx = createTestContext(regularUser);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.products.updatePrice({
          productType: "plastic",
          pricePerSqm: "50.00"
        })
      ).rejects.toThrow();
    });

    it("should allow admin to update prices", async () => {
      const adminUser: AuthenticatedUser = {
        id: 1,
        openId: "admin-user",
        email: "admin@example.com",
        name: "Admin User",
        loginMethod: "manus",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx = createTestContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.products.updatePrice({
        productType: "plastic",
        pricePerSqm: "45.00"
      });

      expect(result.success).toBe(true);
    });
  });
});
