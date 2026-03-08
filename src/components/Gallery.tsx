import { useState } from 'react';
import { Plus, Star, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Image, ImageCategory } from '@/types';
import { getImageCategoryLabel } from '@/lib/utils';

interface GalleryProps {
  images: Image[];
  onAddImage: (image: Omit<Image, 'id'>) => void;
  onUpdateImage: (id: string, updates: Partial<Image>) => void;
  onDeleteImage: (id: string) => void;
}

const categories: ImageCategory[] = ['cabana', 'habitaciones', 'exteriores', 'amenidades'];

export function Gallery({ 
  images, 
  onAddImage, 
  onUpdateImage, 
  onDeleteImage 
}: GalleryProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    category: 'cabana' as ImageCategory,
    url: '',
    description: '',
    isMain: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAddImage({
      category: formData.category,
      url: formData.url,
      description: formData.description,
      isMain: formData.isMain,
    });

    setFormData({
      category: 'cabana',
      url: '',
      description: '',
      isMain: false,
    });
    setShowAddDialog(false);
  };

  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
    setShowImageDialog(true);
  };

  const getImagesByCategory = (category: ImageCategory) => {
    return images.filter(img => img.category === category);
  };

  const getMainImage = () => {
    return images.find(img => img.isMain) || images[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F4F4F4]">Galería</h2>
          <p className="text-[#F4F4F4]/60">Imágenes de ROQUI Beach House</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-[#E6A800] text-[#0B0B0B] hover:bg-[#E6A800]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Imagen
        </Button>
      </div>

      {/* Main Image */}
      {getMainImage() && (
        <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#F4F4F4] flex items-center gap-2">
              <Star className="w-5 h-5 text-[#E6A800]" />
              Imagen Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => handleImageClick(getMainImage())}
            >
              <img
                src={getMainImage().url}
                alt={getMainImage().description || 'Imagen principal'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/800x450/1a1a1a/E6A800?text=ROQUI+Beach+House';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ExternalLink className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery Tabs */}
      <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
        <CardContent className="p-6">
          <Tabs defaultValue="cabana" className="w-full">
            <TabsList className="grid grid-cols-4 bg-[#F4F4F4]/5 mb-6">
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="text-[#F4F4F4]/70 data-[state=active]:bg-[#E6A800] data-[state=active]:text-[#0B0B0B]"
                >
                  {getImageCategoryLabel(cat)}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getImagesByCategory(category).length === 0 ? (
                    <div className="col-span-full py-12 text-center text-[#F4F4F4]/50">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay imágenes en esta categoría</p>
                    </div>
                  ) : (
                    getImagesByCategory(category).map((image) => (
                      <div
                        key={image.id}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-[#E6A800]/20 cursor-pointer"
                        onClick={() => handleImageClick(image)}
                      >
                        <img
                          src={image.url}
                          alt={image.description || 'Imagen'}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/1a1a1a/E6A800?text=ROQUI';
                          }}
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
                          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!image.isMain && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateImage(image.id, { isMain: true });
                                }}
                                className="h-8 w-8 bg-white/20 text-white hover:bg-white/40"
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteImage(image.id);
                              }}
                              className="h-8 w-8 bg-white/20 text-white hover:bg-red-500/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Main Badge */}
                        {image.isMain && (
                          <div className="absolute top-2 left-2 bg-[#E6A800] text-[#0B0B0B] text-xs font-bold px-2 py-1 rounded">
                            Principal
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Image Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#0B0B0B] border-[#E6A800]/20 text-[#F4F4F4] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Agregar Imagen</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({ ...formData, category: v as ImageCategory })}
              >
                <SelectTrigger className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0B0B0B] border-[#E6A800]/20">
                  <SelectItem value="cabana">Cabaña</SelectItem>
                  <SelectItem value="habitaciones">Habitaciones</SelectItem>
                  <SelectItem value="exteriores">Exteriores</SelectItem>
                  <SelectItem value="amenidades">Amenidades</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="url">URL de la Imagen</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                required
                className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ej. Vista de la playa desde la terraza"
                className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isMain"
                checked={formData.isMain}
                onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                className="w-4 h-4 rounded border-[#E6A800]/20 bg-[#F4F4F4]/5 text-[#E6A800]"
              />
              <Label htmlFor="isMain" className="cursor-pointer">
                Establecer como imagen principal
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-[#E6A800] text-[#0B0B0B] hover:bg-[#E6A800]/90"
              >
                Guardar Imagen
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="border-[#E6A800]/30 text-[#F4F4F4] hover:bg-[#E6A800]/10"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Detail Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="bg-[#0B0B0B] border-[#E6A800]/20 text-[#F4F4F4] max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {selectedImage?.description || 'Imagen'}
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.description || 'Imagen'}
                  className="w-full h-full object-contain bg-black"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/800x450/1a1a1a/E6A800?text=ROQUI+Beach+House';
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#F4F4F4]/60">
                    Categoría: {getImageCategoryLabel(selectedImage.category)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!selectedImage.isMain && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        onUpdateImage(selectedImage.id, { isMain: true });
                        setShowImageDialog(false);
                      }}
                      className="border-[#E6A800]/30 text-[#F4F4F4] hover:bg-[#E6A800]/10"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Hacer Principal
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      onDeleteImage(selectedImage.id);
                      setShowImageDialog(false);
                    }}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
