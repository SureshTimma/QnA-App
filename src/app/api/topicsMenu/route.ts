import prisma from "@/utils/connectPrisma"
import { NextResponse } from "next/server"

export const GET = async ()=>{
    const topics = await prisma.topics.findMany()
    return NextResponse.json(topics)
}