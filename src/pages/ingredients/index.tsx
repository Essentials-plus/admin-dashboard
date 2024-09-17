import Ingredients from '@/views/ingredients';
import { NextSeo } from 'next-seo';

const IngredientsPage = () => {
  return (
    <>
      <NextSeo title="Ingredients" />
      <Ingredients />
    </>
  );
};

export default IngredientsPage;
