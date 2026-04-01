export const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://api.offerz.live/uploads/offers/default.png';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Ensure accurate path concatenation regardless of leading slash
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `https://api.offerz.live${cleanPath}`;
};
