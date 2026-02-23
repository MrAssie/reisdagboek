import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const tripId = request.nextUrl.searchParams.get("tripId");

    const where = tripId ? { tripId } : {};

    const [budgetItems, trips] = await Promise.all([
      prisma.budgetItem.findMany({ where, orderBy: { createdAt: "desc" } }),
      prisma.trip.findMany({
        where: tripId ? { id: tripId } : {},
        select: { totalBudget: true },
      }),
    ]);

    const totalBudget = trips.reduce((sum, t) => sum + t.totalBudget, 0);
    const totalSpent = budgetItems
      .filter((item) => item.paid)
      .reduce((sum, item) => sum + item.amount, 0);

    const categoryMap = new Map<string, number>();
    for (const item of budgetItems) {
      const current = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, current + item.amount);
    }

    const categories = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));

    return NextResponse.json({
      totalBudget,
      totalSpent,
      categories,
      items: budgetItems,
    });
  } catch (error) {
    console.error("Failed to fetch budget:", error);
    return NextResponse.json({ error: "Failed to fetch budget" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const item = await prisma.budgetItem.create({
      data: {
        name: body.name,
        category: body.category,
        amount: body.amount,
        currency: body.currency || "EUR",
        paid: body.paid || false,
        tripId: body.tripId,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to create budget item:", error);
    return NextResponse.json({ error: "Failed to create budget item" }, { status: 500 });
  }
}
