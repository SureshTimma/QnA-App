import prisma from "@/utils/connectPrisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { questionId, answer } = await req.json();
  console.log("Session:", session);
  console.log("Received data:", { questionId, answer });

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const answerResponse = await prisma.answers.create({
      data: {
        questionId,
        answer,
        userId: session.user.id,
        likes: BigInt(0), // Initialize likes to 0
      },
    });

    // Convert BigInt to number for JSON serialization
    const serializedResponse = {
      ...answerResponse,
      likes: Number(answerResponse.likes),
    };

    return NextResponse.json({
      message: "Answer submitted successfully",
      response: serializedResponse,
    });
  } catch (error) {
    console.error("Error creating answer:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    );
  }
};

export const GET = async (req: NextRequest) => {
  try {
    const answers = await prisma.answers.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    // Convert BigInt to number for JSON serialization
    const serializedAnswers = answers.map((answer) => ({
      ...answer,
      likes: Number(answer.likes),
    }));

    return NextResponse.json({ answers: serializedAnswers });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json(
      { error: "Failed to fetch answers" },
      { status: 500 }
    );
  }
};
