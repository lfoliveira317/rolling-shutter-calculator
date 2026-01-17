import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  getAllProductPrices, 
  getProductPriceByType, 
  updateProductPrice,
  createQuotation,
  getAllQuotations,
  getQuotationById,
  getQuotationByNumber
} from "./db";
import { generateQuotationPDF } from "./pdfGenerator";
import { TRPCError } from "@trpc/server";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Product prices endpoints
  products: router({
    // Get all product prices (public)
    getPrices: publicProcedure.query(async () => {
      return await getAllProductPrices();
    }),
    
    // Get specific product price (public)
    getPrice: publicProcedure
      .input(z.object({ productType: z.string() }))
      .query(async ({ input }) => {
        return await getProductPriceByType(input.productType);
      }),
    
    // Update product price (admin only)
    updatePrice: adminProcedure
      .input(z.object({
        productType: z.string(),
        pricePerSqm: z.string()
      }))
      .mutation(async ({ input }) => {
        await updateProductPrice(input.productType, input.pricePerSqm);
        return { success: true };
      }),
  }),

  // Calculator endpoints
  calculator: router({
    // Calculate quotation
    calculate: publicProcedure
      .input(z.object({
        width: z.number().positive(),
        height: z.number().positive(),
        quantity: z.number().int().positive(),
        productType: z.string(),
        vatPercentage: z.number().min(0).max(100),
        discountType: z.enum(['none', 'percentage', 'fixed']),
        discountValue: z.number().min(0),
        additionalCosts: z.array(z.object({
          name: z.string(),
          amount: z.number()
        })).optional()
      }))
      .mutation(async ({ input }) => {
        // Get product price
        const productPrice = await getProductPriceByType(input.productType);
        if (!productPrice) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Product price not found' });
        }

        // Calculate area in m² (width and height are in cm)
        const area = (input.width * input.height) / 10000;
        
        // Calculate net price
        const pricePerSqm = Number(productPrice.pricePerSqm);
        const netPrice = area * pricePerSqm * input.quantity;
        
        // Calculate discount
        let discountAmount = 0;
        if (input.discountType === 'percentage') {
          discountAmount = (netPrice * input.discountValue) / 100;
        } else if (input.discountType === 'fixed') {
          discountAmount = input.discountValue;
        }
        
        // Calculate gross price (after discount, before VAT)
        const grossPrice = netPrice - discountAmount;
        
        // Calculate VAT
        const vatAmount = (grossPrice * input.vatPercentage) / 100;
        
        // Calculate additional costs total
        const additionalCostsTotal = (input.additionalCosts || []).reduce((sum, cost) => sum + cost.amount, 0);
        
        // Calculate final total
        const finalTotal = grossPrice + vatAmount + additionalCostsTotal;
        
        return {
          area: area.toFixed(2),
          pricePerSqm: pricePerSqm.toFixed(2),
          netPrice: netPrice.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          grossPrice: grossPrice.toFixed(2),
          vatAmount: vatAmount.toFixed(2),
          additionalCostsTotal: additionalCostsTotal.toFixed(2),
          finalTotal: finalTotal.toFixed(2)
        };
      }),
  }),

  // Quotations endpoints
  quotations: router({
    // Create quotation
    create: publicProcedure
      .input(z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().optional(),
        customerAddress: z.string().optional(),
        productType: z.string(),
        width: z.number().positive(),
        height: z.number().positive(),
        quantity: z.number().int().positive(),
        area: z.number().positive(),
        pricePerSqm: z.number().positive(),
        netPrice: z.number(),
        vatPercentage: z.number().min(0).max(100),
        vatAmount: z.number(),
        grossPrice: z.number(),
        discountType: z.enum(['none', 'percentage', 'fixed']),
        discountValue: z.number().min(0),
        discountAmount: z.number().min(0),
        additionalCosts: z.array(z.object({
          name: z.string(),
          amount: z.number()
        })).optional(),
        additionalCostsTotal: z.number().min(0),
        finalTotal: z.number(),
        notes: z.string().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        // Generate unique quotation number
        const timestamp = Date.now();
        const quotationNumber = `QT-${timestamp}`;
        
        const quotationData = {
          quotationNumber,
          customerName: input.customerName,
          customerEmail: input.customerEmail || null,
          customerPhone: input.customerPhone || null,
          customerAddress: input.customerAddress || null,
          productType: input.productType,
          width: input.width.toString(),
          height: input.height.toString(),
          quantity: input.quantity,
          area: input.area.toString(),
          pricePerSqm: input.pricePerSqm.toString(),
          netPrice: input.netPrice.toString(),
          vatPercentage: input.vatPercentage.toString(),
          vatAmount: input.vatAmount.toString(),
          grossPrice: input.grossPrice.toString(),
          discountType: input.discountType,
          discountValue: input.discountValue.toString(),
          discountAmount: input.discountAmount.toString(),
          additionalCosts: input.additionalCosts || [],
          additionalCostsTotal: input.additionalCostsTotal.toString(),
          finalTotal: input.finalTotal.toString(),
          notes: input.notes || null,
          createdBy: ctx.user?.id || null
        };
        
        await createQuotation(quotationData);
        
        return { 
          success: true, 
          quotationNumber 
        };
      }),
    
    // Get all quotations
    getAll: publicProcedure.query(async () => {
      return await getAllQuotations();
    }),
    
    // Get quotation by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getQuotationById(input.id);
      }),
    
    // Get quotation by number
    getByNumber: publicProcedure
      .input(z.object({ quotationNumber: z.string() }))
      .query(async ({ input }) => {
        return await getQuotationByNumber(input.quotationNumber);
      }),
    
    // Generate PDF
    generatePDF: publicProcedure
      .input(z.object({ quotationNumber: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const quotation = await getQuotationByNumber(input.quotationNumber);
        if (!quotation) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Quotation not found' });
        }
        
        const pdfBuffer = await generateQuotationPDF(quotation);
        
        // Convert buffer to base64 for transmission
        const pdfBase64 = pdfBuffer.toString('base64');
        
        return {
          success: true,
          pdfData: pdfBase64,
          filename: `quotation-${quotation.quotationNumber}.pdf`
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
