import prisma from "@/utils/connectPrisma";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (req: NextRequest) => {
  try {
    const { answerId } = await req.json();

    const response = await prisma.answers.update({
      where: {
        id: answerId,
      },
      data: {
        likes: {
          increment: BigInt(1),
        },
      },
    });

    return NextResponse.json({
      message: "Like added successfully",
      likes: Number(response.likes),
    });
  } catch (error) {
    console.error("Error updating likes:", error);
    return NextResponse.json(
      { error: "Failed to update likes" },
      { status: 500 }
    );
  }
};
