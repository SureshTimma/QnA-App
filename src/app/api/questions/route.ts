import prisma from "@/utils/connectPrisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export const POST = async (req: NextRequest) => {
  const { title, desc, topics } = await req.json();
  const session = await getServerSession(authOptions);
  console.log(title, desc, topics);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await prisma.questions.create({
    data: {
      title: title,
      desc: desc,
      topics: topics || [],
      userId: session.user.id,
    },
  });
  return NextResponse.json(
    { message: "Question posted successfully", data: response },
    { status: 200 }
  );
};

export const GET = async (req: NextRequest) => {
  try {
    const questions = await prisma.questions.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json(
      { message: "Get all questions", questions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
};
