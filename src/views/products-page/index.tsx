import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreateOrUpdateBannersForm from '@/views/products-page/components/create-or-update-banners-form';
import CreateOrUpdateProductsPageHeroSectionForm from '@/views/products-page/components/create-or-update-products-page-hero-section-form';

const ProductsPage = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateOrUpdateProductsPageHeroSectionForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Banners</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateOrUpdateBannersForm />
        </CardContent>
      </Card>
    </>
  );
};

export default ProductsPage;
