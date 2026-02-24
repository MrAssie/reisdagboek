import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const day = await prisma.day.update({
      where: { id },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        title: body.title,
        notes: body.notes,
      },
    });
    return NextResponse.json(day);
  } catch (error) {
    console.error("Failed to update day:", error);
    return NextResponse.json({ error: "Failed to update day" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.day.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete day:", error);
    return NextResponse.json({ error: "Failed to delete day" }, { status: 500 });
  }
}
