/* eslint-disable @next/next/no-img-element */
import {
  getCreateOrUpdateRawDataMutationOptions,
  getUploadFileMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getRawDataByIdentifierQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';

import { Button } from '@/components/ui/button';
import { FormikInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BeforeUnloadComponent } from '@/hooks/useBeforeUnload';
import { getApiErrorMessage } from '@/lib/utils';
import { Optionalize } from '@/types/utils';
import {
  CreateOrUpdateHowItWorksPageHeroSectionFormProps,
  createOrUpdateHowItWorksPageHeroSectionSchema,
  CreateOrUpdateHowItWorksPageHeroSectionSchema,
} from '@/views/how-it-works-page/components/create-or-update-how-it-works-page-hero-section-form/schema';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ErrorMessage, Form, Formik } from 'formik';
import { Upload, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { toast } from 'sonner';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const RichTextEditor = dynamic(
  () => import('@/components/ui/rich-text-editor'),
  { ssr: false }
);

const identifier = 'how-it-works-page.hero-section';

const CreateOrUpdateHowItWorksPageHeroSectionForm =
  ({}: CreateOrUpdateHowItWorksPageHeroSectionFormProps) => {
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

    const initialValues: Optionalize<CreateOrUpdateHowItWorksPageHeroSectionSchema> =
      rawDataData &&
      typeof rawDataData === 'object' &&
      Object.keys(rawDataData).length > 0
        ? {
            ...rawDataData,
          }
        : {
            title: '',
            description: '',
            buttonText: '',
            buttonUrl: '',
            image: '',
            buttonBackgroundColor: '#000000',
            buttonTextColor: '#ffffff',
          };

    const createOrUpdateRawDataMutation = useMutation({
      ...getCreateOrUpdateRawDataMutationOptions(),
      onSuccess() {
        toast.success(`Hero section updated successfully`);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, 'Failed to update hero section'));
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
        validationSchema={toFormikValidationSchema(
          createOrUpdateHowItWorksPageHeroSectionSchema
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
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <FormikInput name="title" label="Title" />
                    </div>
                    <div className="md:col-span-2">
                      <Label
                        htmlFor={'description'}
                        className="mb-3 inline-block"
                      >
                        Description
                      </Label>
                      <RichTextEditor
                        editor={{
                          id: 'description',
                          value: values['description'],
                          onEditorChange: (value) => {
                            setFieldValue('description', value);
                          },
                        }}
                      />
                    </div>
                    <FormikInput name="buttonText" label="Button text" />
                    <FormikInput name="buttonUrl" label="Button url" />

                    <div>
                      <Label
                        htmlFor={'buttonBackgroundColor'}
                        className="mb-3 inline-block"
                      >
                        Button background color
                      </Label>
                      <div className="space-y-3">
                        <HexColorPicker
                          color={values.buttonBackgroundColor}
                          onChange={(color) =>
                            setFieldValue('buttonBackgroundColor', color)
                          }
                        />
                        <div className="relative">
                          <div
                            className="absolute left-0 top-0 aspect-square h-full rounded-l-md"
                            style={{
                              backgroundColor: values.buttonBackgroundColor,
                            }}
                          ></div>
                          <FormikInput
                            name="buttonBackgroundColor"
                            placeholder="#000000"
                            className="pl-12"
                          />
                        </div>
                      </div>
                      <ErrorMessage name="buttonBackgroundColor">
                        {(errorMessage) => (
                          <p className="mt-2 text-xs text-red-500">
                            {errorMessage}
                          </p>
                        )}
                      </ErrorMessage>
                    </div>

                    <div>
                      <Label
                        htmlFor={'buttonTextColor'}
                        className="mb-3 inline-block"
                      >
                        Button text color
                      </Label>
                      <div className="space-y-3">
                        <HexColorPicker
                          color={values.buttonTextColor}
                          onChange={(color) =>
                            setFieldValue('buttonTextColor', color)
                          }
                        />
                        <div className="relative">
                          <div
                            className="absolute left-0 top-0 aspect-square h-full rounded-l-md"
                            style={{
                              backgroundColor: values.buttonTextColor,
                            }}
                          ></div>
                          <FormikInput
                            name="buttonTextColor"
                            placeholder="#ffffff"
                            className="pl-12"
                          />
                        </div>
                      </div>
                      <ErrorMessage name="buttonTextColor">
                        {(errorMessage) => (
                          <p className="mt-2 text-xs text-red-500">
                            {errorMessage}
                          </p>
                        )}
                      </ErrorMessage>
                    </div>

                    <div className="flex justify-end md:col-span-2">
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
            </div>
          </Form>
        )}
      </Formik>
    );
  };

export default CreateOrUpdateHowItWorksPageHeroSectionForm;
