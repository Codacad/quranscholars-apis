import * as z from 'zod'

export const createRecordedCourseSchema = z.object({
    title: z.string().trim().min(3, "title is required & should be at least 3 characters").max(150, "Title must not be larger than 150 characters"),
    description: z.string().trim().min(30, "Description is required & must have 3 characters at least").max(300, "description must not be larger than 300 characters"),
    thumbnail: z.string(),
    category: z.string(),
    price: z.object({
        original: z.number().positive(),
        sale: z.number().nonnegative().optional()
    }),
    level: z.enum(
        ["Beginner", "Intermediate", "Advanced"]
    ),
    tags: z.array(z.string().trim())
})

export const recordedCourseSectionValidationSchema = z.object({
    title: z.string().trim().min(3, "Title is required & should be at least 3 characters").max(150, "Title must not be larger than 150 characters"),
    description: z.string().trim().min(30, "Description is required & must have 30 characters at least").max(300, "description must not be larger than 300 characters"),
    order: z.number().int().nonnegative()
})