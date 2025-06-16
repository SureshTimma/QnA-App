import prisma from "@/utils/connectPrisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export const PUT = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    const { answerId } = await req.json();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has already liked this answer
    const existingLike = await prisma.likes.findUnique({
      where: {
        userId_answerId: {
          userId: session.user.id,
          answerId: answerId,
        },
      },
    });

    if (existingLike) {
      // User has already liked this answer, remove the like (unlike)
      await prisma.likes.delete({
        where: {
          id: existingLike.id,
        },
      });

      // Decrement the likes count
      const response = await prisma.answers.update({
        where: {
          id: answerId,
        },
        data: {
          likes: {
            decrement: BigInt(1),
          },
        },
      });

      return NextResponse.json({
        message: "Like removed successfully",
        likes: Number(response.likes),
        isLiked: false,
      });
    } else {
      // User hasn't liked this answer, add the like
      await prisma.likes.create({
        data: {
          userId: session.user.id,
          answerId: answerId,
        },
      });

      // Increment the likes count
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
        isLiked: true,
      });
    }
  } catch (error) {
    console.error("Error updating likes:", error);
    return NextResponse.json(
      { error: "Failed to update likes" },
      { status: 500 }
    );
  }
};
