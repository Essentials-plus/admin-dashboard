import Products from '@/views/products';
import { NextSeo } from 'next-seo';

const ProductsPage = () => {
  return (
    <>
      <NextSeo title="Products" />
      <Products />
    </>
  );
};

export default ProductsPage;
