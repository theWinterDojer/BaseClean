import React, { useState, useEffect, useRef, useCallback } from 'react';

interface NFTImageProps {
  tokenId: string;
  name?: string;
  isSpam?: boolean;
  imageUrl?: string;
}

export default function NFTImage({
  tokenId,
  name,
  isSpam = false,
  imageUrl
}: NFTImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Create intersection observer with some margin for preloading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Disconnect observer once visible
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      },
      {
        rootMargin: '50px' // Start loading 50px before image enters viewport
      }
    );

    observerRef.current.observe(img);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Load image when visible
  useEffect(() => {
    if (!isVisible || !imageUrl) return;

    setImageSrc(imageUrl);
  }, [isVisible, imageUrl]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  // Display name fallback
  const displayName = name || `#${tokenId}`;
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
      {/* Lazy loading placeholder */}
      {!isVisible && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Image */}
      {isVisible && imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={displayName}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}

      {/* Loading state */}
      {isVisible && imageSrc && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error state or no image */}
      {(hasError || !imageUrl) && isVisible && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${
          isSpam ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-100 dark:bg-gray-800'
        }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
            isSpam 
              ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}>
            {initials}
          </div>
          <div className={`mt-2 text-xs text-center px-2 ${
            isSpam ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {hasError ? 'Image failed to load' : 'No image'}
          </div>
        </div>
      )}

      {/* Invisible reference for intersection observer */}
      {!isVisible && <div ref={imgRef} className="absolute inset-0" />}
    </div>
  );
} 