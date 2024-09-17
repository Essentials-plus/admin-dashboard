import IngredientCategories from '@/views/ingredient-categories';
import { NextSeo } from 'next-seo';

const IngredientCategoriesPage = () => {
  return (
    <>
      <NextSeo title="Ingredient Categories" />
      <IngredientCategories />
    </>
  );
};

export default IngredientCategoriesPage;
