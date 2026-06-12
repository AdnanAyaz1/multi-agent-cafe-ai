import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, business, competitors, plan } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!business?.name || !business?.city) {
      return NextResponse.json(
        { error: "Business name and city are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: plan || "free",
        status: "active",
      },
    });

    await prisma.business.create({
      data: {
        userId: user.id,
        name: business.name,
        type: business.type || "cafe",
        city: business.city,
        timezone: business.timezone || "UTC",
        config: {
          competitorUrls: competitors?.filter((url: string) => url?.trim()) || [],
        },
      },
    });

    return NextResponse.json(
      { message: "Account created", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
