import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  hostelName: string;
}

export default function ImageGallery({ images, hostelName }: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allImages = images.length > 0
    ? images
    : ['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'];

  const prev = () => setLightboxIndex((i) => (i === null ? null : (i - 1 + allImages.length) % allImages.length));
  const next = () => setLightboxIndex((i) => (i === null ? null : (i + 1) % allImages.length));

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-80 sm:h-96 rounded-2xl overflow-hidden">
        <div
          className="col-span-2 row-span-2 cursor-pointer overflow-hidden"
          onClick={() => setLightboxIndex(0)}
        >
          <img
            src={allImages[0]}
            alt={`${hostelName} - main`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800';
            }}
          />
        </div>
        {allImages.slice(1, 5).map((img, i) => (
          <div
            key={i}
            className="cursor-pointer overflow-hidden relative"
            onClick={() => setLightboxIndex(i + 1)}
          >
            <img
              src={img}
              alt={`${hostelName} - ${i + 2}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800';
              }}
            />
            {i === 3 && allImages.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">+{allImages.length - 5} more</span>
              </div>
            )}
          </div>
        ))}
        {allImages.length < 5 &&
          Array.from({ length: 4 - (allImages.length - 1) }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-gray-100" />
          ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <X size={28} />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 bg-white/10 rounded-full"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft size={24} />
          </button>

          <img
            src={allImages[lightboxIndex]}
            alt={`${hostelName} - ${lightboxIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800';
            }}
          />

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 bg-white/10 rounded-full"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 text-white text-sm">
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </>
  );
}
