import envs from '@/config/envs';
import { mealTypeOptions } from '@/constants/meal';
import {
  appDefaultDateFormatter,
  getProductTaxAmount,
  sortMealsByMealType,
  sumOf,
} from '@/lib/utils';
import type { MealOrder } from '@/types/api-responses/meal-orders';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface GenerateMealOrderPDFOptions {
  order: MealOrder;
  returnBlob?: boolean; // If true, returns PDF as Blob instead of downloading
}

/**
 * Generate a PDF invoice for a meal order
 * @param options - Configuration options
 * @returns PDF Blob if returnBlob is true, otherwise downloads the file
 */
export async function generateMealOrderPDF(
  options: GenerateMealOrderPDFOptions
): Promise<Blob | void> {
  const { order, returnBlob = false } = options;

  // Calculate totals
  const totalAmount = order.totalAmount || 0;
  const shippingAmount = order.shippingAmount || 0;

  const tax9Percent = getProductTaxAmount({
    productPrice: totalAmount,
    taxPercent: 'TAX9',
  });

  const shippingAmountTax = getProductTaxAmount({
    productPrice: shippingAmount,
    taxPercent: 'TAX21',
  }).toFixed(2);

  // Generate filename
  const clientName = [order.plan?.user.name, order.plan?.user.surname]
    .filter(Boolean)
    .join('_')
    .replace(/\s+/g, '_');
  const identifier = clientName || `order_${order.id}`;
  const fileName = `Invoice_${identifier}_Week${order.week}.pdf`.replace(
    /[^a-zA-Z0-9_.-]/g,
    '_'
  );

  // Initialize PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let yPos = 20;

  // Helper function for adding new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // ==================== HEADER ====================
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('MEAL ORDER INVOICE', margin, yPos);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #${order.id}`, pageWidth - margin, yPos, {
    align: 'right',
  });
  yPos += 10;

  doc.setFontSize(9);
  doc.text(
    `Date: ${appDefaultDateFormatter(order.createdAt)}`,
    pageWidth - margin,
    yPos,
    { align: 'right' }
  );
  doc.text(`Week: ${order.week}`, pageWidth - margin, yPos + 5, {
    align: 'right',
  });
  doc.text(`Status: ${order.status}`, pageWidth - margin, yPos + 10, {
    align: 'right',
  });
  yPos += 20;

  // ==================== CUSTOMER INFO ====================
  checkPageBreak(30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information', margin, yPos);
  yPos += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const customerInfo = [
    `Name: ${order.plan?.user.name || ''} ${order.plan?.user.surname || ''}`,
    `Email: ${order.plan?.user.email || '-'}`,
    `Phone: ${order.plan?.user.mobile || '-'}`,
  ];
  customerInfo.forEach((line) => {
    doc.text(line, margin, yPos);
    yPos += 5;
  });
  yPos += 5;

  // ==================== SHIPPING INFO ====================
  checkPageBreak(35);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Shipping Address', margin, yPos);
  yPos += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const shippingInfo = [
    `Address: ${order.plan?.user.address || '-'}`,
    `House Nr: ${order.plan?.user.nr || '-'}`,
    `Addition: ${order.plan?.user.addition || '-'}`,
    `City: ${order.plan?.user.city || '-'}`,
    `Zipcode: ${order.plan?.user.zipCode?.zipCode || '-'}`,
  ];
  shippingInfo.forEach((line) => {
    doc.text(line, margin, yPos);
    yPos += 5;
  });
  yPos += 10;

  // ==================== MEALS SECTION ====================
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Meal Plan Details', margin, yPos);
  yPos += 8;

  // Process each day
  for (const day of order.mealsForTheWeek) {
    checkPageBreak(50);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Day ${day.day}`, margin, yPos);
    yPos += 5;

    const sortedMeals = sortMealsByMealType(day.meals);

    // Create meal rows
    sortedMeals.forEach((meal, index) => {
      const mealType =
        mealTypeOptions.find((opt) => opt.value === meal.meal)?.label ||
        meal.meal ||
        '-';

      // Calculate ingredients text
      const sumOfKCal = sumOf(meal.ingredients, 'kcal');
      const totalNeededServings = Math.round(meal.kCalNeed / sumOfKCal);

      const ingredientsList = meal.ingredients
        .map((ing) => {
          const qty =
            typeof ing.quantity === 'number'
              ? ing.quantity * totalNeededServings
              : 0;
          return `${qty} ${ing.unit} ${ing.name}`;
        })
        .join(', ');

      // Meal details table
      autoTable(doc, {
        startY: yPos,
        head: [
          [
            {
              content: `${index + 1}. ${meal.mealName}`,
              colSpan: 2,
              styles: { halign: 'left' as const },
            },
          ],
        ],
        body: [
          ['Meal Number', meal.mealNumber || '-'],
          ['Type', mealType],
          ['Ingredients', ingredientsList],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [49, 119, 115],
          fontSize: 10,
          fontStyle: 'bold' as const,
        },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 35, fontStyle: 'bold' as const },
          1: { cellWidth: pageWidth - margin * 2 - 35 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = (doc as any).lastAutoTable.finalY + 3;
    });

    yPos += 5;
  }

  // ==================== FINANCIAL SUMMARY ====================
  checkPageBreak(60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary', margin, yPos);
  yPos += 8;

  const subtotal = totalAmount - (shippingAmount + tax9Percent);
  const financialData = [
    ['Subtotal (excl. BTW)', `${envs.CURRENCY_SYMBOL}${subtotal.toFixed(2)}`],
    ['BTW (9%)', `${envs.CURRENCY_SYMBOL}${tax9Percent.toFixed(2)}`],
    [
      'Shipping (21% BTW included)',
      `${envs.CURRENCY_SYMBOL}${shippingAmount.toFixed(2)}`,
    ],
    [
      {
        content: 'Total Amount',
        styles: { fontStyle: 'bold' as const, fontSize: 11 },
      },
      {
        content: `${envs.CURRENCY_SYMBOL}${totalAmount.toFixed(2)}`,
        styles: { fontStyle: 'bold' as const, fontSize: 11 },
      },
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    body: financialData,
    theme: 'striped',
    columnStyles: {
      0: { cellWidth: pageWidth - margin * 2 - 50, halign: 'right' },
      1: { cellWidth: 50, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ==================== FOOTER ====================
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Last updated: ${appDefaultDateFormatter(order.updatedAt)}`,
      margin,
      pageHeight - 14
    );
    doc.text(
      `Generated on ${appDefaultDateFormatter(new Date())} - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Return blob or save file
  if (returnBlob) {
    return doc.output('blob');
  } else {
    doc.save(fileName);
  }
}
