import { z } from 'zod';

export const createOrUpdateProductSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    price: z.string().min(1, { message: 'Price is required' }),
    maxQuantity: z.string().min(1, { message: 'Max quantity is required' }),
    category: z.string().min(1, { message: 'Category is required' }),
    heroImage: z
        .any()
        .refine((file) => file && file.length === 1, 'Hero image is required')
        .default([]),
    images: z
        .any()
        .refine(
            (files: FileList | null) => files instanceof FileList && files.length > 0,
            { message: 'At least one image is required' }
        )
        .transform((files: FileList | null) => (files ? Array.from(files) : []))
        .default([]),
    intent: z
        .enum(['create', 'update'], {
            message: 'Intent must be either create or update',
        })
        .optional(),
    slug: z.string().optional(),
    description: z.string().min(1, { message: 'Description is required' }),
    sizes: z.array(z.object({
      size: z.number().min(34).max(45),
      quantity: z.number().min(0)
    })).length(12, { message: 'Must have 12 sizes from 34 to 45' }),
});

export type CreateOrUpdateProductSchema = z.infer<
    typeof createOrUpdateProductSchema
>;

export const createProductSchemaServer = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    price: z.number().positive({ message: 'Price is required' }),
    maxQuantity: z.number().positive({ message: 'Max quantity is required' }),
    category: z.number().positive({ message: 'Category is required' }),
    heroImage: z.string().url({ message: 'Hero image is required' }),
    images: z.array(z.string().url({ message: 'Images are required' })),
    description: z.string().min(1, { message: 'Description is required' }),
    sizes: z.array(z.object({
      size: z.number().min(34).max(45),
      quantity: z.number().min(0)
    })).length(12, { message: 'Must have 12 sizes from 34 to 45' }),
});

export type CreateProductSchemaServer = z.infer<
    typeof createProductSchemaServer
>;
