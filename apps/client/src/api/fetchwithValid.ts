import { z } from 'zod';

export async function fetchWithValidation<T, TArgs extends []>(
  apiFn: (...args: TArgs) => Promise<T>,
  schema: z.ZodSchema<T>,
  ...args: TArgs
): Promise<T> {
  try {
    const raw = await apiFn(...args);
    
    if (!raw) {
      throw new Error("Data not found");
    }
    
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      console.error("Schema validation failed", parsed.error);
      throw new Error("Invalid data format");
    }

    return parsed.data;
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
}