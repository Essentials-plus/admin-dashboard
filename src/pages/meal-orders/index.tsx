import MealOrders from '@/views/meal-orders';
import { NextSeo } from 'next-seo';

const MealOrdersPage = () => {
  return (
    <>
      <NextSeo title="Meal orders" />
      <MealOrders />
    </>
  );
};

export default MealOrdersPage;
