import CreateOrUpdateWeeklyMealsForm from '@/components/create-or-update-weekly-meals-form';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

const EditMeal = () => {
  const router = useRouter();
  const weekId = router.query.weekId as string;
  return (
    <>
      <NextSeo title="Edit Weekly Meals" />

      <div className="container">
        <CreateOrUpdateWeeklyMealsForm weekId={weekId} />
      </div>
    </>
  );
};

export default EditMeal;
