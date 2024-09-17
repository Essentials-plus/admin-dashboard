import adminApiClient from '@/api-clients/admin-api-client';
import { ApiResponseSuccessBase } from '@/types/api-responses';
import { CouponCode } from '@/types/api-responses/coupon-code';
import { Ingredient } from '@/types/api-responses/ingredient';
import { IngredientCategory } from '@/types/api-responses/ingredient-category';
import { Meal } from '@/types/api-responses/meal';
import { MealOrder, MealOrderSummary } from '@/types/api-responses/meal-orders';
import { Order, OrderSummary } from '@/types/api-responses/order';
import { Product } from '@/types/api-responses/product';
import {
  ProductAttribute,
  ProductAttributeTerm,
  ProductAttributeTerms,
} from '@/types/api-responses/product-attribute';
import { ProductCategory } from '@/types/api-responses/product-category';
import { User, UserPlan } from '@/types/api-responses/users';
import { WeeklyMealWithMeals } from '@/types/api-responses/weekly-meals';
import { ZipCode } from '@/types/api-responses/zip-code';
import { AxiosRequestConfig } from 'axios';

export const getIngredientsQueryOptions = ({
  axiosReqConfig,
}: {
  axiosReqConfig?: AxiosRequestConfig;
} = {}) => {
  return {
    queryKey: ['get-ingredients', axiosReqConfig],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<Ingredient[]>>(
          `/meal/ingredient`,
          axiosReqConfig
        )
        .then((res) => res.data),
  };
};

export const getIngredientByIdQueryOptions = ({ id }: { id: string }) => {
  return {
    queryKey: ['get-ingredient', id],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<Ingredient>>(`/meal/ingredient/${id}`)
        .then((res) => res.data),
    enabled: !!id,
  };
};

export const getMealsQueryOptions = ({
  axiosReqConfig,
}: {
  axiosReqConfig?: AxiosRequestConfig;
} = {}) => {
  return {
    queryKey: ['get-meals', axiosReqConfig],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<Meal[]>>(`/meal`, axiosReqConfig)
        .then((res) => res.data),
  };
};

export const getMealByIdQueryOptions = ({ id }: { id: string }) => {
  return {
    queryKey: ['get-meal', id],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<Meal>>(`/meal/${id}`)
        .then((res) => res.data),
    enabled: !!id,
  };
};

export const getZipCodesQueryOptions = ({
  axiosReqConfig,
}: {
  axiosReqConfig?: AxiosRequestConfig;
} = {}) => {
  return {
    queryKey: ['get-zipcodes', axiosReqConfig],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<ZipCode[]>>(`/zipcode`, axiosReqConfig)
        .then((res) => res.data),
  };
};

export const getZipCodeByIdQueryOptions = ({ id }: { id: string }) => {
  return {
    queryKey: ['get-zipcode', id],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<ZipCode>>(`/zipcode/${id}`)
        .then((res) => res.data),
    enabled: !!id,
  };
};

export const getCouponCodesQueryOptions = ({
  axiosReqConfig,
}: {
  axiosReqConfig?: AxiosRequestConfig;
} = {}) => {
  return {
    queryKey: ['get-coupon-codes', axiosReqConfig],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<CouponCode[]>>(
          `/product/coupon`,
          axiosReqConfig
        )
        .then((res) => res.data),
  };
};

export const getCouponCodeByIdQueryOptions = ({ id }: { id: string }) => {
  return {
    queryKey: ['get-coupon-code', id],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<CouponCode>>(`/product/coupon/${id}`)
        .then((res) => res.data),
    enabled: !!id,
  };
};

export const getWeeklyMealsQueryOptions = ({
  axiosReqConfig,
}: {
  axiosReqConfig?: AxiosRequestConfig;
} = {}) => {
  return {
    queryKey: ['get-weekly-meals', axiosReqConfig],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<WeeklyMealWithMeals[]>>(
          `/meal/weeklymeal`,
          axiosReqConfig
        )
        .then((res) => res.data),
  };
};

export const getWeeklyMealByIdQueryOptions = ({ id }: { id: string }) => {
  return {
    queryKey: ['get-weekly-meal', id],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<WeeklyMealWithMeals>>(
          `/meal/weeklymeal/${id}`
        )
        .then((res) => res.data),
    enabled: !!id,
  };
};

export const getUsersQueryOptions = ({
  axiosReqConfig,
}: {
  axiosReqConfig?: AxiosRequestConfig;
} = {}) => {
  return {
    queryKey: ['get-users', axiosReqConfig],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<User[]>>(`/user`, axiosReqConfig)
        .then((res) => res.data),
  };
};

export const getUserByIdQueryOptions = ({ id }: { id: string }) => {
  return {
    queryKey: ['get-user', id],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<User & { plan: UserPlan }>>(`/user/${id}`)
        .then((res) => res.data),
    enabled: !!id,
  };
};

export const getProductsQueryOptions = ({
  axiosReqConfig,
}: {
  axiosReqConfig?: AxiosRequestConfig;
} = {}) => {
  return {
    queryKey: ['get-products', axiosReqConfig],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<Product[]>>(`/product`, axiosReqConfig)
        .then((res) => res.data),
  };
};

export const getProductByIdQueryOptions = ({ id }: { id: string }) => {
  return {
    queryKey: ['get-product-by-id', id],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<Product>>(`/product/${id}`)
        .then((res) => res.data),
    enabled: !!id,
  };
};

export const getProductAttributesQueryOptions = ({
  axiosReqConfig,
}: {
  axiosReqConfig?: AxiosRequestConfig;
} = {}) => {
  return {
    queryKey: ['get-product-attributes', axiosReqConfig],
    queryFn: () =>
      adminApiClient
        .get<
          ApiResponseSuccessBase<
            (ProductAttribute & { terms: ProductAttributeTerm[] })[]
          >
        >(`/product/attributes`, axiosReqConfig)
        .then((res) => res.data),
  };
};

export const getProductAttributeByIdQueryOptions = ({ id }: { id: string }) => {
  return {
    queryKey: ['get-product-attribute', id],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<ProductAttribute>>(
          `/product/attributes/${id}`
        )
        .then((res) => res.data),
    enabled: !!id,
  };
};

export const getProductAttributeTermsQueryOptions = ({
  axiosReqConfig,
  attributeId,
}: {
  axiosReqConfig?: AxiosRequestConfig;
  attributeId: string;
}) => {
  return {
    queryKey: [
      'get-product-attribute-terms-by-attribute-id',
      axiosReqConfig,
      attributeId,
    ],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<ProductAttributeTerms[]>>(
          `/product/attribute-terms-by-attribute-id/${attributeId}`,
          axiosReqConfig
        )
        .then((res) => res.data),
    enabled: !!attributeId,
  };
};

export const getProductAttributeTermByIdQueryOptions = ({
  id,
}: {
  id: string;
}) => {
  return {
    queryKey: ['get-product-attribute-term', id],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<ProductAttributeTerm>>(
          `/product/attribute-term/${id}`
        )
        .then((res) => res.data),
    enabled: !!id,
  };
};

export const getProductCategoriesQueryOptions = ({
  axiosReqConfig,
}: {
  axiosReqConfig?: AxiosRequestConfig;
} = {}) => {
  return {
    queryKey: ['get-product-categories', axiosReqConfig],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<ProductCategory[]>>(
          `/product/categories`,
          axiosReqConfig
        )
        .then((res) => res.data),
  };
};

export const getProductCategoryByIdQueryOptions = ({ id }: { id: string }) => {
  return {
    queryKey: ['get-product-category', id],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<ProductCategory>>(
          `/product/categories/${id}`
        )
        .then((res) => res.data),
    enabled: !!id,
  };
};

export const getProductOrdersQueryOptions = ({
  axiosReqConfig,
}: {
  axiosReqConfig?: AxiosRequestConfig;
} = {}) => {
  return {
    queryKey: ['get-product-orders', axiosReqConfig],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<OrderSummary[]>>(`/order`, axiosReqConfig)
        .then((res) => res.data),
  };
};

export const getProductOrderByIdQueryOptions = ({ id }: { id: string }) => {
  return {
    queryKey: ['get-product-order', id],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<Order>>(`/order/${id}`)
        .then((res) => res.data),
    enabled: !!id,
  };
};

export const getMealOrdersQueryOptions = ({
  axiosReqConfig,
}: {
  axiosReqConfig?: AxiosRequestConfig;
} = {}) => {
  return {
    queryKey: ['get-meal-orders', axiosReqConfig],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<MealOrderSummary[]>>(
          `/plan/order`,
          axiosReqConfig
        )
        .then((res) => res.data),
  };
};

export const getMealOrderByIdQueryOptions = ({ id }: { id: string }) => {
  return {
    queryKey: ['get-meal-order', id],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<MealOrder>>(`/plan/order/${id}`)
        .then((res) => res.data),
    enabled: !!id,
  };
};

export const getIngredientCategoriesQueryOptions = ({
  axiosReqConfig,
}: {
  axiosReqConfig?: AxiosRequestConfig;
} = {}) => {
  return {
    queryKey: ['get-ingredient-categories', axiosReqConfig],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<IngredientCategory[]>>(
          `/meal/ingredient/categories`,
          axiosReqConfig
        )
        .then((res) => res.data),
  };
};

export const getIngredientCategoryByIdQueryOptions = ({
  id,
}: {
  id: string;
}) => {
  return {
    queryKey: ['get-ingredient-category', id],
    queryFn: () =>
      adminApiClient
        .get<ApiResponseSuccessBase<IngredientCategory>>(
          `/meal/ingredient/categories/${id}`
        )
        .then((res) => res.data),
    enabled: !!id,
  };
};
