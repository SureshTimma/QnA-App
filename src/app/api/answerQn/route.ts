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

  const answerResponse = await prisma.answers.create({
    data: {
      questionId,
      answer,
      userId: session.user.id,
    },
  });
  return NextResponse.json({
    message: "Answering question",
    response: answerResponse,
  });
};

export const GET = async (req: NextRequest) => {
    const answers = await prisma.answers.findMany();

  return NextResponse.json({ answers });
}
