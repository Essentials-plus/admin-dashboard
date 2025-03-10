/* eslint-disable @next/next/no-img-element */
import {
  getCreateSpotlightsProductBannerMutationOptions,
  getUpdateSpotlightsProductBannerMutationOptions,
  getUploadFileMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getSpotlightsProductBannerByIdQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import {
  CreateOrUpdateSpotlightsProductBannerFormProps,
  CreateSpotlightsProductBannerSchema,
  createSpotlightsProductBannerSchema,
} from '@/components/create-or-update-spotlights-product-banners-form/schema';
import SearchProductsPopover from '@/components/search-products-popover';
import { Button } from '@/components/ui/button';
import Circle from '@/components/ui/circle';
import { DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { BeforeUnloadComponent } from '@/hooks/useBeforeUnload';
import { getApiErrorMessage } from '@/lib/utils';
import { Product } from '@/types/api-responses/product';
import { Optionalize } from '@/types/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ErrorMessage, Form, Formik } from 'formik';
import { Upload, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const RichTextEditor = dynamic(
  () => import('@/components/ui/rich-text-editor'),
  { ssr: false }
);

const CreateOrUpdateSpotlightsProductBannersForm = ({
  spotlightsProductBannerId,
  onCreateOrUpdate,
  onApiError,
  product,
}: CreateOrUpdateSpotlightsProductBannerFormProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    product || null
  );

  const spotlightsProductBannerQueryFn =
    getSpotlightsProductBannerByIdQueryOptions({
      id: spotlightsProductBannerId!,
    });
  const spotlightsProductBannerQuery = useQuery({
    ...spotlightsProductBannerQueryFn,
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (spotlightsProductBannerQuery.isError) {
      toast.error(getApiErrorMessage(spotlightsProductBannerQuery.error), {
        id: 'spotlightsProductBannersQueryError',
      });
      onApiError && onApiError();
    }
  }, [
    onApiError,
    spotlightsProductBannerQuery.error,
    spotlightsProductBannerQuery.isError,
  ]);

  const spotlightsProductBannerData = spotlightsProductBannerQuery.data?.data;

  const initialValues: Optionalize<CreateSpotlightsProductBannerSchema> =
    spotlightsProductBannerData
      ? {
          ...spotlightsProductBannerData,
        }
      : {
          image: '',
          productId: '',
          title: '',
        };

  const createSpotlightsProductBannerMutation = useMutation({
    ...getCreateSpotlightsProductBannerMutationOptions(),
    onSuccess(data) {
      toast.success(`Spotlight product banner created successfully`);
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Failed to create spotlight product banner')
      );
      onApiError && onApiError();
    },
  });

  const updateSpotlightsProductBannerMutation = useMutation({
    ...getUpdateSpotlightsProductBannerMutationOptions(),
    onSuccess(data) {
      toast.success('Spotlight product banner updated successfully');
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to update spotlight product banner')
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

  if (!spotlightsProductBannerQuery.data && !!spotlightsProductBannerId) {
    return (
      <ApiStatusIndicator noData={false} query={spotlightsProductBannerQuery} />
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(
        createSpotlightsProductBannerSchema
      )}
      onSubmit={async (values, actions) => {
        try {
          const formValues = values;
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
                formValues.image = imgUrl;
                actions.setFieldValue('image', imgUrl);
              });
          }

          if (spotlightsProductBannerId) {
            await updateSpotlightsProductBannerMutation.mutateAsync({
              data: {
                ...(values as any),
              },
              id: spotlightsProductBannerId,
            });
            actions.resetForm({
              values: values,
            });
            spotlightsProductBannerQuery.refetch();
            actions.setFieldValue('image', '');
          } else {
            await createSpotlightsProductBannerMutation.mutateAsync({
              ...(values as any),
            });
            actions.setSubmitting(false);
            actions.resetForm();
            actions.setFieldValue('image', '');
          }
        } catch (error) {
          // toast.error(getApiErrorMessage(error));
        }
      }}
    >
      {({ isSubmitting, values, dirty, setFieldValue }) => (
        <Form>
          <div className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8">
            <BeforeUnloadComponent enabled={dirty} />

            <div className="grid max-h-[70vh] gap-6 overflow-y-auto p-0.5">
              <div>
                {selectedProduct ? (
                  <div className="flex items-center gap-3 rounded-md border border-border p-2">
                    <Circle className="relative w-8 rounded-md bg-muted">
                      <Image
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        fill
                        className="object-cover"
                      />
                    </Circle>
                    <div>
                      <p className="text-sm font-medium">
                        {selectedProduct.name}
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedProduct(null);
                        setFieldValue('productId', '');
                      }}
                      className="ml-auto size-7"
                      size={'icon'}
                      variant={'secondary'}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <SearchProductsPopover
                    onSelect={(product) => {
                      setSelectedProduct(product);
                      setFieldValue('productId', product.id);
                    }}
                    inputProps={{
                      className: 'h-[50px]',
                    }}
                  />
                )}
                <ErrorMessage name="productId">
                  {() => (
                    <p className="mt-2 text-xs text-red-500">
                      Please select a product
                    </p>
                  )}
                </ErrorMessage>
              </div>

              <div>
                <Label htmlFor="title" className="mb-3 inline-block">
                  Title
                </Label>
                <RichTextEditor
                  editor={{
                    id: 'title',
                    value: values['title'],
                    onEditorChange: (value) => {
                      setFieldValue('title', value);
                    },
                    init: {
                      height: 200,
                    },
                  }}
                />
              </div>

              <div>
                <label className="block max-w-[200px] cursor-pointer">
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
                      <Upload className="size-8 opacity-80" />
                      <p className="opacity-70">Upload Image</p>
                    </div>
                  )}
                </label>
                <ErrorMessage name="image">
                  {(errorMessage) => (
                    <p className="mt-2 text-xs text-red-500">{errorMessage}</p>
                  )}
                </ErrorMessage>
              </div>

              <div className="flex justify-end gap-4 sm:space-x-0">
                <DialogClose asChild>
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    variant={'secondary'}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  disabled={!dirty && !!spotlightsProductBannerId}
                  type="submit"
                  loading={isSubmitting}
                >
                  {spotlightsProductBannerId ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CreateOrUpdateSpotlightsProductBannersForm;
