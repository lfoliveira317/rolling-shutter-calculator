import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Nav } from 'react-bootstrap';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';

interface AdditionalCost {
  name: string;
  amount: number;
}

export default function Calculator() {
  // Form state
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [productType, setProductType] = useState<string>('plastic');
  const [vatPercentage, setVatPercentage] = useState<string>('20');
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState<string>('0');
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([]);
  
  // Customer information
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // Calculation results
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [lastQuotationNumber, setLastQuotationNumber] = useState<string>('');
  
  // Fetch product prices
  const { data: productPrices } = trpc.products.getPrices.useQuery();
  
  // Mutations
  const calculateMutation = trpc.calculator.calculate.useMutation();
  const createQuotationMutation = trpc.quotations.create.useMutation();
  const generatePDFMutation = trpc.quotations.generatePDF.useMutation();
  
  // Auto-calculate when inputs change
  useEffect(() => {
    if (width && height && quantity && productType) {
      handleCalculate();
    }
  }, [width, height, quantity, productType, vatPercentage, discountType, discountValue, additionalCosts]);
  
  const handleCalculate = async () => {
    const widthNum = parseFloat(width);
    const heightNum = parseFloat(height);
    const quantityNum = parseInt(quantity);
    const vatNum = parseFloat(vatPercentage);
    const discountNum = parseFloat(discountValue);
    
    if (isNaN(widthNum) || isNaN(heightNum) || isNaN(quantityNum) || widthNum <= 0 || heightNum <= 0 || quantityNum <= 0) {
      return;
    }
    
    try {
      const result = await calculateMutation.mutateAsync({
        width: widthNum,
        height: heightNum,
        quantity: quantityNum,
        productType,
        vatPercentage: vatNum,
        discountType,
        discountValue: discountNum,
        additionalCosts
      });
      
      setCalculationResult(result);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  };
  
  const handleAddCost = () => {
    setAdditionalCosts([...additionalCosts, { name: '', amount: 0 }]);
  };
  
  const handleRemoveCost = (index: number) => {
    setAdditionalCosts(additionalCosts.filter((_, i) => i !== index));
  };
  
  const handleCostChange = (index: number, field: 'name' | 'amount', value: string | number) => {
    const updated = [...additionalCosts];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalCosts(updated);
  };
  
  const handleSaveQuotation = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    
    if (!calculationResult) {
      toast.error('Please complete the calculation first');
      return;
    }
    
    try {
      const result = await createQuotationMutation.mutateAsync({
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
        customerAddress: customerAddress || undefined,
        productType,
        width: parseFloat(width),
        height: parseFloat(height),
        quantity: parseInt(quantity),
        area: parseFloat(calculationResult.area),
        pricePerSqm: parseFloat(calculationResult.pricePerSqm),
        netPrice: parseFloat(calculationResult.netPrice),
        vatPercentage: parseFloat(vatPercentage),
        vatAmount: parseFloat(calculationResult.vatAmount),
        grossPrice: parseFloat(calculationResult.grossPrice),
        discountType,
        discountValue: parseFloat(discountValue),
        discountAmount: parseFloat(calculationResult.discountAmount),
        additionalCosts,
        additionalCostsTotal: parseFloat(calculationResult.additionalCostsTotal),
        finalTotal: parseFloat(calculationResult.finalTotal),
        notes: notes || undefined
      });
      
      setLastQuotationNumber(result.quotationNumber);
      toast.success(`Quotation saved successfully! #${result.quotationNumber}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save quotation');
    }
  };
  
  const handleGeneratePDF = async () => {
    if (!lastQuotationNumber) {
      toast.error('Please save the quotation first');
      return;
    }
    
    try {
      const result = await generatePDFMutation.mutateAsync({
        quotationNumber: lastQuotationNumber
      });
      
      // Convert base64 to blob and download
      const byteCharacters = atob(result.pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate PDF');
    }
  };
  
  const productTypeDisplay = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="elegant-header">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="mb-0 text-4xl font-bold">Rolling Shutter Calculator</h1>
            <Nav className="gap-2">
              <Nav.Link href="/history" className="text-white hover:text-white/80">
                📋 History
              </Nav.Link>
              {user?.role === 'admin' && (
                <Nav.Link href="/admin" className="text-white hover:text-white/80">
                  ⚙️ Admin
                </Nav.Link>
              )}
            </Nav>
          </div>
          <p className="text-center text-lg opacity-90">Professional Quotation System</p>
        </Container>
      </div>
      
      <Container className="py-5">
        <Row className="g-4">
          {/* Calculator Form */}
          <Col lg={8}>
            <Card className="elegant-card border-0 p-4">
              <Card.Body>
                <h2 className="mb-4 text-2xl">Product Configuration</h2>
                
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label">Product Type</Form.Label>
                      <Form.Select 
                        className="elegant-input"
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                      >
                        {productPrices?.map((price) => (
                          <option key={price.productType} value={price.productType}>
                            {productTypeDisplay(price.productType)} - €{Number(price.pricePerSqm).toFixed(2)}/m²
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label">Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        className="elegant-input"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label">Width (cm)</Form.Label>
                      <Form.Control
                        type="number"
                        className="elegant-input"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        placeholder="Enter width in cm"
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label">Height (cm)</Form.Label>
                      <Form.Control
                        type="number"
                        className="elegant-input"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="Enter height in cm"
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label">VAT (%)</Form.Label>
                      <Form.Control
                        type="number"
                        className="elegant-input"
                        value={vatPercentage}
                        onChange={(e) => setVatPercentage(e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label">Discount Type</Form.Label>
                      <Form.Select
                        className="elegant-input"
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as any)}
                      >
                        <option value="none">No Discount</option>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (€)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  {discountType !== 'none' && (
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="form-label">
                          Discount Value {discountType === 'percentage' ? '(%)' : '(€)'}
                        </Form.Label>
                        <Form.Control
                          type="number"
                          className="elegant-input"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </Form.Group>
                    </Col>
                  )}
                </Row>
                
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="text-xl mb-0">Additional Costs</h3>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={handleAddCost}
                    >
                      + Add Cost
                    </Button>
                  </div>
                  
                  {additionalCosts.map((cost, index) => (
                    <Row key={index} className="g-2 mb-2">
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          className="elegant-input"
                          placeholder="Cost name (e.g., Delivery)"
                          value={cost.name}
                          onChange={(e) => handleCostChange(index, 'name', e.target.value)}
                        />
                      </Col>
                      <Col md={5}>
                        <Form.Control
                          type="number"
                          className="elegant-input"
                          placeholder="Amount (€)"
                          value={cost.amount}
                          onChange={(e) => handleCostChange(index, 'amount', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </Col>
                      <Col md={1}>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleRemoveCost(index)}
                          className="w-100"
                        >
                          ×
                        </Button>
                      </Col>
                    </Row>
                  ))}
                </div>
                
                <hr className="my-4" />
                
                <h2 className="mb-4 text-2xl">Customer Information</h2>
                
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label">Customer Name *</Form.Label>
                      <Form.Control
                        type="text"
                        className="elegant-input"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label">Email</Form.Label>
                      <Form.Control
                        type="email"
                        className="elegant-input"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="customer@example.com"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label">Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        className="elegant-input"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+1 234 567 8900"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label">Address</Form.Label>
                      <Form.Control
                        type="text"
                        className="elegant-input"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Customer address"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="form-label">Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        className="elegant-input"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes or special requirements"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Quotation Summary */}
          <Col lg={4}>
            <Card className="elegant-card border-0 p-4 sticky-top" style={{ top: '20px' }}>
              <Card.Body>
                <h2 className="mb-4 text-2xl">Quotation Summary</h2>
                
                {calculationResult ? (
                  <div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Area:</span>
                        <strong>{calculationResult.area} m²</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Price per m²:</span>
                        <strong>€{calculationResult.pricePerSqm}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Net Price:</span>
                        <strong>€{calculationResult.netPrice}</strong>
                      </div>
                      
                      {parseFloat(calculationResult.discountAmount) > 0 && (
                        <div className="d-flex justify-content-between mb-2 text-success">
                          <span>Discount:</span>
                          <strong>-€{calculationResult.discountAmount}</strong>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Gross Price:</span>
                        <strong>€{calculationResult.grossPrice}</strong>
                      </div>
                      
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">VAT ({vatPercentage}%):</span>
                        <strong>€{calculationResult.vatAmount}</strong>
                      </div>
                      
                      {parseFloat(calculationResult.additionalCostsTotal) > 0 && (
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Additional Costs:</span>
                          <strong>€{calculationResult.additionalCostsTotal}</strong>
                        </div>
                      )}
                      
                      <hr />
                      
                      <div className="price-display mt-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <span>TOTAL:</span>
                          <span>€{calculationResult.finalTotal}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="d-grid gap-2 mt-4">
                      <Button 
                        className="elegant-btn elegant-btn-primary"
                        onClick={handleSaveQuotation}
                        disabled={createQuotationMutation.isPending}
                      >
                        {createQuotationMutation.isPending ? 'Saving...' : 'Save Quotation'}
                      </Button>
                      
                      {lastQuotationNumber && (
                        <Button 
                          className="elegant-btn elegant-btn-secondary"
                          onClick={handleGeneratePDF}
                          disabled={generatePDFMutation.isPending}
                        >
                          {generatePDFMutation.isPending ? 'Generating...' : 'Download PDF'}
                        </Button>
                      )}
                    </div>
                    
                    {lastQuotationNumber && (
                      <Alert variant="success" className="mt-3 mb-0">
                        <small>Last saved: #{lastQuotationNumber}</small>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <Alert variant="info">
                    Enter product dimensions to see the quotation summary
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
