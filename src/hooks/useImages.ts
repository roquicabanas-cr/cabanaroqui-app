import { useLocalStorage } from './useLocalStorage';
import type { Image, ImageCategory } from '@/types';
import { generateId } from '@/lib/utils';

const STORAGE_KEY = 'roqui-images';

// Default images from the provided assets
const DEFAULT_IMAGES: Image[] = [
  {
    id: '1',
    category: 'exteriores',
    url: '/images/image(9).png',
    description: 'Vista exterior de la cabaña',
    isMain: true,
  },
  {
    id: '2',
    category: 'exteriores',
    url: '/images/image(10).png',
    description: 'Entrada principal',
    isMain: false,
  },
  {
    id: '3',
    category: 'habitaciones',
    url: '/images/image(6).png',
    description: 'Habitación principal',
    isMain: false,
  },
  {
    id: '4',
    category: 'habitaciones',
    url: '/images/image(7).png',
    description: 'Vista de la habitación',
    isMain: false,
  },
  {
    id: '5',
    category: 'cabana',
    url: '/images/image(8).png',
    description: 'Sala y cocina',
    isMain: false,
  },
  {
    id: '6',
    category: 'cabana',
    url: '/images/image(4).png',
    description: 'Cocina equipada',
    isMain: false,
  },
  {
    id: '7',
    category: 'cabana',
    url: '/images/image(5).png',
    description: 'Barra de cocina',
    isMain: false,
  },
  {
    id: '8',
    category: 'amenidades',
    url: '/images/image(3).png',
    description: 'Vista aérea de la playa',
    isMain: false,
  },
];

export function useImages() {
  const [images, setImagesState] = useLocalStorage<Image[]>(STORAGE_KEY, DEFAULT_IMAGES);

  const setImages = (newImages: Image[]) => {
    setImagesState(newImages);
  };

  const addImage = (data: Omit<Image, 'id'>): Image => {
    const newImage: Image = {
      ...data,
      id: generateId(),
    };

    // If setting as main, unset other main images in same category
    if (data.isMain) {
      setImagesState(
        images.map(img => 
          img.category === data.category 
            ? { ...img, isMain: false } 
            : img
        )
      );
    }

    setImagesState([newImage, ...images]);
    return newImage;
  };

  const updateImage = (id: string, updates: Partial<Image>): Image | null => {
    let updated: Image | null = null;
    
    // If setting as main, unset other main images in same category
    if (updates.isMain) {
      const image = images.find(img => img.id === id);
      if (image) {
        setImagesState(
          images.map(img => 
            img.category === image.category && img.id !== id
              ? { ...img, isMain: false } 
              : img
          )
        );
      }
    }
    
    setImagesState(
      images.map(img => {
        if (img.id === id) {
          updated = { ...img, ...updates };
          return updated;
        }
        return img;
      })
    );
    
    return updated;
  };

  const deleteImage = (id: string): boolean => {
    setImagesState(images.filter(img => img.id !== id));
    return true;
  };

  const getImageById = (id: string): Image | undefined => {
    return images.find(img => img.id === id);
  };

  const getImagesByCategory = (category: ImageCategory): Image[] => {
    return images.filter(img => img.category === category);
  };

  const getMainImage = (): Image | undefined => {
    return images.find(img => img.isMain) || images[0];
  };

  const setMainImage = (id: string): void => {
    const image = images.find(img => img.id === id);
    if (image) {
      updateImage(id, { isMain: true });
    }
  };

  return {
    images,
    setImages,
    addImage,
    updateImage,
    deleteImage,
    getImageById,
    getImagesByCategory,
    getMainImage,
    setMainImage,
  };
}
