import { z } from "zod";

export const homeFormSchema = z.object({
  name: z.string().min(2).regex(/^[A-Za-z\s'-]+$/),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^(\(\d{3}\)\s?|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}$/, "Enter a valid US phone number"),
  service: z.string().min(1, "Please select a service"),
  date: z.string().refine((value) => {
    const date = new Date(value);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const max = new Date(now);
    max.setDate(max.getDate() + 90);
    return date >= now && date <= max;
  }, "Date must be within the next 90 days"),
  message: z.string().optional(),
});

export type HomeFormValues = z.infer<typeof homeFormSchema>;
