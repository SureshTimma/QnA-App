import prisma from "@/utils/connectPrisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export const POST = async (req: NextRequest) => {
  const { title, desc } = await req.json();
  const session = await getServerSession(authOptions);
  console.log(title, desc);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await prisma.questions.create({
    data: {
      title: title,
      desc: desc,
      userId: session.user.id,
    },
  });
  return NextResponse.json(
    { message: "qns posting", data: response },
    { status: 200 }
  );
};
