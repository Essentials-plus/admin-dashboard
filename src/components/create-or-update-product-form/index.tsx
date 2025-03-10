import {
  getCheckProductSlugAvailabilityMutationOptions,
  getCreateProductMutationOptions,
  getCreateProductVariationMutationOptions,
  getCreateProductVariationsMutationOptions,
  getDeleteProductVariationMutationOptions,
  getToggleLinkedProductMutationOptions,
  getToggleProductShowOnBestSellerSectionMutationOptions,
  getToggleProductShowOnCartRecommendationSectionMutationOptions,
  getUpdateProductMutationOptions,
  getUpdateProductVariationMutationOptions,
  getUploadFileMutationOptions,
  getUploadFilesMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import {
  getProductAttributeTermsQueryOptions,
  getProductAttributesQueryOptions,
  getProductByIdQueryOptions,
  getProductCategoriesRecursivelyQueryOptions,
} from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { confirm } from '@/components/confirm';
import {
  CreateOrUpdateProductFormProps,
  SimpleProductSchema,
  UpdateProductVariationSchema,
  VariableProductSchema,
  createProductBaseSchema,
  createSimpleProductSchema,
  createVariableProductSchema,
  updateProductVariationSchema,
} from '@/components/create-or-update-product-form/schema';
import FloatingFormActionsBar from '@/components/floating-form-actions-bar';
import SearchProductsPopover from '@/components/search-products-popover';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger as ShadCNAccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Circle from '@/components/ui/circle';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FormikInput, Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FormikSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Spinner from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import routes from '@/config/routes';
import {
  productTaxPercentOptions,
  productTypeOptions,
} from '@/constants/product';
import { BeforeUnloadComponent } from '@/hooks/useBeforeUnload';
import {
  cn,
  formatCount,
  getApiErrorMessage,
  slugifyString,
} from '@/lib/utils';
import { ApiResponseSuccessBase } from '@/types/api-responses';
import {
  Product,
  ProductTaxPercentEnum,
  ProductTypeEnum,
} from '@/types/api-responses/product';
import {
  ProductAttributeTerm,
  ProductVariation,
} from '@/types/api-responses/product-attribute';
import { ProductCategory } from '@/types/api-responses/product-category';
import { Optionalize } from '@/types/utils';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useHotkeys, useOs } from '@mantine/hooks';
import { AccordionTrigger } from '@radix-ui/react-accordion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ErrorMessage, Formik, useFormikContext } from 'formik';
import {
  ChevronDownIcon,
  ChevronLeft,
  GripVertical,
  OctagonAlert,
  RefreshCcw,
  Trash2,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

const RichTextEditor = dynamic(
  () => import('@/components/ui/rich-text-editor'),
  { ssr: false }
);

const CreateOrUpdateProductForm = ({
  productId,
}: CreateOrUpdateProductFormProps) => {
  const router = useRouter();

  const os = useOs();

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();

  const productQueryFn = getProductByIdQueryOptions({ id: productId! });
  const productQuery = useQuery({
    ...productQueryFn,
    gcTime: 0,
    retry: false,
  });

  const productCategoriesRecursivelyQuery = useQuery({
    ...getProductCategoriesRecursivelyQueryOptions(),
  });

  const categoryOptions = productCategoriesRecursivelyQuery.data?.data || [];

  useEffect(() => {
    if (productQuery.isError) {
      toast.error(getApiErrorMessage(productQuery.error), {
        id: 'productQueryError',
      });
      // onApiError && onApiError();
    }
  }, [productQuery.error, productQuery.isError]);

  const productData = productQuery.data?.data;

  const initialValues: Optionalize<
    SimpleProductSchema & VariableProductSchema
  > = productData
    ? {
        ...productData,
        faqs: productData.faqs || [],
        specs: productData.specs || [],
        regularPrice: productData.regularPrice ?? '',
        salePrice: productData.salePrice ?? '',
        type: productData.type as any,
        stock: productData.stock ?? '',
        lowStockThreshold: productData.lowStockThreshold ?? '',
        description: productData.description || '',
        longDescription: productData.longDescription || '',
        attributeTermIds: productData.attributeTerms?.map((term) => term.id),
        categoryIds: productData.categories.map((category) => category.id),
        taxPercent: productData.taxPercent as ProductTaxPercentEnum,
      }
    : {
        attributes: [],
        attributeTermIds: [],
        description: '',
        images: [],
        faqs: [],
        specs: [],
        name: '',
        regularPrice: '',
        salePrice: '',
        slug: '',
        stock: '',
        lowStockThreshold: '',
        type: '',
        categoryIds: [],
        longDescription: '',
        taxPercent: '',
      };

  const createProductMutation = useMutation({
    ...getCreateProductMutationOptions(),
    onSuccess(data) {
      toast.success(`Product "${data.data.data.name}" created successfully`);

      if (data.data.data.type === ProductTypeEnum.variable) {
        setTimeout(() => {
          router.push(routes.editProduct(data.data.data.id));
        }, 100);
      }
    },
  });

  const updateProductMutation = useMutation({
    ...getUpdateProductMutationOptions(),
    onSuccess() {
      toast.success('Product updated successfully');
      // onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to update product'));
      // onApiError && onApiError();
    },
  });
  const toggleProductShowOnBestSellerSectionMutation = useMutation({
    ...getToggleProductShowOnBestSellerSectionMutationOptions(),
    onSuccess() {
      toast.success(
        productData?.showOnBestSellerSection
          ? 'The product has been removed from the best seller section'
          : 'The product has been added to the best seller section'
      );
      queryClient.setQueryData(
        productQueryFn.queryKey,
        (
          product: ApiResponseSuccessBase<Product>
        ): ApiResponseSuccessBase<Product> => {
          return {
            ...product,
            data: {
              ...product.data,
              showOnBestSellerSection: !productData?.showOnBestSellerSection,
            },
          };
        }
      );
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to update product'));
    },
  });
  const toggleProductShowOnCartRecommendationSectionMutation = useMutation({
    ...getToggleProductShowOnCartRecommendationSectionMutationOptions(),
    onSuccess() {
      toast.success(
        productData?.showOnCartRecommendationSection
          ? 'The product has been removed from the cart recommendation section'
          : 'The product has been added to the cart recommendation section'
      );
      queryClient.setQueryData(
        productQueryFn.queryKey,
        (
          product: ApiResponseSuccessBase<Product>
        ): ApiResponseSuccessBase<Product> => {
          return {
            ...product,
            data: {
              ...product.data,
              showOnCartRecommendationSection:
                !productData?.showOnCartRecommendationSection,
            },
          };
        }
      );
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to update product'));
    },
  });

  const toggleLinkedProductMutation = useMutation({
    ...getToggleLinkedProductMutationOptions(),
    onSuccess(data) {
      if (data.data.data.removed) {
        toast.success('Linked product removed');
      } else {
        toast.success('Product linked successfully');
      }
      productQuery.refetch();
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to update product'));
    },
  });

  const checkProductSlugAvailabilityMutation = useMutation({
    ...getCheckProductSlugAvailabilityMutationOptions(),
  });

  const uploadFilesMutation = useMutation({
    ...getUploadFilesMutationOptions(),
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to upload images. Please try again')
      );
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImageFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (!productQuery.data && !!productId) {
    return <ApiStatusIndicator noData={false} query={productQuery} />;
  }

  const linkedProducts = productData?.linkedProducts || [];

  return (
    <Formik
      initialValues={initialValues}
      validate={async (values) => {
        const errors: Record<string, string> = {};

        const schema =
          values.type === ProductTypeEnum.simple
            ? createSimpleProductSchema
            : values.type === ProductTypeEnum.variable
            ? createVariableProductSchema
            : createProductBaseSchema;

        const result = schema.safeParse(values);

        if (!result.success) {
          result.error.errors.forEach((error) => {
            errors[error.path[0]] = error.message;
          });
        }

        return errors;
      }}
      onSubmit={async (values, actions) => {
        try {
          const formValues = values;
          if (imageFiles.length <= 0 && (values.images || []).length <= 0) {
            actions.setFieldError('images', 'Image is required');
            return;
          }

          if (imageFiles.length > 0) {
            const data = new FormData();

            imageFiles.forEach((file) => {
              data.append('files', file);
            });

            await uploadFilesMutation
              .mutateAsync({
                data,
              })
              .then((res) => {
                const imgUrls = res.data.data.map((img) => img.location);
                formValues.images = [...(values.images || []), ...imgUrls];
                setImageFiles([]);
                actions.setFieldValue('images', imgUrls);
              });
          }

          if (productId) {
            await updateProductMutation.mutateAsync({
              data: {
                ...(values as any),
                salePrice: values.salePrice ?? '',
                stock: values.stock ?? '',
              },
              id: productId,
            });
            actions.resetForm({
              values: values,
            });
            productQuery.refetch();
            setImageFiles([]);
          } else {
            const res = await checkProductSlugAvailabilityMutation.mutateAsync({
              slug: values.slug!,
            });

            if (!res.data.data.available) {
              actions.setFieldError('slug', 'This slug is not available');
              return;
            }

            await createProductMutation.mutateAsync({
              ...(values as any),
              salePrice: values.salePrice ?? undefined,
              stock: values.stock ?? undefined,
            });
            actions.setSubmitting(false);
            actions.resetForm();
            setImageFiles([]);
          }
        } catch (error) {
          // toast.error(getApiErrorMessage(error));
        }
      }}
    >
      {({ submitForm, isSubmitting, values, dirty, setFieldValue }) => (
        <div className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8">
          {dirty && <FormHotKeys />}
          <FloatingFormActionsBar
            wrapper={{
              className: 'max-lg:hidden',
            }}
            saveButton={{
              loading: isSubmitting,
            }}
            discardButton={{ disabled: isSubmitting }}
          />
          <BeforeUnloadComponent enabled={dirty || imageFiles.length > 0} />
          <div className="grid flex-1 gap-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={router.back}
                variant="outline"
                size="icon"
                className="size-7"
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">Back</span>
              </Button>

              <h1 className="flex-1 shrink-0 grow text-base font-semibold tracking-tight lg:text-xl">
                {!productId ? 'Create product' : values.name}
              </h1>
              <div className="hidden shrink-0 items-center gap-2 md:ml-auto md:flex">
                <Button
                  disabled={!dirty && !!productId && imageFiles.length <= 0}
                  loading={isSubmitting}
                  onClick={submitForm}
                  size="sm"
                >
                  {productId ? 'Update' : 'Create'} product{' '}
                  <span className="text-xs tracking-widest opacity-60">
                    {os === 'macos' ? '⌘' : 'ctrl'} S
                  </span>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:gap-8 xl:grid-cols-[auto_340px]">
              <div className="grid items-start gap-4 lg:gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Product details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <FormikInput
                        name="name"
                        type="text"
                        className="w-full"
                        label="Product name"
                      />
                      <FormikInput
                        name="slug"
                        type="text"
                        className="w-full pr-12"
                        label="Slug"
                      >
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size={'icon'}
                                variant={'secondary'}
                                className="group absolute right-1 top-1/2 aspect-square h-[calc(100%-8px)] w-auto -translate-y-1/2"
                                onClick={() => {
                                  setFieldValue(
                                    'slug',
                                    slugifyString(values.name || '')
                                  );
                                }}
                              >
                                <RefreshCcw className="size-3 duration-200 group-active:rotate-180" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Generate slug from title
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormikInput>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormikSelect
                          options={productTypeOptions}
                          name="type"
                          label="Product type"
                          placeholder="Select product type"
                        />
                        <FormikSelect
                          options={productTaxPercentOptions}
                          name="taxPercent"
                          label="Tax percent"
                          placeholder="Select tax percent"
                        />
                      </div>
                      {/* <FormikTextarea
                        rows={6}
                        name="description"
                        label="Description"
                      /> */}

                      <Label
                        htmlFor="description"
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

                      {values.type === ProductTypeEnum.simple && (
                        <>
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormikInput
                              type="number"
                              name="stock"
                              label="Stock"
                            />
                            <FormikInput
                              type="number"
                              name="lowStockThreshold"
                              label="Low stock threshold"
                              disabled={typeof values.stock !== 'number'}
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormikInput
                              type="number"
                              name="regularPrice"
                              label="Regular price"
                            />
                            <FormikInput
                              type="number"
                              name="salePrice"
                              label="Sale price"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <Label
                          htmlFor="longDescription"
                          className="mb-3 inline-block"
                        >
                          Long description
                        </Label>
                        <RichTextEditor
                          editor={{
                            id: 'longDescription',
                            value: values['longDescription'],
                            onEditorChange: (value) => {
                              setFieldValue('longDescription', value);
                            },
                          }}
                        />
                        <Separator className="my-5" />
                        <div className="space-y-3.5">
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            <AccordionItem value="faqs">
                              <ShadCNAccordionTrigger>
                                Faqs
                              </ShadCNAccordionTrigger>
                              <AccordionContent className="space-y-2.5">
                                {(values.faqs || [])?.length <= 0 ? (
                                  <p className="py-5 text-center text-sm text-muted-foreground">
                                    No faqs added.
                                  </p>
                                ) : (
                                  values.faqs?.map((faq) => (
                                    <div
                                      className="relative rounded-md border-l-4 border-foreground bg-muted/40 p-4"
                                      key={faq.id}
                                    >
                                      <Button
                                        onClick={() => {
                                          setFieldValue(
                                            'faqs',
                                            (values.faqs || []).filter(
                                              (faqItem) => faqItem.id !== faq.id
                                            )
                                          );
                                        }}
                                        size={'icon'}
                                        variant={'ghost'}
                                        className="absolute right-0.5 top-0.5 z-10 size-8"
                                      >
                                        <span className="sr-only">Close</span>
                                        <X className="size-3.5" />
                                      </Button>
                                      <div className="space-y-4">
                                        <Input
                                          className="w-full"
                                          value={faq.title}
                                          onChange={(e) => {
                                            setFieldValue(
                                              'faqs',
                                              (values.faqs || []).map(
                                                (faqItem) => {
                                                  if (faqItem.id === faq.id) {
                                                    return {
                                                      ...faqItem,
                                                      title: e.target.value,
                                                    };
                                                  }
                                                  return faqItem;
                                                }
                                              )
                                            );
                                          }}
                                          label="Title"
                                          placeholder="Enter title"
                                        />
                                        <Textarea
                                          className="w-full"
                                          value={faq.content}
                                          onChange={(e) => {
                                            setFieldValue(
                                              'faqs',
                                              (values.faqs || []).map(
                                                (faqItem) => {
                                                  if (faqItem.id === faq.id) {
                                                    return {
                                                      ...faqItem,
                                                      content: e.target.value,
                                                    };
                                                  }
                                                  return faqItem;
                                                }
                                              )
                                            );
                                          }}
                                          label="Content"
                                          placeholder="Enter content"
                                        />
                                      </div>
                                    </div>
                                  ))
                                )}

                                <div className="!mt-4 flex justify-end">
                                  <Button
                                    onClick={() => {
                                      setFieldValue('faqs', [
                                        ...(values.faqs || []),
                                        {
                                          id: uuid(),
                                          title: '',
                                          content: '',
                                        },
                                      ]);
                                    }}
                                  >
                                    Add new
                                  </Button>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>

                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            <AccordionItem value="specs">
                              <ShadCNAccordionTrigger>
                                Specs
                              </ShadCNAccordionTrigger>
                              <AccordionContent className="space-y-2.5">
                                {(values.specs || [])?.length <= 0 ? (
                                  <p className="py-5 text-center text-sm text-muted-foreground">
                                    No specs added.
                                  </p>
                                ) : (
                                  values.specs?.map((spec) => (
                                    <div
                                      className="relative rounded-md border-l-4 border-foreground bg-muted/40 p-4"
                                      key={spec.id}
                                    >
                                      <Button
                                        onClick={() => {
                                          setFieldValue(
                                            'specs',
                                            (values.specs || []).filter(
                                              (specItem) =>
                                                specItem.id !== spec.id
                                            )
                                          );
                                        }}
                                        size={'icon'}
                                        variant={'ghost'}
                                        className="absolute right-0.5 top-0.5 z-10 size-8"
                                      >
                                        <span className="sr-only">Close</span>
                                        <X className="size-3.5" />
                                      </Button>
                                      <div className="space-y-4">
                                        <Input
                                          className="w-full"
                                          value={spec.label}
                                          onChange={(e) => {
                                            setFieldValue(
                                              'specs',
                                              (values.specs || []).map(
                                                (specItem) => {
                                                  if (specItem.id === spec.id) {
                                                    return {
                                                      ...specItem,
                                                      label: e.target.value,
                                                    };
                                                  }
                                                  return specItem;
                                                }
                                              )
                                            );
                                          }}
                                          label="Label"
                                          placeholder="Enter label"
                                        />
                                        <Textarea
                                          className="w-full"
                                          value={spec.value}
                                          onChange={(e) => {
                                            setFieldValue(
                                              'specs',
                                              (values.specs || []).map(
                                                (specItem) => {
                                                  if (specItem.id === spec.id) {
                                                    return {
                                                      ...specItem,
                                                      value: e.target.value,
                                                    };
                                                  }
                                                  return specItem;
                                                }
                                              )
                                            );
                                          }}
                                          label="Value"
                                          placeholder="Enter value"
                                        />
                                      </div>
                                    </div>
                                  ))
                                )}

                                <div className="!mt-4 flex justify-end">
                                  <Button
                                    onClick={() => {
                                      setFieldValue('specs', [
                                        ...(values.specs || []),
                                        {
                                          id: uuid(),
                                          title: '',
                                          content: '',
                                        },
                                      ]);
                                    }}
                                  >
                                    Add new
                                  </Button>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {values.type === ProductTypeEnum.variable && (
                  <ProductAttributesAndTerms />
                )}

                {values.type === ProductTypeEnum.variable && productId && (
                  <ProductVariations productId={productId} />
                )}
              </div>

              <div className="space-y-4 lg:space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <input {...getInputProps()} />

                      <div className="grid grid-cols-3 gap-2 [&>div:first-child]:col-span-3">
                        {values.images?.map((image) => (
                          <div
                            key={image}
                            className="relative overflow-hidden rounded-md bg-muted"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image}
                              alt="Image"
                              className="aspect-square size-full object-cover"
                            />
                            <Button
                              size={'icon'}
                              className="absolute right-2 top-2 size-6 rounded-md"
                              variant={'destructive'}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFieldValue(
                                  'images',
                                  values.images?.filter((img) => img !== image)
                                );
                              }}
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                        {imageFiles.map((imageFile, i) => (
                          <div
                            key={imageFile.name}
                            className="relative overflow-hidden rounded-md bg-muted"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={URL.createObjectURL(imageFile)}
                              alt="Image"
                              className="aspect-square size-full object-cover"
                            />
                            <Button
                              size={'icon'}
                              className="absolute right-2 top-2 size-6 rounded-md"
                              variant={'destructive'}
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageFiles((prev) =>
                                  prev.filter((_, index) => index !== i)
                                );
                              }}
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        ))}

                        <div
                          {...getRootProps()}
                          className={cn(
                            'flex aspect-square cursor-pointer items-center justify-center rounded-md border border-dashed border-border',
                            isDragActive && 'border-foreground'
                          )}
                        >
                          <Upload
                            className={cn(
                              'size-8',
                              !isDragActive && 'opacity-60'
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <ErrorMessage name="images">
                      {(errorMessage) => (
                        <p className="mt-2 text-xs text-red-500">
                          {errorMessage}
                        </p>
                      )}
                    </ErrorMessage>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* <FormikSelect
                      name="categoryId"
                      options={categoryOptions}
                      placeholder="Select category"
                    /> */}
                    <div className="max-h-[300px] space-y-2 overflow-y-auto">
                      {categoryOptions.map((category) => (
                        <CategoryCheckbox
                          key={category.id}
                          category={category}
                        />
                      ))}
                    </div>

                    {/* {productData?.categoryId && values.categoryId && (
                      <Button
                        variant={'destructive'}
                        size={'sm'}
                        className="mt-3"
                        onClick={() => {
                          setFieldValue('categoryId', null);
                        }}
                      >
                        Remove
                      </Button>
                    )} */}
                  </CardContent>
                </Card>

                {!!productId && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Toggle product visibility</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Label className="flex cursor-pointer items-center justify-between">
                          <span>Show on best seller section</span>
                          <Switch
                            loading={
                              toggleProductShowOnBestSellerSectionMutation.isPending
                            }
                            checked={productData?.showOnBestSellerSection}
                            onCheckedChange={() => {
                              toggleProductShowOnBestSellerSectionMutation.mutate(
                                {
                                  id: productData?.id!,
                                }
                              );
                            }}
                          />
                        </Label>
                        <Separator className="my-2.5 w-full" />
                        <Label className="flex cursor-pointer items-center justify-between">
                          <span>Show on cart recommendation section</span>
                          <Switch
                            loading={
                              toggleProductShowOnCartRecommendationSectionMutation.isPending
                            }
                            checked={
                              productData?.showOnCartRecommendationSection
                            }
                            onCheckedChange={() => {
                              toggleProductShowOnCartRecommendationSectionMutation.mutate(
                                {
                                  id: productData?.id!,
                                }
                              );
                            }}
                          />
                        </Label>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Linked product</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SearchProductsPopover
                          onSelect={async (product) => {
                            const isLinked = linkedProducts.find(
                              (p) => p.id === product.id
                            );

                            if (isLinked) {
                              const confirmed = await confirm({
                                description:
                                  'You are going to unlink a product',
                              });
                              if (confirmed) {
                                toggleLinkedProductMutation.mutate({
                                  id: productData?.id!,
                                  linkedProductId: product.id,
                                });
                              }
                            } else {
                              toggleLinkedProductMutation.mutate({
                                id: productData?.id!,
                                linkedProductId: product.id,
                              });
                            }
                          }}
                        />

                        {linkedProducts.length > 0 ? (
                          <div className="mt-5 space-y-2 divide-y divide-border">
                            {linkedProducts.map((linkedProduct) => (
                              <Link
                                key={linkedProduct.id}
                                href={routes.editProduct(linkedProduct.id)}
                                className="flex items-center gap-3 pt-2 duration-200 first:pt-0 hover:opacity-80"
                              >
                                <Circle className="relative w-8 rounded-md bg-muted">
                                  <Image
                                    src={linkedProduct.images[0]}
                                    alt={linkedProduct.name}
                                    fill
                                    className="object-cover"
                                  />
                                </Circle>
                                <div>
                                  <p className="text-sm font-medium">
                                    {linkedProduct.name}
                                  </p>
                                </div>

                                <Button
                                  loading={
                                    toggleLinkedProductMutation.isPending
                                  }
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    if (
                                      await confirm({
                                        description:
                                          'You are going to unlink a product',
                                      })
                                    ) {
                                      toggleLinkedProductMutation.mutate({
                                        id: productData?.id!,
                                        linkedProductId: linkedProduct.id,
                                      });
                                    }
                                  }}
                                  className="ml-auto size-7"
                                  size={'icon'}
                                  variant={'secondary'}
                                >
                                  <X className="size-3" />
                                </Button>
                              </Link>
                            ))}
                          </div>
                        ) : toggleLinkedProductMutation.isPending ? (
                          <div className="flex items-center justify-center py-5">
                            <Spinner className="size-5" />
                          </div>
                        ) : (
                          <div className="py-5 text-center text-sm">
                            No linked products
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 left-0 z-50 flex w-full border-t border-muted bg-background py-3 md:hidden">
              <Button
                className="w-full"
                loading={isSubmitting}
                onClick={submitForm}
                disabled={!dirty && !!productId && imageFiles.length <= 0}
              >
                {productId ? 'Update' : 'Create'} product
              </Button>
            </div>
          </div>
        </div>
      )}
    </Formik>
  );
};

const CategoryCheckbox = ({ category }: { category: ProductCategory }) => {
  const { setFieldValue, values } = useFormikContext<
    SimpleProductSchema & VariableProductSchema
  >();

  return (
    <>
      <Label className="flex w-full cursor-pointer items-center gap-2 py-0.5 text-muted-foreground hover:text-foreground">
        <Checkbox
          checked={values['categoryIds'].includes(category.id)}
          onCheckedChange={(value) => {
            if (value === true) {
              setFieldValue('categoryIds', [
                ...values.categoryIds,
                category.id,
              ]);
            } else if (value === false) {
              setFieldValue(
                'categoryIds',
                (values.categoryIds || []).filter((id) => id !== category.id)
              );
            }
          }}
        />
        {category.name}
      </Label>

      {category.subCategories.length > 0 && (
        <div className="space-y-2 pl-3">
          {category.subCategories.map((subCategory) => (
            <CategoryCheckbox key={subCategory.id} category={subCategory} />
          ))}
        </div>
      )}
    </>
  );
};

export default CreateOrUpdateProductForm;

const FormHotKeys = () => {
  const { submitForm } = useFormikContext();

  useHotkeys([['mod+S', () => submitForm()]], []);

  return null;
};

const ProductAttributesAndTerms = () => {
  const [selectedAttributeId, setSelectedAttributeId] = useState<
    undefined | string
  >(undefined);

  const { setFieldValue, values } = useFormikContext<VariableProductSchema>();

  const productAttributesQuery = useQuery(getProductAttributesQueryOptions());

  const productAttributes = useMemo(
    () => productAttributesQuery.data?.data || [],
    [productAttributesQuery.data?.data]
  );

  const filteredProductAttributes = useMemo(
    () =>
      productAttributes.filter(
        (attribute) =>
          !values.attributes.find((attr) => attr.id === attribute.id)
      ),
    [productAttributes, values.attributes]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getItemIndex = (id: string | number | undefined) =>
    values.attributes?.findIndex((attribute) => attribute.id === id);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (active.id === over?.id) return;

    const originalPos = getItemIndex(active.id) as any;
    const newPos = getItemIndex(over?.id) as any;

    const newData = arrayMove(values.attributes, originalPos, newPos);
    setFieldValue('attributes', newData);
  };

  const attributes = values.attributes;
  return (
    <Card>
      <CardHeader className="flex-row justify-between space-y-0">
        <CardTitle>Attributes</CardTitle>

        <div className="flex items-center gap-2">
          <Select
            value={selectedAttributeId}
            onValueChange={setSelectedAttributeId}
          >
            <SelectTrigger className="min-w-[170px] gap-5">
              <SelectValue placeholder={'Select attribute'} />
            </SelectTrigger>
            <SelectContent>
              {filteredProductAttributes.length > 0 ? (
                filteredProductAttributes.map((attribute) => (
                  <SelectItem
                    onSelect={() => {
                      setSelectedAttributeId(attribute.id);
                    }}
                    value={attribute.id}
                    key={attribute.slug}
                  >
                    {attribute.name}
                  </SelectItem>
                ))
              ) : (
                <p className="px-5 py-3 text-center text-sm text-foreground/60">
                  No attributes to show :(
                </p>
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              if (selectedAttributeId) {
                const attribute = productAttributes.find(
                  (attribute) => attribute.id === selectedAttributeId
                );
                setFieldValue('attributes', [...values.attributes, attribute]);
                toast.info(`Attribute "${attribute?.name}" added`);
                setSelectedAttributeId('');
              }
            }}
            variant={'secondary'}
            disabled={!selectedAttributeId}
          >
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={attributes}
            strategy={verticalListSortingStrategy}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {attributes.length > 0 ? (
                attributes.map((attribute) => (
                  <AttributeAccordion
                    key={attribute.id}
                    attribute={attribute}
                  />
                ))
              ) : (
                <div className="py-5 text-center text-sm text-muted-foreground">
                  <p>No attributes added.</p>
                </div>
              )}
            </Accordion>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
};

const AttributeAccordion = ({
  attribute,
}: {
  attribute: { id: string; name: string };
}) => {
  const { setFieldValue, values } = useFormikContext<VariableProductSchema>();

  const attributeTermsQuery = useQuery(
    getProductAttributeTermsQueryOptions({ attributeId: attribute.id })
  );

  const terms = useMemo(
    () => attributeTermsQuery.data?.data || [],
    [attributeTermsQuery.data?.data]
  );

  const allTermsIds = useMemo(() => terms.map((term) => term.id), [terms]);

  const selectedTermIds = useMemo(
    () => values.attributeTermIds.filter((id) => allTermsIds.includes(id)),
    [allTermsIds, values.attributeTermIds]
  );

  const isAllSelected = useMemo(
    () => terms.every((term) => values.attributeTermIds.includes(term.id)),
    [terms, values.attributeTermIds]
  );

  const handleSelectAll = () => {
    const allTermsIds = terms.map((term) => term.id);

    const removeDuplicates = Array.from(
      new Set([...values.attributeTermIds, ...allTermsIds])
    );
    setFieldValue('attributeTermIds', removeDuplicates);
  };

  const handleDeSelectAll = () => {
    const allTermsIds = terms.map((term) => term.id);

    setFieldValue(
      'attributeTermIds',
      values.attributeTermIds.filter((id) => !allTermsIds.includes(id))
    );
  };

  const handleRemove = async () => {
    if (await confirm({})) {
      setFieldValue(
        'attributes',
        values.attributes.filter((attr) => attr.id !== attribute.id)
      );
      setFieldValue(
        'attributeTermIds',
        values.attributeTermIds.filter(
          (termId) => !selectedTermIds.includes(termId)
        )
      );
    }
  };

  const {
    attributes,
    listeners,
    // transition,
    setNodeRef,
    transform,
  } = useSortable({ id: attribute.id });

  const style = {
    // transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <AccordionItem ref={setNodeRef} style={style} value={attribute.id}>
      <div className="flex items-center justify-between gap-2 rounded-sm rounded-b-none border-b border-transparent p-1 pl-4 text-sm font-medium [&:has([data-state=open])]:border-border">
        <p className="flex w-full flex-row flex-nowrap items-center overflow-hidden">
          <span className="truncate">{attribute.name}</span>
          <span className="ml-2 shrink-0 text-xs font-normal opacity-50">
            {formatCount(selectedTermIds.length, '$ term$$ selected')}
          </span>
        </p>

        <Button
          onClick={handleRemove}
          size={'icon'}
          variant={'ghost'}
          className="ml-auto"
        >
          <Trash2 className="size-4" />
        </Button>
        <AccordionTrigger
          asChild
          className="data-[state=open]:border-border [&[data-state=open]>svg]:rotate-180"
        >
          <Button size={'icon'} variant={'ghost'}>
            <ChevronDownIcon className="size-4 transition-transform duration-200" />
          </Button>
        </AccordionTrigger>
        <Button
          {...attributes}
          {...listeners}
          className="cursor-grab"
          size={'icon'}
          variant={'ghost'}
          // disabled={disableSortButton}
        >
          <GripVertical className="size-4" />
        </Button>
      </div>
      <AccordionContent>
        <ApiStatusIndicator
          noData={terms.length <= 0}
          query={attributeTermsQuery}
          noDataContent="No terms to show"
        />
        {terms.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="font-medium">Select Terms:</p>

              <Button
                onClick={isAllSelected ? handleDeSelectAll : handleSelectAll}
                size={'sm'}
                variant={'outline'}
              >
                {isAllSelected ? 'Deselect' : 'Select'} all
              </Button>
            </div>

            <ToggleGroup
              onValueChange={(value) => {
                setFieldValue('attributeTermIds', value);
              }}
              value={values.attributeTermIds}
              type="multiple"
              className="mt-1"
            >
              {terms.map((term) => (
                <ToggleGroupItem key={term.id} value={term.id}>
                  {term.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <Separator className="mb-2.5 mt-3.5 w-full" />
            <div className="w-fit">
              <Label htmlFor="appearance" className="mb-2.5 inline-block">
                Appearance
              </Label>
              <Select
                value={(attribute as any).appearance || 'button'}
                onValueChange={(value) => {
                  const newValue = values.attributes.map((attr) => {
                    if (attr.id === attribute.id) {
                      return {
                        ...attr,
                        appearance: value,
                      };
                    }
                    return attr;
                  });
                  setFieldValue('attributes', newValue);
                }}
              >
                <SelectTrigger id="appearance" className="min-w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="button">Button</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

const ProductVariations = ({ productId }: { productId: string }) => {
  const productQuery = useQuery({
    ...getProductByIdQueryOptions({ id: productId! }),
    gcTime: 0,
    retry: false,
  });

  const createProductVariationsMutation = useMutation({
    ...getCreateProductVariationsMutationOptions(),
    onSuccess(data) {
      productQuery.refetch();
      toast.success(formatCount(data.data.data.total, '$ variation$$ added'));
    },
  });
  const productVariations = productQuery.data?.data.variations || [];

  const hasData = productVariations.length > 0;

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-5">
        <CardTitle>
          Variations{' '}
          {productQuery.isRefetching && (
            <Spinner className="ml-2 inline-block size-4" />
          )}
        </CardTitle>

        {hasData && (
          <div className="flex items-center gap-2">
            <Button
              variant={'secondary'}
              loading={createProductVariationsMutation.isPending}
              onClick={async () => {
                if (
                  await confirm({
                    title: 'Regenerate variations?',
                    description:
                      'Are you sure you want to regenerate all the variations?',
                  })
                ) {
                  createProductVariationsMutation.mutate({
                    productId,
                    regenerateVariations: true,
                  });
                }
              }}
            >
              Regenerate variations
            </Button>
            <AddNewVariation
              productId={productId}
              onCreate={() => {
                productQuery.refetch();
              }}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ApiStatusIndicator
          query={productQuery}
          noData={!hasData}
          noDataContent={
            <div className="space-y-3.5">
              <p className="text-lg font-medium opacity-80">
                No variations to show for this product.
              </p>
              <Button
                loading={createProductVariationsMutation.isPending}
                onClick={async () => {
                  if (
                    await confirm({
                      title: 'Are you sure you want to link all variations?',
                      description:
                        'This will create a new variation for each and every possible combination of variation attributes',
                    })
                  ) {
                    createProductVariationsMutation.mutate({ productId });
                  }
                }}
              >
                Create variations from all attributes
              </Button>
            </div>
          }
        />

        {hasData && (
          <>
            <Alert variant={'warning'} className="mb-5">
              <TriangleAlert className="size-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                Variations that do not have prices will not be shown in your
                store.
              </AlertDescription>
            </Alert>
            <Accordion type="single" collapsible className="space-y-4">
              {productVariations.map((variation) => {
                return (
                  <VariationAccordion
                    key={variation.id}
                    variation={variation}
                    productId={productId}
                    productVariations={productVariations}
                  />
                );
              })}
            </Accordion>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const AddNewVariation = ({
  productId,
  onCreate,
}: {
  productId: string;
  onCreate: () => void;
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTerms, setSelectedTerms] = useState<
    Record<
      string,
      {
        id: string;
        name: string;
      }
    >
  >({});

  const createProductVariationMutationOptions = useMutation({
    ...getCreateProductVariationMutationOptions(),
    onSuccess() {
      onCreate();
      toast.success(
        `Variation ${Object.values(selectedTerms)
          .map((item) => item.name)
          .join(' + ')} created`
      );
      setSelectedTerms({});
      setOpenDialog(false);
    },
  });

  const productQuery = useQuery({
    ...getProductByIdQueryOptions({ id: productId! }),
    gcTime: 0,
    retry: false,
  });
  const attributes = productQuery.data?.data.attributes || [];
  const attributeTerms = productQuery.data?.data.attributeTerms || [];

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button variant={'secondary'}>Add manually</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add new variation</DialogTitle>
        <div className="mt-3">
          <div className="grid grid-cols-3 gap-5">
            {attributes.map((attribute) => (
              <div key={attribute.id}>
                <Label htmlFor={attribute.id}>{attribute.name}</Label>
                <Select
                  value={
                    selectedTerms[attribute.id]
                      ? `${selectedTerms[attribute.id]?.id}__${
                          selectedTerms[attribute.id]?.name
                        }`
                      : undefined
                  }
                  onValueChange={(value) => {
                    const [id, name] = value.split('__');

                    setSelectedTerms((prev) => ({
                      ...prev,
                      [attribute.id]: {
                        id,
                        name,
                      },
                    }));
                  }}
                >
                  <SelectTrigger className="mt-1" id={attribute.id}>
                    <SelectValue placeholder={`Select ${attribute.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {attributeTerms
                      .filter(
                        (attributeTerm) =>
                          attributeTerm.productAttributeId === attribute.id
                      )
                      .map((attributeTerm) => (
                        <SelectItem
                          value={`${attributeTerm.id}__${attributeTerm.name}`}
                          key={attributeTerm.id}
                        >
                          {attributeTerm.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              loading={createProductVariationMutationOptions.isPending}
              onClick={() => {
                createProductVariationMutationOptions.mutate({
                  productId,
                  termIds: Object.values(selectedTerms).map((item) => item.id),
                });
              }}
            >
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const VariationAccordion = ({
  variation,
  productId,
  productVariations,
}: {
  variation: ProductVariation;
  productId: string;
  productVariations: ProductVariation[];
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const productData = queryClient.getQueryState<
    ApiResponseSuccessBase<Product>
  >(getProductByIdQueryOptions({ id: productId }).queryKey);

  const productTerms = useMemo(
    () => productData?.data?.data.attributeTerms || [],
    [productData?.data?.data.attributeTerms]
  );

  const findTerms = useCallback(
    (termIds: string[]) => {
      return productTerms.filter((term) => termIds.includes(term.id));
    },
    [productTerms]
  );

  const getVariationNameFromTerms = useCallback(
    (terms: ProductAttributeTerm[]) => {
      return terms.map((term) => term.name).join(' + ');
    },
    []
  );

  const variationName = useMemo(
    () => getVariationNameFromTerms(findTerms(variation.termIds)),
    [findTerms, getVariationNameFromTerms, variation.termIds]
  );

  const uploadFileMutation = useMutation({
    ...getUploadFileMutationOptions(),
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to upload image. Please try again')
      );
    },
  });

  const updateProductVariationMutation = useMutation({
    ...getUpdateProductVariationMutationOptions(),
    onSuccess() {
      toast.success(`Variation "${variationName}" updated successfully`);
    },
  });

  const deleteProductVariationMutation = useMutation({
    ...getDeleteProductVariationMutationOptions(),
    onSuccess() {
      toast.success(`Variation "${variationName}" deleted successfully`);
      queryClient.invalidateQueries({
        queryKey: getProductByIdQueryOptions({ id: productId }).queryKey.filter(
          Boolean
        ),
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImageFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleRemove = async () => {
    if (await confirm({})) {
      deleteProductVariationMutation.mutate({ id: variation.id });
    }
  };

  const initialValues: Optionalize<UpdateProductVariationSchema> = {
    regularPrice: variation.regularPrice ?? '',
    salePrice: variation.salePrice ?? '',
    stock: variation.stock ?? '',
    lowStockThreshold: variation.lowStockThreshold ?? '',
    image: variation.image || '',
    imageSameAsVariationId: variation.imageSameAsVariationId || '',
  };

  const imageSameAsVariations = useMemo(
    () =>
      productVariations.filter(
        (productVariation) => productVariation.id !== variation.id
      ),
    [productVariations, variation.id]
  );
  // console.log(variationName, { initialValues });
  return (
    <Formik
      initialValues={initialValues}
      validate={(values) => {
        const errors: Record<string, string> = {};

        const result = updateProductVariationSchema.safeParse(values);

        if (!result.success) {
          result.error.errors.forEach((error) => {
            errors[error.path[0]] = error.message;
          });
        }

        return errors;
      }}
      onSubmit={async (values, actions) => {
        const formValues = values;

        try {
          if (imageFile) {
            const data = new FormData();
            data.append('file', imageFile);

            await uploadFileMutation
              .mutateAsync({
                data,
              })
              .then((res) => {
                formValues.image = res.data.data?.location;
                actions.setFieldValue('image', res.data.data?.location);
              });
          }

          if (!formValues.regularPrice) return;

          await updateProductVariationMutation.mutateAsync({
            id: variation.id,
            data: {
              salePrice: formValues.salePrice ?? (null as any),
              regularPrice: formValues.regularPrice,
              image: formValues.image || (null as any),
              stock: formValues.stock ?? (null as any),
              lowStockThreshold: formValues.lowStockThreshold ?? (null as any),
              imageSameAsVariationId: formValues.imageSameAsVariationId,
            },
          });
          actions.resetForm({
            values: formValues,
          });
          setImageFile(null);
        } catch (error) {
          toast.error(getApiErrorMessage(error));
          actions.setSubmitting(false);
        }
      }}
    >
      {({
        handleSubmit,
        submitForm,
        dirty,
        isSubmitting,
        values,
        setFieldValue,
        errors,
      }) => (
        <AccordionItem
          value={variation.id}
          className="[&[data-state=closed]_#saveChangesHeaderButton]:!pointer-events-auto [&[data-state=closed]_#saveChangesHeaderButton]:!opacity-100"
        >
          {dirty && <FormHotKeys />}
          <div
            className={cn(
              'flex flex-1 items-center justify-between gap-2 rounded-sm rounded-b-none border-b border-transparent p-1 pl-4 text-sm font-medium [&:has([data-state=open])]:border-border'
            )}
          >
            <p className="line-clamp-1">{variationName}</p>
            {typeof values.stock === 'number' &&
              typeof values.lowStockThreshold === 'number' &&
              values.stock <= values.lowStockThreshold && (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger className="__fv rounded-full">
                      <OctagonAlert className="size-3 text-destructive" />
                    </TooltipTrigger>
                    <TooltipContent>
                      This variation running low on stock.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

            <span className="ml-auto" />
            {(dirty || !!imageFile) && (
              <div
                id="saveChangesHeaderButton"
                className="pointer-events-none opacity-0"
              >
                <Button
                  size={'sm'}
                  onClick={submitForm}
                  loading={isSubmitting}
                  disabled={!dirty && !imageFile}
                  variant={
                    Object.keys(errors).length > 0 ? 'destructive' : 'default'
                  }
                >
                  Save changes
                </Button>
              </div>
            )}
            <Button
              onClick={handleRemove}
              size={'icon'}
              variant={'ghost'}
              loading={deleteProductVariationMutation.isPending}
            >
              <Trash2 className="size-4" />
            </Button>
            <AccordionTrigger
              asChild
              className="data-[state=open]:border-border [&[data-state=open]>svg]:rotate-180"
            >
              <Button size={'icon'} variant={'ghost'}>
                <ChevronDownIcon className="size-4 transition-transform duration-200" />
              </Button>
            </AccordionTrigger>
            <BeforeUnloadComponent enabled={dirty || !!imageFile} />
          </div>
          <AccordionContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-start justify-start gap-3">
                <div {...getRootProps()} className="w-fit shrink-0">
                  <input {...getInputProps()} />
                  {imageFile ? (
                    <div>
                      <div className="relative aspect-square w-28 cursor-pointer overflow-hidden bg-muted">
                        <Button
                          size={'icon'}
                          className="absolute right-2 top-2 size-6 rounded-md"
                          variant={'destructive'}
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFile(null);
                          }}
                        >
                          <X className="size-3.5" />
                        </Button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="Image"
                          className="size-full object-cover"
                        />
                      </div>
                    </div>
                  ) : values.image ? (
                    <div>
                      <div className="relative aspect-square w-28 cursor-pointer overflow-hidden bg-muted">
                        <Button
                          size={'icon'}
                          className="absolute right-2 top-2 size-6 rounded-md"
                          variant={'destructive'}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (
                              await confirm({
                                description:
                                  'You want to remove the image from this variation',
                              })
                            ) {
                              setFieldValue('image', '');
                            }
                          }}
                        >
                          <X className="size-3.5" />
                        </Button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={values.image}
                          alt="Image"
                          className="size-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'flex size-28 cursor-pointer items-center justify-center rounded-md border border-dashed border-border',
                        isDragActive && 'border-foreground'
                      )}
                    >
                      <Upload
                        className={cn('size-8', !isDragActive && 'opacity-60')}
                      />
                    </div>
                  )}
                </div>

                <Select
                  value={values.imageSameAsVariationId}
                  onValueChange={(value) => {
                    setFieldValue(
                      'imageSameAsVariationId',
                      value === 'remove' ? '' : value
                    );
                  }}
                >
                  <SelectTrigger className="w-auto min-w-[180px] [&>span]:pr-1">
                    <SelectValue placeholder="Image same as" />
                  </SelectTrigger>
                  <SelectContent>
                    {values.imageSameAsVariationId && (
                      <SelectItem
                        value="remove"
                        className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                      >
                        Remove
                      </SelectItem>
                    )}
                    {imageSameAsVariations.map((productVariation) => (
                      <SelectItem
                        key={productVariation.id}
                        value={productVariation.id}
                      >
                        {getVariationNameFromTerms(
                          findTerms(productVariation.termIds)
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <FormikInput
                  label="Regular price"
                  name="regularPrice"
                  type="number"
                />
                <FormikInput
                  label="Sale price"
                  name="salePrice"
                  type="number"
                />
                <FormikInput label="Stock" name="stock" type="number" />
                <FormikInput
                  label="Low stock threshold"
                  name="lowStockThreshold"
                  type="number"
                  disabled={typeof values.stock !== 'number'}
                />
              </div>

              <Button
                loading={isSubmitting}
                disabled={!dirty && !imageFile}
                type="submit"
              >
                Save changes
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>
      )}
    </Formik>
  );
};
