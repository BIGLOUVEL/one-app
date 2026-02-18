"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Upload,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  Trash2,
  Loader2,
  FolderOpen,
  X,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useAuth } from "@/components/auth/auth-provider"
import { BunkerDocument } from "@/lib/types"
import { formatFileSize } from "@/lib/utils"
import { DocumentViewer } from "./document-viewer"

function getFileIcon(mimeType: string) {
  if (mimeType === "application/pdf") return FileText
  if (mimeType.startsWith("image/")) return ImageIcon
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet
  if (mimeType.includes("word") || mimeType.includes("document")) return FileText
  return File
}

function getFileColor(mimeType: string) {
  if (mimeType === "application/pdf") return "text-red-400 bg-red-500/10 border-red-500/20"
  if (mimeType.startsWith("image/")) return "text-violet-400 bg-violet-500/10 border-violet-500/20"
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  if (mimeType.includes("word") || mimeType.includes("document")) return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
  return "text-muted-foreground bg-white/5 border-white/10"
}

interface BunkerFolderProps {
  isOpen: boolean
  onClose: () => void
}

export function BunkerFolder({ isOpen, onClose }: BunkerFolderProps) {
  const { session } = useAuth()
  const [documents, setDocuments] = useState<BunkerDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [viewingDoc, setViewingDoc] = useState<{ doc: BunkerDocument; url: string } | null>(null)
  const [deletingPath, setDeletingPath] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (!session?.access_token) return {}
    return { Authorization: `Bearer ${session.access_token}` }
  }, [session?.access_token])

  // Load documents when panel opens
  useEffect(() => {
    if (!isOpen || !session) return

    const loadDocs = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/documents", {
          headers: getAuthHeaders(),
        })
        const data = await res.json()
        if (data.files) setDocuments(data.files)
      } catch (err) {
        console.error("[docs] Failed to load:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadDocs()
  }, [isOpen, session, getAuthHeaders])

  const handleUpload = async (files: FileList | File[]) => {
    if (!session) return
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} is too large (max 50MB)`)
        continue
      }

      setIsUploading(true)
      setUploadProgress(0)

      // Simulate progress since fetch doesn't provide upload progress natively
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 10, 90))
      }, 200)

      try {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/documents", {
          method: "POST",
          headers: getAuthHeaders(),
          body: formData,
        })

        const data = await res.json()
        clearInterval(progressInterval)
        setUploadProgress(100)

        if (data.file) {
          setDocuments((prev) => [data.file, ...prev])
        }
      } catch (err) {
        console.error("[docs] Upload failed:", err)
        clearInterval(progressInterval)
      } finally {
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 500)
      }
    }
  }

  const handleViewDoc = async (doc: BunkerDocument) => {
    if (!session) return

    // Extract the filename from storagePath (everything after userId/)
    const filename = doc.storagePath.split("/").slice(1).join("/")

    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(filename)}`, {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (data.url) {
        setViewingDoc({ doc, url: data.url })
      }
    } catch (err) {
      console.error("[docs] Failed to get URL:", err)
    }
  }

  const handleDelete = async (doc: BunkerDocument) => {
    if (!session) return
    const filename = doc.storagePath.split("/").slice(1).join("/")
    setDeletingPath(doc.storagePath)

    try {
      await fetch(`/api/documents/${encodeURIComponent(filename)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      setDocuments((prev) => prev.filter((d) => d.storagePath !== doc.storagePath))
    } catch (err) {
      console.error("[docs] Delete failed:", err)
    } finally {
      setDeletingPath(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          className="w-[90vw] sm:max-w-md bg-background/95 backdrop-blur-xl border-l border-white/10 p-0 flex flex-col"
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-white/10">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <FolderOpen className="h-4 w-4 text-amber-400" />
                </div>
                Documents
              </SheetTitle>
              <SheetDescription className="text-xs">
                Upload and access your reference files without leaving focus mode.
              </SheetDescription>
            </SheetHeader>

            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mt-3 w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isUploading ? "Uploading..." : "Upload file"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
            />

            {/* Upload progress */}
            {isUploading && (
              <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            )}
          </div>

          {/* Drop zone + file list */}
          <div
            className="flex-1 overflow-y-auto px-5 py-4"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/5 border-2 border-dashed border-primary/40 rounded-xl m-4">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-primary">Drop files here</p>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Empty state */}
            {!isLoading && documents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
                  <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">No documents yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Upload PDFs, images, or any reference files
                </p>
              </div>
            )}

            {/* File list */}
            {!isLoading && documents.length > 0 && (
              <div className="space-y-2">
                <AnimatePresence>
                  {documents.map((doc) => {
                    const Icon = getFileIcon(doc.mimeType)
                    const colorClasses = getFileColor(doc.mimeType)
                    const isDeleting = deletingPath === doc.storagePath

                    return (
                      <motion.div
                        key={doc.storagePath}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"
                        onClick={() => handleViewDoc(doc)}
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg border shrink-0 ${colorClasses}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatFileSize(doc.size)}
                            {doc.createdAt && ` · ${new Date(doc.createdAt).toLocaleDateString()}`}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(doc)
                          }}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all shrink-0"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Document viewer overlay */}
      <AnimatePresence>
        {viewingDoc && (
          <DocumentViewer
            document={viewingDoc.doc}
            signedUrl={viewingDoc.url}
            onClose={() => setViewingDoc(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
