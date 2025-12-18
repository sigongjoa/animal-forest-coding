/**
 * Resolves asset paths for local development and GitHub Pages production.
 * Ensures that absolute paths like '/assets/...' are correctly prefixed with
 * the repository name in production.
 * 
 * @param path The path to the asset (e.g., "/assets/image.png")
 * @returns The resolved URL
 */
export const getAssetPath = (path: string): string => {
    if (!path) return '';

    // If path is already absolute (http/https), return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Remove leading slash if present to safely join
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // Use PUBLIC_URL provided by create-react-app during build
    // In dev: likely empty string or '/'
    // In prod (GH Pages): '/animal-forest-coding'
    const publicUrl = process.env.PUBLIC_URL;

    // If PUBLIC_URL is present, join it. Otherwise use the path as is (relative to root)
    if (publicUrl) {
        // Ensure no double slashes
        const normalizedPublicUrl = publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`;
        return `${normalizedPublicUrl}${cleanPath}`;
    }

    return `/${cleanPath}`;
};
