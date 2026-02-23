import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        day: { select: { date: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(activities);
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const dayActivities = await prisma.activity.count({
      where: { dayId: body.dayId },
    });

    const activity = await prisma.activity.create({
      data: {
        name: body.name,
        description: body.description || null,
        location: body.location || null,
        address: body.address || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        placeId: body.placeId || null,
        startTime: body.startTime || null,
        endTime: body.endTime || null,
        category: body.category || "sightseeing",
        cost: body.cost || 0,
        currency: body.currency || "EUR",
        photoUrl: body.photoUrl || null,
        rating: body.rating || null,
        dayId: body.dayId,
        order: body.order ?? dayActivities,
      },
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
