import WeeklyMeals from '@/views/weekly-meals';
import { NextSeo } from 'next-seo';

const WeeklyMealsPage = () => {
  return (
    <>
      <NextSeo title="Weekly meals" />
      <WeeklyMeals />
    </>
  );
};

export default WeeklyMealsPage;
