import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const metadata = {
  title: 'Dashboard: Products'
};

const mockProducts = [
  { id: '1', name: 'Smartphone X', category: 'Electronics', price: '$899.00', stock: 120 },
  { id: '2', name: 'Wireless Headphones', category: 'Audio', price: '$199.00', stock: 45 },
  { id: '3', name: 'Gaming Laptop', category: 'Computers', price: '$1299.00', stock: 12 },
  { id: '4', name: 'Smart Watch', category: 'Wearables', price: '$249.00', stock: 85 },
];

export default function ProductsPage() {
  return (
    <PageContainer scrollable={true} pageTitle="Products" pageDescription="Manage your store products.">
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>A detailed list of all products in your inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">{product.price}</TableCell>
                    <TableCell className="text-right">{product.stock}</TableCell>
                  </TableRow>
                ))}
                {mockProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
