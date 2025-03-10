/* eslint-disable @next/next/no-img-element */
import {
  getCreateProductCategoryMutationOptions,
  getUpdateProductCategoryMutationOptions,
  getUploadFileMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import {
  getProductCategoriesQueryOptions,
  getProductCategoryByIdQueryOptions,
} from '@/api-clients/admin-api-client/queries';
import {
  CreateOrUpdateProductCategoryFormProps,
  CreateProductCategorySchema,
  createProductCategorySchema,
} from '@/components/create-or-update-product-category-form/schema';

import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { FormikInput } from '@/components/ui/input';
import { FormikSelect } from '@/components/ui/select';
import Spinner from '@/components/ui/spinner';
import { FormikTextarea } from '@/components/ui/textarea';
import { BeforeUnloadComponent } from '@/hooks/useBeforeUnload';
import { getApiErrorMessage } from '@/lib/utils';
import { Optionalize } from '@/types/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ErrorMessage, Formik } from 'formik';
import { Upload, X } from 'lucide-react';
import { Fragment, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const CreateOrUpdateProductCategoryForm = ({
  categoryId,
  onCreateOrUpdate,
  onApiError,
}: CreateOrUpdateProductCategoryFormProps) => {
  const productCategoryQuery = useQuery({
    ...getProductCategoryByIdQueryOptions({ id: categoryId! }),
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (productCategoryQuery.isError) {
      toast.error(getApiErrorMessage(productCategoryQuery.error), {
        id: 'productCategoryQueryError',
      });
      onApiError && onApiError();
    }
  }, [productCategoryQuery.error, productCategoryQuery.isError, onApiError]);

  const productCategoriesQueryDefaultOptions =
    getProductCategoriesQueryOptions();

  const productCategoriesQuery = useQuery({
    ...productCategoriesQueryDefaultOptions,
  });
  const parentCategories = useMemo(
    () =>
      (productCategoriesQuery.data?.data || []).filter(
        (category) => category.id !== productCategoryQuery.data?.data.id
      ),
    [productCategoriesQuery.data?.data, productCategoryQuery.data?.data.id]
  );

  const createProductCategoryMutation = useMutation({
    ...getCreateProductCategoryMutationOptions(),
    onSuccess(data) {
      toast.success(`Product category "${data.data.data.name}" created`);
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to create product category')
      );
      onApiError && onApiError();
    },
  });

  const updateProductCategoryMutation = useMutation({
    ...getUpdateProductCategoryMutationOptions(),
    onSuccess(data) {
      toast.success('Product category updated successfully');
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to update product category')
      );
      onApiError && onApiError();
    },
  });

  const uploadFileMutation = useMutation({
    ...getUploadFileMutationOptions(),
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to upload images. Please try again')
      );
    },
  });

  const initialValues: Optionalize<CreateProductCategorySchema> =
    productCategoryQuery.data?.data
      ? {
          ...productCategoryQuery.data?.data,
          parentCategoryId:
            productCategoryQuery.data?.data.parentCategoryId || undefined,
        }
      : {
          name: '',
          image: '',
          parentCategoryId: undefined,
          description: '',
        };

  if (!productCategoryQuery.data && categoryId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  const CloseButton = !!categoryId ? DialogClose : Fragment;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(createProductCategorySchema)}
      onSubmit={async (values, actions) => {
        const parsedValue = createProductCategorySchema.safeParse(values);

        if (parsedValue.success) {
          try {
            if (!values.image) {
              actions.setFieldError('image', 'Image is required');
              return;
            }

            if (!!values.image && values.image instanceof File) {
              const data = new FormData();

              data.append('file', values.image);

              await uploadFileMutation
                .mutateAsync({
                  data,
                })
                .then((res) => {
                  const imgUrl = res.data.data.location;
                  parsedValue.data.image = imgUrl;
                  actions.setFieldValue('image', imgUrl);
                });
            }

            if (categoryId) {
              await updateProductCategoryMutation.mutateAsync({
                data: parsedValue.data,
                id: categoryId,
              });
              actions.resetForm({
                values: parsedValue.data,
              });
            } else {
              await createProductCategoryMutation.mutateAsync({
                ...parsedValue.data,
              });
              actions.resetForm();
            }
          } catch (err) {
          } finally {
            actions.setSubmitting(false);
          }
        } else {
          toast.error(getApiErrorMessage(parsedValue.error));
          actions.setSubmitting(false);
        }
      }}
    >
      {({ handleSubmit, isSubmitting, dirty, values, setFieldValue }) => (
        <form onSubmit={handleSubmit} className="space-y-3">
          <BeforeUnloadComponent enabled={dirty} />
          <div className="grid gap-6 md:grid-cols-[150px,auto]">
            <div>
              <label className="block cursor-pointer max-lg:max-w-[150px]">
                <input
                  type="file"
                  className="sr-only"
                  onClick={(e) => {
                    (e.target as HTMLInputElement).value = '';
                  }}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      setFieldValue('image', files[0]);
                    }
                  }}
                  accept="image/*"
                />
                {values.image ? (
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <div className="relative">
                      <Button
                        size={'icon'}
                        className="absolute right-2 top-2 size-6 rounded-md"
                        variant={'destructive'}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFieldValue('image', '');
                        }}
                      >
                        <X className="size-3.5" />
                      </Button>
                      <img
                        src={
                          typeof values.image === 'string'
                            ? values.image
                            : URL.createObjectURL(values.image as any)
                        }
                        alt="Image"
                      />
                    </div>
                  </div>
                ) : values.image ? (
                  <img alt={''} className="w-full" src={values.image} />
                ) : (
                  <div className="flex aspect-square flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-dashed border-muted text-sm">
                    <Upload className="size-5 opacity-80" />
                    <p className="text-sm opacity-70">Upload Image</p>
                  </div>
                )}
              </label>
              <ErrorMessage name="image">
                {(errorMessage) => (
                  <p className="mt-2 text-xs text-red-500">{errorMessage}</p>
                )}
              </ErrorMessage>
            </div>

            <div className="space-y-4">
              <FormikInput name="name" label="Name" type="text" />
              <div>
                <FormikSelect
                  name="parentCategoryId"
                  options={parentCategories
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((category) => ({
                      label: category.name,
                      value: category.id,
                    }))}
                  label="Parent category"
                />
                {values.parentCategoryId && (
                  <button
                    type="button"
                    onClick={() => {
                      setFieldValue('parentCategoryId', null);
                    }}
                    className="mt-0.5 text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          <div>
            <FormikTextarea label="Description" name="description" />
          </div>
          <div className="mt-3 flex justify-end gap-4 sm:space-x-0">
            <CloseButton {...(!!categoryId ? { asChild: true } : {})}>
              {!!categoryId && (
                <Button
                  type="button"
                  disabled={isSubmitting}
                  variant={'secondary'}
                >
                  Cancel
                </Button>
              )}
            </CloseButton>
            <Button
              disabled={!dirty && !!categoryId}
              type="submit"
              loading={isSubmitting}
            >
              {categoryId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default CreateOrUpdateProductCategoryForm;
