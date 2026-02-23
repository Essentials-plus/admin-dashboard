/* eslint-disable @next/next/no-img-element */
import {
  getCreateOrUpdateRawDataMutationOptions,
  getUploadFileMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getRawDataByIdentifierQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';

import { Button } from '@/components/ui/button';
import { BeforeUnloadComponent } from '@/hooks/useBeforeUnload';
import { getApiErrorMessage } from '@/lib/utils';
import { Optionalize } from '@/types/utils';
import {
  CreateOrUpdateLoginPageHeroSectionFormProps,
  createOrUpdateLoginPageHeroSectionSchema,
  CreateOrUpdateLoginPageHeroSectionSchema,
} from '@/views/login-page/components/create-or-update-login-page-hero-section-form/schema';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ErrorMessage, Form, Formik } from 'formik';
import { Upload, X } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const identifier = 'login-page.hero-section';

const CreateOrUpdateLoginPageHeroSectionForm =
  ({}: CreateOrUpdateLoginPageHeroSectionFormProps) => {
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

    const initialValues: Optionalize<CreateOrUpdateLoginPageHeroSectionSchema> =
      rawDataData &&
      typeof rawDataData === 'object' &&
      Object.keys(rawDataData).length > 0
        ? {
            ...rawDataData,
          }
        : {
            image: '',
          };

    const createOrUpdateRawDataMutation = useMutation({
      ...getCreateOrUpdateRawDataMutationOptions(),
      onSuccess() {
        toast.success(`Hero section image updated successfully`);
      },
      onError: (error) => {
        toast.error(
          getApiErrorMessage(error, 'Failed to update hero section image')
        );
      },
    });

    const uploadFileMutation = useMutation({
      ...getUploadFileMutationOptions(),
      onError(error) {
        toast.error(
          getApiErrorMessage(error, 'Failed to upload image. Please try again')
        );
      },
    });

    if (!rawDataData) {
      return <ApiStatusIndicator noData={false} query={rawDataQuery} />;
    }

    return (
      <Formik
        initialValues={initialValues}
        validationSchema={toFormikValidationSchema(
          createOrUpdateLoginPageHeroSectionSchema
        )}
        enableReinitialize
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

            await createOrUpdateRawDataMutation.mutateAsync({
              identifier,
              data: values,
            });
            await rawDataQuery.refetch();
            actions.setSubmitting(false);
            actions.resetForm();
            actions.setFieldValue('image', '');
          } catch (error) {
            // toast.error(getApiErrorMessage(error));
          }
        }}
      >
        {({ isSubmitting, values, dirty, setFieldValue, submitForm }) => (
          <Form>
            <div className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8">
              <BeforeUnloadComponent enabled={dirty} />

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[350px,auto]">
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
                      <p className="mt-2 text-xs text-red-500">
                        {errorMessage}
                      </p>
                    )}
                  </ErrorMessage>
                </div>

                <div>
                  <div className="flex justify-end">
                    <div className="flex justify-end gap-4 sm:space-x-0">
                      <Button
                        disabled={!dirty}
                        type="submit"
                        onClick={submitForm}
                        loading={isSubmitting}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    );
  };

export default CreateOrUpdateLoginPageHeroSectionForm;
