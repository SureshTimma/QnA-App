import prisma from "@/utils/connectPrisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const existingUser = await prisma.users.findFirst({
    where: { email: body.email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "User with this email already exists" },
      { status: 400 }
    );
  }

  const newUser = await prisma.users.create({
    data: {
      username: body.username,
      email: body.email,
      password: body.password,
    },
  });

  return NextResponse.json({
    success: true,
    newUser,
    message: "Signup successful! You can now sign in.",
  });
};
