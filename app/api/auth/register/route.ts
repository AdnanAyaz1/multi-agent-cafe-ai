import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db";
import { DEFAULT_MENU_ITEMS } from "@/lib/menu/defaults";

const MENUS_DIR =
  process.env.MENU_JSON_DIR ?? path.join(process.cwd(), "data", "menus");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, business, competitors } = body;

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

    const createdBusiness = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      await tx.subscription.create({
        data: {
          userId: user.id,
          plan: "free",
          status: "active",
        },
      });

      return tx.business.create({
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
    });

    try {
      await fs.mkdir(MENUS_DIR, { recursive: true });
      await fs.writeFile(
        path.join(MENUS_DIR, `${createdBusiness.id}.json`),
        JSON.stringify(DEFAULT_MENU_ITEMS, null, 2),
        "utf-8"
      );
    } catch {
      // File write may fail on serverless (read-only fs) — not critical
    }

    return NextResponse.json(
      { message: "Account created" },
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
