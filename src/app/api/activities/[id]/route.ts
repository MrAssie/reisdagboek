import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        location: body.location,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        placeId: body.placeId,
        startTime: body.startTime,
        endTime: body.endTime,
        category: body.category,
        cost: body.cost,
        currency: body.currency,
        photoUrl: body.photoUrl,
        rating: body.rating,
        order: body.order,
        dayId: body.dayId,
      },
    });
    return NextResponse.json(activity);
  } catch (error) {
    console.error("Failed to update activity:", error);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.activity.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete activity:", error);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
