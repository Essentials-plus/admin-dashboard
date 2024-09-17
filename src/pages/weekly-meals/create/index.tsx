import CreateOrUpdateWeeklyMealsForm from '@/components/create-or-update-weekly-meals-form';
import { NextSeo } from 'next-seo';

const CreateMeal = () => {
  return (
    <>
      <NextSeo title="Create Weekly Meal" />

      <div className="container">
        <CreateOrUpdateWeeklyMealsForm />
      </div>
    </>
  );
};

export default CreateMeal;
