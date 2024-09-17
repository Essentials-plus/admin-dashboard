import ProductCategories from '@/views/product-categories';
import { NextSeo } from 'next-seo';

const ProductCategoriesPage = () => {
  return (
    <>
      <NextSeo title="Product Categories" />
      <ProductCategories />
    </>
  );
};

export default ProductCategoriesPage;
