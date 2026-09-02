export const calculateResolution = ({
    sourceWidth,
    sourceHeight,
    targetHeight,
}) => {
    const aspectRatio = sourceWidth / sourceHeight;

    let width = Math.round(
        targetHeight * aspectRatio
    );

    // H.264 requires even dimensions
    width -= width % 2;

    return {
        width,
        height: targetHeight,
    };
};