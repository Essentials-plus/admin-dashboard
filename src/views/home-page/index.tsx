import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreateOrUpdateHomePageHeroSectionForm from '@/views/home-page/components/create-or-update-home-page-hero-section-form';
import SpotlightsProductBannersSection from '@/views/home-page/components/spotlights-product-banners-section';

const HomePage = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateOrUpdateHomePageHeroSectionForm />
        </CardContent>
      </Card>
      <SpotlightsProductBannersSection />
    </>
  );
};

export default HomePage;
