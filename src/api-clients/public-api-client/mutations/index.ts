import publicApiClient from '@/api-clients/public-api-client';
import { ForgotPasswordSchema } from '@/pages/forgot-password';
import { LoginSchema } from '@/pages/login';
import { ResetPasswordSchema } from '@/pages/reset-password';
import { ApiResponseSuccessBase } from '@/types/api-responses';

export const getAdminLoginMutationOptions = () => {
  return {
    mutationKey: ['admin-login'],
    mutationFn: (data: LoginSchema) =>
      publicApiClient.post<ApiResponseSuccessBase<string>>(
        '/auth/admin/login',
        data
      ),
  };
};

export const getAdminForgotPasswordMutationOptions = () => {
  return {
    mutationKey: ['admin-forgot-password'],
    mutationFn: (data: ForgotPasswordSchema) =>
      publicApiClient.post<
        ApiResponseSuccessBase<{ message: string; token: string }>
      >('/auth/admin/password/forgot', data),
  };
};

export const getAdminResetPasswordMutationOptions = () => {
  return {
    mutationKey: ['admin-reset-password'],
    mutationFn: (data: ResetPasswordSchema & { token: string }) =>
      publicApiClient.post<ApiResponseSuccessBase<{ message: string }>>(
        '/auth/admin/password/reset',
        data
      ),
  };
};
