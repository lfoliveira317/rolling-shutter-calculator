import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert } from 'react-bootstrap';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { toast } from 'sonner';
import { Redirect } from 'wouter';

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});
  
  const { data: productPrices, refetch } = trpc.products.getPrices.useQuery();
  const updatePriceMutation = trpc.products.updatePrice.useMutation();
  
  if (loading) {
    return (
      <div className="min-h-screen d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }
  
  if (user?.role !== 'admin') {
    return <Redirect to="/" />;
  }
  
  const handlePriceChange = (productType: string, value: string) => {
    setEditingPrices({
      ...editingPrices,
      [productType]: value
    });
  };
  
  const handleUpdatePrice = async (productType: string) => {
    const newPrice = editingPrices[productType];
    if (!newPrice || isNaN(parseFloat(newPrice))) {
      toast.error('Please enter a valid price');
      return;
    }
    
    try {
      await updatePriceMutation.mutateAsync({
        productType,
        pricePerSqm: newPrice
      });
      
      toast.success('Price updated successfully!');
      setEditingPrices({
        ...editingPrices,
        [productType]: ''
      });
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update price');
    }
  };
  
  const productTypeDisplay = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="elegant-header">
        <Container>
          <h1 className="text-center mb-2 text-4xl font-bold">Admin Panel</h1>
          <p className="text-center text-lg opacity-90">Manage Product Prices</p>
        </Container>
      </div>
      
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="elegant-card border-0 p-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="text-2xl mb-0">Product Pricing</h2>
                  <Alert variant="info" className="mb-0 py-2 px-3">
                    <small>Logged in as: <strong>{user?.name || user?.email}</strong></small>
                  </Alert>
                </div>
                
                <Table responsive hover className="mt-4">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-3">Product Type</th>
                      <th className="py-3">Current Price (€/m²)</th>
                      <th className="py-3">New Price</th>
                      <th className="py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productPrices?.map((price) => (
                      <tr key={price.productType}>
                        <td className="align-middle">
                          <strong>{productTypeDisplay(price.productType)}</strong>
                          {price.description && (
                            <div className="text-muted small">{price.description}</div>
                          )}
                        </td>
                        <td className="align-middle">
                          <span className="badge bg-primary text-white px-3 py-2">
                            €{Number(price.pricePerSqm).toFixed(2)}
                          </span>
                        </td>
                        <td className="align-middle">
                          <Form.Control
                            type="number"
                            className="elegant-input"
                            placeholder="Enter new price"
                            value={editingPrices[price.productType] || ''}
                            onChange={(e) => handlePriceChange(price.productType, e.target.value)}
                            min="0"
                            step="0.01"
                            style={{ maxWidth: '200px' }}
                          />
                        </td>
                        <td className="align-middle">
                          <Button
                            className="elegant-btn elegant-btn-primary"
                            onClick={() => handleUpdatePrice(price.productType)}
                            disabled={
                              !editingPrices[price.productType] || 
                              updatePriceMutation.isPending
                            }
                          >
                            {updatePriceMutation.isPending ? 'Updating...' : 'Update'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                
                <Alert variant="warning" className="mt-4">
                  <strong>Note:</strong> Price changes will be reflected immediately in the calculator. 
                  Existing quotations will retain their original prices.
                </Alert>
                
                <div className="mt-4">
                  <Button 
                    variant="outline-secondary"
                    href="/"
                  >
                    ← Back to Calculator
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
