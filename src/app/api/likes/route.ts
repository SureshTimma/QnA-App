import prisma from "@/utils/connectPrisma";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (req: NextRequest) => {
  const { answerId } = await req.json();
  const response = await prisma.answers.update({
    where: {
      id: answerId,
    },
    data: {
      likes: {
        increment: 1,
      },
    },
  });
  console.log(response);
};
