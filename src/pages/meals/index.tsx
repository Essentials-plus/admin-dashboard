import Meals from '@/views/meals';
import { NextSeo } from 'next-seo';
const MealsPage = () => {
  return (
    <>
      <NextSeo title="Meals" />
      <Meals />
    </>
  );
};

export default MealsPage;
