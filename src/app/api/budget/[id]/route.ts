import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const item = await prisma.budgetItem.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        amount: body.amount,
        currency: body.currency,
        paid: body.paid,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to update budget item:", error);
    return NextResponse.json({ error: "Failed to update budget item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.budgetItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete budget item:", error);
    return NextResponse.json({ error: "Failed to delete budget item" }, { status: 500 });
  }
}
