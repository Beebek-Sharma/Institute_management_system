// Helper function to get full media URL
export const getMediaUrl = (path) => {
    if (!path) return null;

    // If already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // If it's a blob URL (from file preview), return as is
    if (path.startsWith('blob:')) {
        return path;
    }

    // Otherwise, prepend backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${backendUrl}${cleanPath}`;
};
