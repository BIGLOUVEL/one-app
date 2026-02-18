"use client"

import { motion } from "framer-motion"
import { X, Download, FileText, Image as ImageIcon, File } from "lucide-react"
import { BunkerDocument } from "@/lib/types"

interface DocumentViewerProps {
  document: BunkerDocument
  signedUrl: string
  onClose: () => void
}

function getViewType(mimeType: string): "pdf" | "image" | "other" {
  if (mimeType === "application/pdf") return "pdf"
  if (mimeType.startsWith("image/")) return "image"
  return "other"
}

function getFileIcon(mimeType: string) {
  if (mimeType === "application/pdf") return FileText
  if (mimeType.startsWith("image/")) return ImageIcon
  return File
}

export function DocumentViewer({ document, signedUrl, onClose }: DocumentViewerProps) {
  const viewType = getViewType(document.mimeType)
  const Icon = getFileIcon(document.mimeType)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{document.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 flex items-center justify-center p-4 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {viewType === "pdf" && (
          <iframe
            src={signedUrl}
            className="w-full h-full rounded-lg bg-white"
            title={document.name}
          />
        )}

        {viewType === "image" && (
          <img
            src={signedUrl}
            alt={document.name}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        )}

        {viewType === "other" && (
          <div className="text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 border border-white/20 mx-auto">
              <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium">{document.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                This file type cannot be previewed in-app.
              </p>
            </div>
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download file
            </a>
          </div>
        )}
      </div>
    </motion.div>
  )
}
