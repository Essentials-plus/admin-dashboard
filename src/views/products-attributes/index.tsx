import { getDeleteProductAttributeMutationOptions } from '@/api-clients/admin-api-client/mutations';
import { getProductAttributesQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { confirm } from '@/components/confirm';
import CreateOrUpdateProductAttributeForm from '@/components/create-or-update-product-attribute-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import routes from '@/config/routes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

const ProductsAttributes = () => {
  const [editProductAttributeId, setEditProductAttributeId] = useState<
    undefined | string
  >(undefined);

  const productAttributesQuery = useQuery({
    ...getProductAttributesQueryOptions(),
  });

  const deleteProductAttributeMutation = useMutation({
    ...getDeleteProductAttributeMutationOptions(),
  });

  return (
    <section>
      <h1 className="text-2xl font-bold">Attributes</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[35%_auto]">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add new attribute</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateOrUpdateProductAttributeForm
                onCreateOrUpdate={() => {
                  productAttributesQuery.refetch();
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>All attributes</CardTitle>
              <CardDescription>
                Manage your product attributes from here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Terms</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productAttributesQuery.data?.data.map((attribute) => (
                    <TableRow
                      key={attribute.id}
                      onDoubleClick={() => {
                        setEditProductAttributeId(attribute.id);
                      }}
                    >
                      <TableCell>{attribute.name}</TableCell>
                      <TableCell>{attribute.slug}</TableCell>
                      <TableCell>
                        <div className="line-clamp-1 max-w-[200px] lg:max-w-[300px]">
                          {attribute.terms.length > 0
                            ? attribute.terms
                                .map((term) => term.name)
                                .join(', ')
                            : '-'}
                        </div>
                        <div>
                          <Link
                            href={routes.productAttributeTerms(attribute.id)}
                            className="__fv text-xs text-primary hover:underline"
                          >
                            Configure terms
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditProductAttributeId(attribute.id);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={
                                deleteProductAttributeMutation.isPending
                              }
                              onClick={async () => {
                                if (await confirm({})) {
                                  toast.promise(
                                    deleteProductAttributeMutation.mutateAsync({
                                      id: attribute.id,
                                    }),
                                    {
                                      loading: `Deleting product attribute "${attribute.name}"`,
                                      success(data) {
                                        productAttributesQuery.refetch();
                                        return `Product attribute "${data.data.data.name}" deleted.`;
                                      },
                                    }
                                  );
                                }
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={routes.productAttributeTerms(
                                  attribute.id
                                )}
                              >
                                Configure terms
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Dialog
                open={!!editProductAttributeId}
                onOpenChange={(value) => {
                  if (value === false) {
                    setEditProductAttributeId(undefined);
                  }
                }}
              >
                <DialogTrigger asChild></DialogTrigger>
                <DialogContent className="max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit attribute</DialogTitle>
                  </DialogHeader>
                  <CreateOrUpdateProductAttributeForm
                    attributeId={editProductAttributeId}
                    onCreateOrUpdate={() => {
                      productAttributesQuery.refetch();
                      setEditProductAttributeId(undefined);
                    }}
                  />
                </DialogContent>
              </Dialog>

              <ApiStatusIndicator
                noData={
                  !!productAttributesQuery.data &&
                  productAttributesQuery.data.data?.length <= 0
                }
                query={productAttributesQuery}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProductsAttributes;
