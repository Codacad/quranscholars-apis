function buildCoursePayload(body, instructorId) {
    return {
        title: body.title?.trim(),

        instructor: instructorId,

        category: body.category,
        level: body.level,

        price: {
            amount: body.price?.amount,
            currency: body.price?.currency || "INR",
            discount: body.price?.discount || 0
        },

        duration: {
            value: body.duration?.value,
            unit: body.duration?.unit
        },

        overview: {
            description: body.overview?.description?.trim(),
            whatYouWillLearn: body.overview?.whatYouWillLearn || [],
            courseFormat: body.overview?.courseFormat || []
        },

        thumbnail: body.thumbnail,

        rating: body.rating || 0,
        reviewsCount: body.reviewsCount || 0,
        studentsEnrolled: body.studentsEnrolled || 0,

        status: body.status || "draft",
        isActive: body.isActive ?? true
    };
}


function validateCoursePayload(payload) {
    if (!payload.title) return "Title is required";
    if (!payload.category) return "Category is required";
    if (!payload.level) return "Level is required";

    if (!payload.price?.amount && payload.price?.amount !== 0)
        return "Price amount is required";

    if (!payload.duration?.value || !payload.duration?.unit)
        return "Duration value and unit are required";

    if (!payload.overview?.description)
        return "Course description is required";

    if (!payload.thumbnail)
        return "Thumbnail is required";

    return null;
}

export { buildCoursePayload, validateCoursePayload }