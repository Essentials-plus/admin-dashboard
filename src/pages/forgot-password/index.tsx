import { NextPageWithLayout } from '@/types/utils';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FormikInput } from '@/components/ui/input';
import { Formik } from 'formik';
import { NextSeo } from 'next-seo';

import { getAdminForgotPasswordMutationOptions } from '@/api-clients/public-api-client/mutations';
import { getApiErrorMessage } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: NextPageWithLayout = () => {
  const forgotPasswordMutation = useMutation({
    ...getAdminForgotPasswordMutationOptions(),
    onSuccess() {
      toast.success('A reset password link was sent to your email.');
    },
    onError(error) {
      toast.error(
        getApiErrorMessage(
          error,
          'Failed to send password reset link to your email. Try again'
        )
      );
    },
  });
  return (
    <>
      <NextSeo title="Forgot Password" />
      <div className="flex h-screen items-center justify-center px-5">
        <Card className="mx-auto w-full sm:w-[384px]">
          <CardHeader>
            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your email below to get a magic link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{ email: '' }}
              onSubmit={async (values, actions) => {
                try {
                  await forgotPasswordMutation.mutateAsync(values);
                  actions.resetForm();
                } catch {
                  actions.setSubmitting(false);
                }
              }}
              validationSchema={toFormikValidationSchema(forgotPasswordSchema)}
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
                  <Button
                    loading={isSubmitting}
                    type="submit"
                    className="w-full"
                  >
                    Send reset link
                  </Button>
                </form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

ForgotPasswordPage.getLayout = (page) => page;

export default ForgotPasswordPage;
