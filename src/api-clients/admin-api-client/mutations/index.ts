import adminApiClient from '@/api-clients/admin-api-client';
import { CreateCouponCodeSchema } from '@/components/create-or-update-coupon-code-form/schema';
import { CreateIngredientCategorySchema } from '@/components/create-or-update-ingredient-category-form/schema';
import { CreateIngredientSchema } from '@/components/create-or-update-ingredient-form/schema';
import { CreateMealSchema } from '@/components/create-or-update-meal-form/schema';
import { CreateProductAttributeSchema } from '@/components/create-or-update-product-attribute-form/schema';
import { CreateProductAttributeTermSchema } from '@/components/create-or-update-product-attribute-term-form/schema';
import { CreateProductCategorySchema } from '@/components/create-or-update-product-category-form/schema';
import {
  SimpleProductSchema,
  UpdateProductVariationSchema,
  VariableProductSchema,
} from '@/components/create-or-update-product-form/schema';
import {
  CreateWeeklyMealsSchema,
  UpdateWeeklyMealsSchema,
} from '@/components/create-or-update-weekly-meals-form/schema';
import { CreateZipCodeSchema } from '@/components/create-or-update-zip-code-form/schema';
import { UpdateUserSchema } from '@/components/edit-user-form/schema';
import { ApiResponseSuccessBase } from '@/types/api-responses';
import { CouponCode } from '@/types/api-responses/coupon-code';
import { FileUploadApiResponse } from '@/types/api-responses/file-upload';
import { Ingredient } from '@/types/api-responses/ingredient';
import { IngredientCategory } from '@/types/api-responses/ingredient-category';
import { Meal } from '@/types/api-responses/meal';
import { MealOrderSummary } from '@/types/api-responses/meal-orders';
import { OrderStatus, OrderSummary } from '@/types/api-responses/order';
import { Product } from '@/types/api-responses/product';
import {
  ProductAttribute,
  ProductAttributeTerm,
  ProductVariation,
} from '@/types/api-responses/product-attribute';
import { ProductCategory } from '@/types/api-responses/product-category';
import { User } from '@/types/api-responses/users';
import { WeeklyMeal } from '@/types/api-responses/weekly-meals';
import { ZipCode } from '@/types/api-responses/zip-code';
import { AxiosRequestConfig } from 'axios';

export const getCreateIngredientMutationOptions = () => {
  return {
    mutationKey: ['create-ingredient'],
    mutationFn: (data: CreateIngredientSchema) =>
      adminApiClient.post<
        ApiResponseSuccessBase<Ingredient, { message: string }>
      >('/meal/ingredient', data),
  };
};

export const getUpdateIngredientMutationOptions = () => {
  return {
    mutationKey: ['update-ingredient'],
    mutationFn: ({ id, data }: { id: string; data: CreateIngredientSchema }) =>
      adminApiClient.put<
        ApiResponseSuccessBase<Ingredient, { message: string }>
      >(`/meal/ingredient/${id}`, data),
  };
};

export const getDeleteIngredientMutationOptions = () => {
  return {
    mutationKey: ['delete-ingredient'],
    mutationFn: ({ id }: { id: string }) =>
      adminApiClient.delete<
        ApiResponseSuccessBase<Ingredient, { message: string }>
      >(`/meal/ingredient/${id}`),
  };
};

export const getUploadFileMutationOptions = ({
  axiosConfig,
}: { axiosConfig?: AxiosRequestConfig } = {}) => {
  return {
    mutationKey: ['upload-file'],
    mutationFn: ({ data }: { data: FormData }) =>
      adminApiClient.post<ApiResponseSuccessBase<FileUploadApiResponse>>(
        '/upload',
        data,
        {
          maxBodyLength: Infinity,
          ...axiosConfig,
        }
      ),
  };
};

export const getUploadFilesMutationOptions = () => {
  return {
    mutationKey: ['upload-files'],
    mutationFn: ({ data }: { data: FormData }) =>
      adminApiClient.post<ApiResponseSuccessBase<FileUploadApiResponse[]>>(
        '/upload/multiple',
        data,
        {
          maxBodyLength: Infinity,
        }
      ),
  };
};

export const getCreateMealMutationOptions = () => {
  return {
    mutationKey: ['create-meal'],
    mutationFn: (data: CreateMealSchema) =>
      adminApiClient.post<ApiResponseSuccessBase<Meal, { message: string }>>(
        '/meal',
        data
      ),
  };
};
export const getDuplicateMealMutationOptions = () => {
  return {
    mutationKey: ['duplicate-meal'],
    mutationFn: (data: { mealId: string }) =>
      adminApiClient.post<ApiResponseSuccessBase<null>>(
        '/meal/duplicate',
        data
      ),
  };
};

export const getUpdateMealMutationOptions = () => {
  return {
    mutationKey: ['update-meal'],
    mutationFn: ({ id, data }: { id: string; data: CreateMealSchema }) =>
      adminApiClient.put<ApiResponseSuccessBase<Meal, { message: string }>>(
        `/meal/${id}`,
        data
      ),
  };
};

export const getDeleteMealMutationOptions = () => {
  return {
    mutationKey: ['delete-meal'],
    mutationFn: ({ id }: { id: string }) =>
      adminApiClient.delete<ApiResponseSuccessBase<Meal, { message: string }>>(
        `/meal/${id}`
      ),
  };
};

export const getCreateZipCodeMutationOptions = () => {
  return {
    mutationKey: ['create-zip-code'],
    mutationFn: (data: CreateZipCodeSchema) =>
      adminApiClient.post<
        ApiResponseSuccessBase<
          {
            total?: number;
            zipCode?: ZipCode;
          },
          { message: string }
        >
      >('/zipcode', data),
  };
};

export const getUpdateZipCodeMutationOptions = () => {
  return {
    mutationKey: ['update-zip-code'],
    mutationFn: ({ id, data }: { id: string; data: CreateZipCodeSchema }) =>
      adminApiClient.put<ApiResponseSuccessBase<ZipCode>>(
        `/zipcode/${id}`,
        data
      ),
  };
};

export const getDeleteZipCodeMutationOptions = () => {
  return {
    mutationKey: ['delete-zip-code'],
    mutationFn: ({ id }: { id: string }) =>
      adminApiClient.delete<ApiResponseSuccessBase<ZipCode>>(`/zipcode/${id}`),
  };
};

export const getCreateCouponCodeMutationOptions = () => {
  return {
    mutationKey: ['create-coupon-code'],
    mutationFn: (data: CreateCouponCodeSchema) =>
      adminApiClient.post<
        ApiResponseSuccessBase<CouponCode, { message: string }>
      >('/product/coupon', data),
  };
};

export const getUpdateCouponCodeMutationOptions = () => {
  return {
    mutationKey: ['update-coupon-code'],
    mutationFn: ({ id, data }: { id: string; data: CreateCouponCodeSchema }) =>
      adminApiClient.put<ApiResponseSuccessBase<CouponCode>>(
        `/product/coupon/${id}`,
        data
      ),
  };
};

export const getDeleteCouponCodeMutationOptions = () => {
  return {
    mutationKey: ['delete-coupon-code'],
    mutationFn: ({ id }: { id: string }) =>
      adminApiClient.delete<ApiResponseSuccessBase<CouponCode>>(
        `/product/coupon/${id}`
      ),
  };
};

export const getCreateWeeklyMealsMutationOptions = () => {
  return {
    mutationKey: ['create-weekly-meals'],
    mutationFn: (data: CreateWeeklyMealsSchema) =>
      adminApiClient.post<ApiResponseSuccessBase<WeeklyMeal>>(
        '/meal/weeklymeal',
        data
      ),
  };
};

export const getUpdateWeeklyMealsMutationOptions = () => {
  return {
    mutationKey: ['update-weekly-meals'],
    mutationFn: ({ data, id }: { id: string; data: UpdateWeeklyMealsSchema }) =>
      adminApiClient.put<ApiResponseSuccessBase<WeeklyMeal>>(
        `/meal/weeklymeal/${id}`,
        data
      ),
  };
};

export const getDeleteWeeklyMealsOptions = () => {
  return {
    mutationKey: ['delete-weekly-meals'],
    mutationFn: ({ id }: { id: string }) =>
      adminApiClient.delete<ApiResponseSuccessBase<WeeklyMeal>>(
        `/meal/weeklymeal/${id}`
      ),
  };
};

export const getUpdateUserOptions = () => {
  return {
    mutationKey: ['update-user'],
    mutationFn: ({ id, data }: { data: UpdateUserSchema; id: string }) =>
      adminApiClient.put<ApiResponseSuccessBase<User>>(`/user/${id}`, data),
  };
};
export const getDeleteUserOptions = () => {
  return {
    mutationKey: ['delete-user'],
    mutationFn: ({ id }: { id: string }) =>
      adminApiClient.delete<ApiResponseSuccessBase<User>>(`/user/${id}`),
  };
};

export const getCheckProductSlugAvailabilityMutationOptions = () => {
  return {
    mutationKey: ['check-product-slug-availability'],
    mutationFn: (data: { slug: string }) =>
      adminApiClient.post<ApiResponseSuccessBase<{ available: boolean }>>(
        '/product/check-product-slug-availability',
        data
      ),
  };
};

export const getCreateProductMutationOptions = () => {
  return {
    mutationKey: ['create-product'],
    mutationFn: (data: SimpleProductSchema & VariableProductSchema) =>
      adminApiClient.post<ApiResponseSuccessBase<Product>>('/product', data),
  };
};

export const getUpdateProductMutationOptions = () => {
  return {
    mutationKey: ['update-product'],
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: SimpleProductSchema & VariableProductSchema;
    }) =>
      adminApiClient.put<ApiResponseSuccessBase<Product>>(
        `/product/${id}`,
        data
      ),
  };
};

export const getToggleProductShowOnHomePageBannerMutationOptions = () => {
  return {
    mutationKey: ['toggle-product-show-on-home-page-banner'],
    mutationFn: ({ id }: { id: string }) =>
      adminApiClient.put<{ success: boolean }>(
        `/product/${id}/toggle-show-on-home-page-banner`
      ),
  };
};

export const getToggleLinkedProductMutationOptions = () => {
  return {
    mutationKey: ['toggle-linked-product'],
    mutationFn: ({
      id,
      linkedProductId,
    }: {
      id: string;
      linkedProductId: string | null;
    }) =>
      adminApiClient.put<
        ApiResponseSuccessBase<{ added: boolean; removed: boolean }>
      >(`/product/${id}/toggle-linked-product`, { linkedProductId }),
  };
};

export const getDeleteProductMutationOptions = () => {
  return {
    mutationKey: ['delete-product'],
    mutationFn: ({ id }: { id: string }) =>
      adminApiClient.delete<ApiResponseSuccessBase<Product>>(`/product/${id}`),
  };
};

export const getCreateProductAttributeMutationOptions = () => {
  return {
    mutationKey: ['create-product-attribute'],
    mutationFn: (data: CreateProductAttributeSchema) =>
      adminApiClient.post<ApiResponseSuccessBase<ProductAttribute>>(
        '/product/attributes',
        data
      ),
  };
};

export const getUpdateProductAttributeMutationOptions = () => {
  return {
    mutationKey: ['update-product-attribute'],
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CreateProductAttributeSchema;
    }) =>
      adminApiClient.put<ApiResponseSuccessBase<ProductAttribute>>(
        `/product/attributes/${id}`,
        data
      ),
  };
};

export const getDeleteProductAttributeMutationOptions = () => {
  return {
    mutationKey: ['delete-product-attribute'],
    mutationFn: ({ id }: { id: string }) =>
      adminApiClient.delete<ApiResponseSuccessBase<ProductAttribute>>(
        `/product/attributes/${id}`
      ),
  };
};

export const getCreateProductAttributeTermMutationOptions = () => {
  return {
    mutationKey: ['create-product-attribute-term'],
    mutationFn: (
      data: CreateProductAttributeTermSchema & { productAttributeId: string }
    ) =>
      adminApiClient.post<ApiResponseSuccessBase<ProductAttributeTerm>>(
        '/product/attribute-terms',
        data
      ),
  };
};

export const getUpdateProductAttributeTermMutationOptions = () => {
  return {
    mutationKey: ['update-product-attribute-term'],
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CreateProductAttributeTermSchema;
    }) =>
      adminApiClient.put<ApiResponseSuccessBase<ProductAttributeTerm>>(
        `/product/attribute-terms/${id}`,
        data
      ),
  };
};

export const getDeleteProductAttributeTermMutationOptions = () => {
  return {
    mutationKey: ['delete-product-attribute-term'],
    mutationFn: ({ id }: { id: string }) =>
      adminApiClient.delete<ApiResponseSuccessBase<ProductAttributeTerm>>(
        `/product/attribute-terms/${id}`
      ),
  };
};

export const getUpdateProductAttributeTermsSortOrderMutationOptions = () => {
  return {
    mutationKey: ['update-product-attribute-terms-sort-order'],
    mutationFn: ({ termIds }: { termIds: string[] }) =>
      adminApiClient.put<ApiResponseSuccessBase<null>>(
        `/product/update-attribute-terms-sort-order`,
        { termIds }
      ),
  };
};

export const getCreateProductVariationsMutationOptions = () => {
  return {
    mutationKey: ['create-product-variations'],
    mutationFn: (data: { productId: string }) =>
      adminApiClient.post<ApiResponseSuccessBase<{ total: number }>>(
        '/product/variations',
        data
      ),
  };
};

export const getUpdateProductVariationMutationOptions = () => {
  return {
    mutationKey: ['update-product-variation'],
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductVariationSchema;
    }) =>
      adminApiClient.put<ApiResponseSuccessBase<ProductVariation>>(
        `/product/variations/${id}`,
        data
      ),
  };
};

export const getDeleteProductVariationMutationOptions = () => {
  return {
    mutationKey: ['delete-product-variation'],
    mutationFn: ({ id }: { id: string }) =>
      adminApiClient.delete<ApiResponseSuccessBase<ProductVariation>>(
        `/product/variations/${id}`
      ),
  };
};

export const getCreateProductCategoryMutationOptions = () => {
  return {
    mutationKey: ['create-product-category'],
    mutationFn: (data: CreateProductCategorySchema) =>
      adminApiClient.post<ApiResponseSuccessBase<ProductCategory>>(
        '/product/categories',
        data
      ),
  };
};

export const getUpdateProductCategoryMutationOptions = () => {
  return {
    mutationKey: ['update-product-category'],
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CreateProductCategorySchema;
    }) =>
      adminApiClient.put<ApiResponseSuccessBase<ProductCategory>>(
        `/product/categories/${id}`,
        data
      ),
  };
};

export const getUpdateProductCategoriesSortOrderMutationOptions = () => {
  return {
    mutationKey: ['update-product-categories-sort-order'],
    mutationFn: ({ ids }: { ids: string[] }) =>
      adminApiClient.put<ApiResponseSuccessBase<null>>(
        `/product/update-categories-sort-order`,
        { ids }
      ),
  };
};

export const getDeleteProductCategoryMutationOptions = () => {
  return {
    mutationKey: ['delete-product-category'],
    mutationFn: ({ id }: { id: string }) =>
      adminApiClient.delete<ApiResponseSuccessBase<ProductCategory>>(
        `/product/categories/${id}`
      ),
  };
};

export const getDeleteProductOrderMutationOptions = () => {
  return {
    mutationKey: ['delete-product-order'],
    mutationFn: ({ id }: { id: string }) =>
      adminApiClient.delete<ApiResponseSuccessBase<OrderSummary>>(
        `/order/${id}`
      ),
  };
};

export const getUpdateProductOrderMutationOptions = () => {
  return {
    mutationKey: ['update-product-order'],
    mutationFn: ({ id, data }: { id: string; data: { status: OrderStatus } }) =>
      adminApiClient.put<ApiResponseSuccessBase<OrderSummary>>(
        `/order/${id}`,
        data
      ),
  };
};
export const getUpdateMealOrderMutationOptions = () => {
  return {
    mutationKey: ['update-meal-order'],
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { status: MealOrderSummary['status'] };
    }) =>
      adminApiClient.put<ApiResponseSuccessBase<MealOrderSummary>>(
        `/plan/order/${id}`,
        data
      ),
  };
};

export const getCreateIngredientCategoryMutationOptions = () => {
  return {
    mutationKey: ['create-ingredient-category'],
    mutationFn: (data: CreateIngredientCategorySchema) =>
      adminApiClient.post<ApiResponseSuccessBase<IngredientCategory>>(
        '/meal/ingredient/categories',
        data
      ),
    //
  };
};

export const getRunAutoConfirmOrderMutationOptions = () => {
  return {
    mutationKey: ['create-ingredient-category'],
    mutationFn: () =>
      adminApiClient.post<
        ApiResponseSuccessBase<{
          totalOrderPlaced: number;
        }>
      >('/meal/run-auto-confirm-order'),
  };
};

export const getUpdateIngredientCategoryMutationOptions = () => {
  return {
    mutationKey: ['update-ingredient-category'],
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CreateIngredientCategorySchema;
    }) =>
      adminApiClient.put<ApiResponseSuccessBase<IngredientCategory>>(
        `/meal/ingredient/categories/${id}`,
        data
      ),
  };
};

export const getUpdateIngredientCategoriesSortOrderMutationOptions = () => {
  return {
    mutationKey: ['update-ingredient-categories-sort-order'],
    mutationFn: ({ ids }: { ids: string[] }) =>
      adminApiClient.put<ApiResponseSuccessBase<null>>(
        `/meal/ingredient/update-categories-sort-order`,
        { ids }
      ),
  };
};

export const getDeleteIngredientCategoryMutationOptions = () => {
  return {
    mutationKey: ['delete-ingredient-category'],
    mutationFn: ({ id }: { id: string }) =>
      adminApiClient.delete<ApiResponseSuccessBase<IngredientCategory>>(
        `/meal/ingredient/categories/${id}`
      ),
  };
};
