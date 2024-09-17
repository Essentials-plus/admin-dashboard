import ProductsAttributeTerms from '@/views/products-attribute-terms';
import { NextSeo } from 'next-seo';

const AttributeTermsPage = () => {
  return (
    <>
      <NextSeo title="Terms" />
      <ProductsAttributeTerms />
    </>
  );
};

export default AttributeTermsPage;
