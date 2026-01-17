import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Public calculator page without authentication requirements
 * Used for deployments without OAuth (e.g., Render, Vercel)
 */
export default function PublicCalculator() {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [productType, setProductType] = useState<string>("plastic");
  const [vat, setVat] = useState<number>(20);
  const [discountType, setDiscountType] = useState<string>("none");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [additionalCosts, setAdditionalCosts] = useState<Array<{ description: string; amount: number }>>([]);
  
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const { data: prices } = trpc.products.getPrices.useQuery();
  const saveQuotation = trpc.quotations.create.useMutation({
    onSuccess: () => {
      toast.success("Quotation saved successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to save quotation: ${error.message}`);
    },
  });

  const area = width && height ? (width * height) / 10000 : 0;
  const pricePerM2 = prices?.find((p: any) => p.productType === productType)?.pricePerSqm ? Number(prices.find((p: any) => p.productType === productType)?.pricePerSqm) : 0;
  const netPrice = area * pricePerM2 * quantity;
  
  let discount = 0;
  if (discountType === "percentage") {
    discount = (netPrice * discountValue) / 100;
  } else if (discountType === "fixed") {
    discount = discountValue;
  }
  
  const additionalTotal = additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const priceAfterDiscount = netPrice - discount + additionalTotal;
  const vatAmount = (priceAfterDiscount * vat) / 100;
  const grossPrice = priceAfterDiscount + vatAmount;

  const handleSave = () => {
    if (!customerName || !width || !height) {
      toast.error("Please fill in customer name, width, and height");
      return;
    }

    saveQuotation.mutate({
      customerName,
      customerEmail: customerEmail || undefined,
      customerPhone: customerPhone || undefined,
      customerAddress: customerAddress || undefined,
      notes: notes || undefined,
      productType,
      width,
      height,
      quantity,
      area,
      pricePerSqm: pricePerM2,
      netPrice,
      vatPercentage: vat,
      vatAmount,
      grossPrice: priceAfterDiscount,
      discountType: discountType as 'none' | 'percentage' | 'fixed',
      discountValue,
      discountAmount: discount,
      additionalCosts: additionalCosts.map(c => ({ name: c.description, amount: c.amount })),
      additionalCostsTotal: additionalTotal,
      finalTotal: grossPrice,
    });
  };

  const addCost = () => {
    setAdditionalCosts([...additionalCosts, { description: "", amount: 0 }]);
  };

  const updateCost = (index: number, field: "description" | "amount", value: string | number) => {
    const updated = [...additionalCosts];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalCosts(updated);
  };

  const removeCost = (index: number) => {
    setAdditionalCosts(additionalCosts.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Header */}
      <div className="text-white py-16 text-center">
        <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Rolling Shutter Calculator
        </h1>
        <p className="text-xl opacity-90">Professional Quotation System</p>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="row g-4">
          {/* Left Column - Form */}
          <div className="col-lg-8">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4">
                <h2 className="h4 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Product Configuration
                </h2>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Product Type</label>
                    <select className="form-select" value={productType} onChange={(e) => setProductType(e.target.value)}>
                      {prices?.map((p: any) => (
                        <option key={p.productType} value={p.productType}>
                          {p.productType.charAt(0).toUpperCase() + p.productType.slice(1)} - €{Number(p.pricePerSqm).toFixed(2)}/m²
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Width (cm)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter width in cm"
                      value={width || ""}
                      onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Height (cm)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter height in cm"
                      value={height || ""}
                      onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">VAT (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={vat}
                      onChange={(e) => setVat(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Discount Type</label>
                    <select className="form-select" value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                      <option value="none">No Discount</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (€)</option>
                    </select>
                  </div>

                  {discountType !== "none" && (
                    <div className="col-12">
                      <label className="form-label fw-semibold">Discount Value</label>
                      <input
                        type="number"
                        className="form-control"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}
                </div>

                <h3 className="h5 mt-4 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Additional Costs
                </h3>
                {additionalCosts.map((cost, index) => (
                  <div key={index} className="row g-2 mb-2">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Description"
                        value={cost.description}
                        onChange={(e) => updateCost(index, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Amount (€)"
                        value={cost.amount}
                        onChange={(e) => updateCost(index, "amount", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-md-2">
                      <button className="btn btn-outline-danger w-100" onClick={() => removeCost(index)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button className="btn btn-outline-primary" onClick={addCost}>
                  + Add Cost
                </button>

                <h3 className="h5 mt-4 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Customer Information
                </h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Customer Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="customer@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+1 234 567 8900"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Customer address"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Notes</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Additional notes or special requirements"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="col-lg-4">
            <div className="card shadow-lg border-0 rounded-4 position-sticky" style={{ top: "20px" }}>
              <div className="card-body p-4">
                <h2 className="h4 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Quotation Summary
                </h2>

                {area > 0 ? (
                  <div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Area:</span>
                      <strong>{area.toFixed(2)} m²</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Price per m²:</span>
                      <strong>€{pricePerM2.toFixed(2)}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Net Price:</span>
                      <strong>€{netPrice.toFixed(2)}</strong>
                    </div>
                    {discount > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Discount:</span>
                        <strong>-€{discount.toFixed(2)}</strong>
                      </div>
                    )}
                    {additionalTotal > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Additional Costs:</span>
                        <strong>€{additionalTotal.toFixed(2)}</strong>
                      </div>
                    )}
                    <div className="d-flex justify-content-between mb-2">
                      <span>Gross Price:</span>
                      <strong>€{priceAfterDiscount.toFixed(2)}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span>VAT ({vat}%):</span>
                      <strong>€{vatAmount.toFixed(2)}</strong>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="h5 mb-0">TOTAL:</span>
                      <span className="h4 mb-0 text-primary fw-bold">€{grossPrice.toFixed(2)}</span>
                    </div>
                    <button
                      className="btn btn-primary w-100 py-2"
                      onClick={handleSave}
                      disabled={saveQuotation.isPending}
                    >
                      {saveQuotation.isPending ? "Saving..." : "Save Quotation"}
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">
                    <p>Enter product dimensions to see the quotation summary</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
