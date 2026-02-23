import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreateOrUpdateLoginPageHeroSectionForm from '@/views/login-page/components/create-or-update-login-page-hero-section-form';

const LoginPage = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateOrUpdateLoginPageHeroSectionForm />
        </CardContent>
      </Card>
    </>
  );
};

export default LoginPage;
