export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return null

  const token = authHeader.replace("Bearer ", "")
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null
  return user
}

// GET: List user's documents
export async function GET(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin.storage
    .from("bunker-documents")
    .list(user.id, {
      sortBy: { column: "created_at", order: "desc" },
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Filter out the .emptyFolderPlaceholder file Supabase creates
  const files = (data || [])
    .filter((f) => f.name !== ".emptyFolderPlaceholder")
    .map((f) => ({
      name: f.name.replace(/^\d+_/, ""), // strip timestamp prefix
      storagePath: `${user.id}/${f.name}`,
      size: f.metadata?.size ?? 0,
      mimeType: f.metadata?.mimetype ?? "application/octet-stream",
      createdAt: f.created_at,
    }))

  return NextResponse.json({ files })
}

// POST: Upload a document
export async function POST(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 })
  }

  const storagePath = `${user.id}/${Date.now()}_${file.name}`

  const { error } = await supabaseAdmin.storage
    .from("bunker-documents")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    file: {
      name: file.name,
      storagePath,
      size: file.size,
      mimeType: file.type,
      createdAt: new Date().toISOString(),
    },
  })
}
