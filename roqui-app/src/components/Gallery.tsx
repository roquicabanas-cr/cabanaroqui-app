'use client'

import { useState } from 'react'
import { Plus, Star, Trash2, ExternalLink, Image as ImageIcon, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Image, ImageCategory } from '@/types'
import { getImageCategoryLabel } from '@/lib/utils'
import { useStorage } from '@/hooks/useStorage'

interface GalleryProps {
  images: Image[]
  onAddImage: (image: Omit<Image, 'id' | 'created_at' | 'user_id'>) => void
  onUpdateImage: (id: string, updates: Partial<Image>) => void
  onDeleteImage: (id: string) => void
}

const categories: ImageCategory[] = ['cabana', 'habitaciones', 'exteriores', 'amenidades']

export function Gallery({ 
  images, 
  onAddImage, 
  onUpdateImage, 
  onDeleteImage 
}: GalleryProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const { uploadImage, uploading } = useStorage()

  const [formData, setFormData] = useState({
    category: 'cabana' as ImageCategory,
    url: '',
    description: '',
    is_main: false,
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const { url, error } = await uploadImage(file)
      if (error) {
        alert('Error al subir la imagen: ' + error)
      } else {
        setFormData({ ...formData, url: url || '' })
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onAddImage({
      category: formData.category,
      url: formData.url,
      description: formData.description,
      is_main: formData.is_main,
    })

    setFormData({
      category: 'cabana',
      url: '',
      description: '',
      is_main: false,
    })
    setShowAddDialog(false)
  }

  const handleImageClick = (image: Image) => {
    setSelectedImage(image)
    setShowImageDialog(true)
  }

  const getImagesByCategory = (category: ImageCategory) => {
    return images.filter(img => img.category === category)
  }

  const getMainImage = () => {
    return images.find(img => img.is_main) || images[0]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-roqui-cream">Galería</h2>
          <p className="text-roqui-cream/60">Imágenes de ROQUI Beach House</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Imagen
        </Button>
      </div>

      {/* Main Image */}
      {getMainImage() && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-roqui-cream flex items-center gap-2">
              <Star className="w-5 h-5 text-roqui-gold" />
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
                  (e.target as HTMLImageElement).src = 'https://placehold.co/800x450/1a1a1a/E6A800?text=ROQUI+Beach+House'
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
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="cabana" className="w-full">
            <TabsList className="grid grid-cols-4 bg-roqui-cream/5 mb-6">
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="text-roqui-cream/70 data-[state=active]:bg-roqui-gold data-[state=active]:text-roqui-black"
                >
                  {getImageCategoryLabel(cat)}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getImagesByCategory(category).length === 0 ? (
                    <div className="col-span-full py-12 text-center text-roqui-cream/50">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay imágenes en esta categoría</p>
                    </div>
                  ) : (
                    getImagesByCategory(category).map((image) => (
                      <div
                        key={image.id}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-roqui-gold/20 cursor-pointer"
                        onClick={() => handleImageClick(image)}
                      >
                        <img
                          src={image.url}
                          alt={image.description || 'Imagen'}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/1a1a1a/E6A800?text=ROQUI'
                          }}
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
                          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!image.is_main && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onUpdateImage(image.id, { is_main: true })
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
                                e.stopPropagation()
                                onDeleteImage(image.id)
                              }}
                              className="h-8 w-8 bg-white/20 text-white hover:bg-red-500/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Main Badge */}
                        {image.is_main && (
                          <div className="absolute top-2 left-2 bg-roqui-gold text-roqui-black text-xs font-bold px-2 py-1 rounded">
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
        <DialogContent className="max-w-lg">
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cabana">Cabaña</SelectItem>
                  <SelectItem value="habitaciones">Habitaciones</SelectItem>
                  <SelectItem value="exteriores">Exteriores</SelectItem>
                  <SelectItem value="amenidades">Amenidades</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="imageFile">Subir Imagen</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                {uploading && <span className="text-sm text-roqui-gold">Subiendo...</span>}
              </div>
            </div>

            <div>
              <Label htmlFor="url">O URL de la Imagen</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ej. Vista de la playa desde la terraza"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isMain"
                checked={formData.is_main}
                onChange={(e) => setFormData({ ...formData, is_main: e.target.checked })}
                className="w-4 h-4 rounded border-roqui-gold/20 bg-roqui-cream/5 text-roqui-gold"
              />
              <Label htmlFor="isMain" className="cursor-pointer">
                Establecer como imagen principal
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={!formData.url || uploading}
              >
                Guardar Imagen
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Detail Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-3xl">
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
                    (e.target as HTMLImageElement).src = 'https://placehold.co/800x450/1a1a1a/E6A800?text=ROQUI+Beach+House'
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-roqui-cream/60">
                    Categoría: {getImageCategoryLabel(selectedImage.category)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!selectedImage.is_main && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        onUpdateImage(selectedImage.id, { is_main: true })
                        setShowImageDialog(false)
                      }}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Hacer Principal
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      onDeleteImage(selectedImage.id)
                      setShowImageDialog(false)
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
  )
}
