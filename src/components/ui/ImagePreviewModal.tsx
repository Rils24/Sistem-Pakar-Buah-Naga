import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImagePreviewModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export const ImagePreviewModal = ({
  images,
  currentIndex,
  onClose,
  onIndexChange
}: ImagePreviewModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, currentIndex, onClose, onIndexChange]);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          title="Tutup (Esc)"
          aria-label="Tutup Pratinjau Gambar"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="relative w-full flex items-center justify-center">
          <img 
            src={currentImage} 
            alt={`Preview ${currentIndex + 1}`}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() => onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 text-white bg-black/50 hover:bg-black/80 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10"
                title="Gambar Sebelumnya"
                aria-label="Gambar Sebelumnya"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-white bg-black/50 hover:bg-black/80 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10"
                title="Gambar Selanjutnya"
                aria-label="Gambar Selanjutnya"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-4 flex items-center gap-2 overflow-x-auto p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onIndexChange(idx)}
                className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                  currentIndex === idx ? 'border-pink-500 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                aria-label={`Pilih gambar ${idx + 1}`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
