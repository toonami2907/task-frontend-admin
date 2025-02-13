import * as z from 'zod';

export const planSchema = z.object({
    name: z.string().min(2, 'Plan name must be at least 2 characters'),
    price: z.number().min(0, 'Price must be a positive number'),
    billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'NGN']),
    features: z.array(
      z.object({
        value: z.string().min(1, 'Feature cannot be empty')
      })
    ).min(1, 'At least one feature is required'),
    isPopular: z.boolean().default(false),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE')
  });


  export const faqFormSchema = z.object({
    question: z.string()
      .min(10, "Question must be at least 10 characters")
      .max(200, "Question cannot exceed 200 characters"),
    answer: z.string()
      .min(20, "Answer must be at least 20 characters")
      .max(1000, "Answer cannot exceed 1000 characters"),
    category: z.enum(["general", "billing", "technical", "features"]),
    media: z.object({
      type: z.enum(["none", "image", "video"]),
      url: z.string().url().optional().or(z.literal(""))
    })
  })