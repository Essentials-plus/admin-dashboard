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

import { getAdminResetPasswordMutationOptions } from '@/api-clients/public-api-client/mutations';
import routes from '@/config/routes';
import { getApiErrorMessage } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    {
      message: 'Passwords did not match',
      path: ['confirmPassword'],
    }
  );
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: NextPageWithLayout = () => {
  const router = useRouter();

  const resetPasswordMutation = useMutation({
    ...getAdminResetPasswordMutationOptions(),
    onSuccess(data) {
      toast.success(data.data.data.message);
      router.push(routes.login);
    },
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to reset password. Try again')
      );
    },
  });
  return (
    <>
      <NextSeo title="Reset Password" />
      <div className="flex h-screen items-center justify-center px-5">
        <Card className="mx-auto w-full sm:w-[384px]">
          <CardHeader>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your new and confirm password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{ password: '', confirmPassword: '' }}
              onSubmit={async (values, actions) => {
                const token = router.query.token as string | undefined;

                if (!token) {
                  router.replace(routes.forgotPassword).then(() => {
                    toast.error('Reset token is not available');
                  });
                  return;
                }

                try {
                  await resetPasswordMutation.mutateAsync({
                    ...values,
                    token,
                  });
                } catch {
                  actions.setSubmitting(false);
                }
              }}
              validationSchema={toFormikValidationSchema(resetPasswordSchema)}
            >
              {({ handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="grid gap-2">
                    <FormikInput
                      name="password"
                      label="Password"
                      placeholder="New password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <FormikInput
                      name="confirmPassword"
                      label="Confirm password"
                      placeholder="Confirm password"
                    />
                  </div>
                  <Button
                    loading={isSubmitting}
                    type="submit"
                    className="w-full"
                  >
                    Reset password
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

ResetPasswordPage.getLayout = (page) => page;

export default ResetPasswordPage;
