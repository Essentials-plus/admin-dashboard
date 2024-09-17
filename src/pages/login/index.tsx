import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FormikInput } from '@/components/ui/input';
import { NextPageWithLayout } from '@/types/utils';
import { Formik } from 'formik';
import { NextSeo } from 'next-seo';

import { getAdminLoginMutationOptions } from '@/api-clients/public-api-client/mutations';
import routes from '@/config/routes';
import useSession from '@/hooks/useSession';
import { getApiErrorMessage } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginSchema = z.infer<typeof loginSchema>;

const LoginPage: NextPageWithLayout = () => {
  const { login } = useSession();

  const loginMutation = useMutation({
    ...getAdminLoginMutationOptions(),
    onSuccess(data) {
      login(data.data.data);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to login. Try again'));
    },
  });
  return (
    <>
      <NextSeo title="Login" />
      <div className="flex h-screen items-center justify-center px-5">
        <Card className="mx-auto w-full sm:w-[384px]">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{ email: '', password: '' }}
              onSubmit={async (values, actions) => {
                try {
                  await loginMutation.mutateAsync(values);
                } catch {
                  actions.setSubmitting(false);
                }
              }}
              validationSchema={toFormikValidationSchema(loginSchema)}
            >
              {({ handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="grid gap-2">
                    <FormikInput
                      name="email"
                      label="Email"
                      type="email"
                      placeholder="m@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <FormikInput
                      name="password"
                      label="Password"
                      type="password"
                      placeholder="******"
                    />
                  </div>
                  <Button
                    loading={isSubmitting}
                    type="submit"
                    className="w-full"
                  >
                    Login
                  </Button>
                  <div className="flex items-center justify-center">
                    <Link
                      href={routes.forgotPassword}
                      className="inline-block text-sm underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

LoginPage.getLayout = (page) => page;

export default LoginPage;
