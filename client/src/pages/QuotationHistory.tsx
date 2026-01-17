import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function QuotationHistory() {
  const { data: quotations, isLoading } = trpc.quotations.getAll.useQuery();
  const generatePDFMutation = trpc.quotations.generatePDF.useMutation();
  
  const handleGeneratePDF = async (quotationNumber: string) => {
    try {
      const result = await generatePDFMutation.mutateAsync({ quotationNumber });
      
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
      
      toast.success('PDF downloaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate PDF');
    }
  };
  
  const productTypeDisplay = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="elegant-header">
        <Container>
          <h1 className="text-center mb-2 text-4xl font-bold">Quotation History</h1>
          <p className="text-center text-lg opacity-90">View and Download Past Quotations</p>
        </Container>
      </div>
      
      <Container className="py-5">
        <Row>
          <Col>
            <Card className="elegant-card border-0 p-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="text-2xl mb-0">All Quotations</h2>
                  <Button variant="outline-secondary" href="/">
                    ← Back to Calculator
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : quotations && quotations.length > 0 ? (
                  <Table responsive hover className="mt-4">
                    <thead className="bg-light">
                      <tr>
                        <th className="py-3">Quotation #</th>
                        <th className="py-3">Customer</th>
                        <th className="py-3">Product</th>
                        <th className="py-3">Area (m²)</th>
                        <th className="py-3">Total</th>
                        <th className="py-3">Date</th>
                        <th className="py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.map((quotation) => (
                        <tr key={quotation.id}>
                          <td className="align-middle">
                            <Badge bg="primary" className="px-3 py-2">
                              {quotation.quotationNumber}
                            </Badge>
                          </td>
                          <td className="align-middle">
                            <div>
                              <strong>{quotation.customerName}</strong>
                              {quotation.customerEmail && (
                                <div className="text-muted small">{quotation.customerEmail}</div>
                              )}
                            </div>
                          </td>
                          <td className="align-middle">
                            {productTypeDisplay(quotation.productType)}
                            <div className="text-muted small">
                              {Number(quotation.width).toFixed(0)} × {Number(quotation.height).toFixed(0)} cm
                            </div>
                          </td>
                          <td className="align-middle">
                            {Number(quotation.area).toFixed(2)} m²
                          </td>
                          <td className="align-middle">
                            <strong className="text-success">
                              €{Number(quotation.finalTotal).toFixed(2)}
                            </strong>
                          </td>
                          <td className="align-middle">
                            <small className="text-muted">
                              {formatDate(quotation.createdAt)}
                            </small>
                          </td>
                          <td className="align-middle">
                            <Button
                              size="sm"
                              className="elegant-btn elegant-btn-primary"
                              onClick={() => handleGeneratePDF(quotation.quotationNumber)}
                              disabled={generatePDFMutation.isPending}
                            >
                              {generatePDFMutation.isPending ? '...' : 'PDF'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted">No quotations found. Create your first quotation!</p>
                    <Button variant="primary" href="/" className="mt-3">
                      Go to Calculator
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
