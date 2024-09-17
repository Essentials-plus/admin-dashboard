import CreateOrUpdateMealForm from '@/components/create-or-update-meal-form';
import { NextSeo } from 'next-seo';

const CreateMeal = () => {
  return (
    <>
      <NextSeo title="Create Meal" />

      <div className="container">
        <CreateOrUpdateMealForm />
      </div>
    </>
  );
};

export default CreateMeal;
