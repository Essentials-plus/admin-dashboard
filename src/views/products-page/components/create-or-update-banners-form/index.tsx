/* eslint-disable @next/next/no-img-element */
import {
  getCreateOrUpdateRawDataMutationOptions,
  getUploadFileMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getRawDataByIdentifierQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { FormikInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BeforeUnloadComponent } from '@/hooks/useBeforeUnload';
import { getApiErrorMessage } from '@/lib/utils';
import { Optionalize } from '@/types/utils';
import {
  CreateOrUpdateBannersFormProps,
  CreateOrUpdateBannersSchema,
  createOrUpdateBannersSchema,
} from '@/views/products-page/components/create-or-update-banners-form/schema';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ErrorMessage, Form, Formik } from 'formik';
import { Upload, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Fragment, useEffect } from 'react';
import { toast } from 'sonner';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const RichTextEditor = dynamic(
  () => import('@/components/ui/rich-text-editor'),
  { ssr: false }
);

const identifier = 'products-page.banners';

const CreateOrUpdateBannersForm = ({}: CreateOrUpdateBannersFormProps) => {
  const rawDataQueryFn = getRawDataByIdentifierQueryOptions({
    identifier: identifier,
  });
  const rawDataQuery = useQuery({
    ...rawDataQueryFn,
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (rawDataQuery.isError) {
      toast.error(getApiErrorMessage(rawDataQuery.error), {
        id: identifier + 'rawDataQueryError',
      });
    }
  }, [rawDataQuery.error, rawDataQuery.isError]);

  const rawDataData = rawDataQuery.data?.data?.data;

  const initialValues: Optionalize<CreateOrUpdateBannersSchema> =
    rawDataData &&
    typeof rawDataData === 'object' &&
    Object.keys(rawDataData).length > 0
      ? {
          ...rawDataData,
        }
      : {
          banners: [],
        };

  const createOrUpdateRawDataMutation = useMutation({
    ...getCreateOrUpdateRawDataMutationOptions({
      axiosConfig: {
        params: {
          skipDeepMerge: true,
        },
      },
    }),
    onSuccess() {
      toast.success(`Banners updated successfully`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update banners'));
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

  if (!rawDataData) {
    return <ApiStatusIndicator noData={false} query={rawDataQuery} />;
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(createOrUpdateBannersSchema)}
      enableReinitialize
      onSubmit={async (values, actions) => {
        console.log(values);
        try {
          const formValues = values;

          // if ((values.banners || [])?.length <= 0) {
          //   actions.setFieldError('banners', 'Add atleast one banner');
          //   return;
          // }

          let bannerIndex = 0;
          for await (const banner of values.banners || []) {
            if (!!banner.image && banner.image instanceof File) {
              const data = new FormData();

              data.append('file', banner.image);

              await uploadFileMutation
                .mutateAsync({
                  data,
                })
                .then((res) => {
                  const imgUrl = res.data.data.location;
                  (formValues.banners || [])[bannerIndex].image = imgUrl;
                  actions.setFieldValue(`banners.${bannerIndex}.image`, imgUrl);
                });
            }
            bannerIndex++;
          }

          await createOrUpdateRawDataMutation.mutateAsync({
            identifier,
            data: values,
          });
          await rawDataQuery.refetch();
          actions.setSubmitting(false);
          actions.resetForm();
        } catch (error) {
          // toast.error(getApiErrorMessage(error));
        }
      }}
    >
      {({ isSubmitting, values, dirty, setFieldValue, submitForm }) => (
        <Form>
          <div className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8">
            <BeforeUnloadComponent enabled={dirty} />

            {values.banners?.map((banner, i) => (
              <Fragment key={banner.id}>
                <div
                  key={banner.id}
                  className="relative grid grid-cols-1 gap-6 pr-14 xl:grid-cols-[220px,auto]"
                >
                  <Button
                    type="button"
                    size={'icon'}
                    variant={'secondary'}
                    className="absolute right-2 top-2 z-20"
                    onClick={() => {
                      setFieldValue(
                        'banners',
                        (values.banners || []).filter(
                          (bnr) => bnr.id !== banner.id
                        )
                      );
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                  <div>
                    <label className="block cursor-pointer max-lg:max-w-[250px]">
                      <input
                        type="file"
                        className="sr-only"
                        onClick={(e) => {
                          (e.target as HTMLInputElement).value = '';
                        }}
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) {
                            setFieldValue(`banners.${i}.image`, files[0]);
                          }
                        }}
                        accept="image/*"
                      />
                      {banner.image ? (
                        <div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <div className="relative">
                            <Button
                              size={'icon'}
                              className="absolute right-2 top-2 size-6 rounded-md"
                              variant={'destructive'}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFieldValue(`banners.${i}.image`, '');
                              }}
                            >
                              <X className="size-3.5" />
                            </Button>
                            <img
                              src={
                                typeof banner.image === 'string'
                                  ? banner.image
                                  : URL.createObjectURL(banner.image as any)
                              }
                              alt="Image"
                            />
                          </div>
                        </div>
                      ) : banner.image ? (
                        <img alt={''} className="w-full" src={banner.image} />
                      ) : (
                        <div className="flex aspect-square flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-dashed border-muted text-sm">
                          <Upload className="size-8 opacity-80" />
                          <p className="opacity-70">Upload Image</p>
                        </div>
                      )}
                    </label>
                    <ErrorMessage name={`banners.${i}.image`}>
                      {(errorMessage) => (
                        <p className="mt-2 text-xs text-red-500">
                          {errorMessage}
                        </p>
                      )}
                    </ErrorMessage>
                  </div>

                  <div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <Label
                          htmlFor={banner.id + '_title'}
                          className="mb-3 inline-block"
                        >
                          Title
                        </Label>
                        <RichTextEditor
                          editor={{
                            id: banner.id + '_title',
                            value: values.banners![i].title,
                            onEditorChange: (value) => {
                              setFieldValue(`banners.${i}.title`, value);
                            },
                          }}
                        />
                      </div>
                      <FormikInput
                        name={`banners.${i}.buttonText`}
                        label="Button text"
                      />
                      <FormikInput
                        name={`banners.${i}.buttonUrl`}
                        label="Button url"
                        type="url"
                      />
                    </div>
                  </div>
                </div>
                {(values.banners || [])?.length !== i + 1 && (
                  <Separator className="my-3" />
                )}
              </Fragment>
            ))}

            <div className="mt-4 flex justify-end gap-3">
              <Button
                onClick={() => {
                  setFieldValue('banners', [
                    ...(values.banners || []),
                    {
                      id: uuidv4(),
                      image: '',
                      title: '',
                      buttonText: '',
                      buttonUrl: '',
                    },
                  ]);
                }}
              >
                Add new
              </Button>
              {dirty && (
                <Button
                  disabled={!dirty}
                  type="submit"
                  onClick={submitForm}
                  loading={isSubmitting}
                >
                  Update
                </Button>
              )}
            </div>
            {/* <ErrorMessage name={`banners`}>
              {(errorMessage) => (
                <p className="mt-2 text-xs text-red-500">{errorMessage}</p>
              )}
            </ErrorMessage> */}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CreateOrUpdateBannersForm;
