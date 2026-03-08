'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useStorage() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadReceipt = async (file: File): Promise<{ url: string | null; error: string | null }> => {
    try {
      setUploading(true)
      setProgress(0)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `receipts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('roqui-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('roqui-files')
        .getPublicUrl(filePath)

      setProgress(100)
      return { url: publicUrl, error: null }
    } catch (err: any) {
      return { url: null, error: err.message }
    } finally {
      setUploading(false)
    }
  }

  const uploadImage = async (file: File): Promise<{ url: string | null; error: string | null }> => {
    try {
      setUploading(true)
      setProgress(0)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('roqui-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('roqui-files')
        .getPublicUrl(filePath)

      setProgress(100)
      return { url: publicUrl, error: null }
    } catch (err: any) {
      return { url: null, error: err.message }
    } finally {
      setUploading(false)
    }
  }

  const deleteFile = async (path: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.storage
        .from('roqui-files')
        .remove([path])

      if (error) throw error
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  return { uploadReceipt, uploadImage, deleteFile, uploading, progress }
}
