import ProductsAttributes from '@/views/products-attributes';
import { NextSeo } from 'next-seo';

const ProductsAttributesPage = () => {
  return (
    <>
      <NextSeo title="Product Attributes" />
      <ProductsAttributes />
    </>
  );
};

export default ProductsAttributesPage;
