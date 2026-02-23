import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreateOrUpdateHowItWorksPageHeroSectionForm from '@/views/how-it-works-page/components/create-or-update-how-it-works-page-hero-section-form';

const HowItWorksPage = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateOrUpdateHowItWorksPageHeroSectionForm />
        </CardContent>
      </Card>
    </>
  );
};

export default HowItWorksPage;
