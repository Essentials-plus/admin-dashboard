import CreateOrUpdateMealForm from '@/components/create-or-update-meal-form';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

const EditMeal = () => {
  const router = useRouter();
  const mealId = router.query.mealId as string;
  return (
    <>
      <NextSeo title="Edit Meal" />

      <div className="container">
        <CreateOrUpdateMealForm mealId={mealId} />
      </div>
    </>
  );
};

export default EditMeal;
