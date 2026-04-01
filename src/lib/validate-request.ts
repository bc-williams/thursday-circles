import { NextResponse } from "next/server";
import { z } from "zod";

export async function validateRequest<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: NextResponse }
> {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return {
        success: false,
        response: NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Invalid request body." },
          { status: 400 }
        ),
      };
    }

    return {
      success: true,
      data: parsed.data,
    };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      ),
    };
  }
}