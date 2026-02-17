"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock,
  Calendar,
  Target,
  StickyNote,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle2,
  Heart,
  Plus,
  FolderPlus,
  MoreHorizontal,
  Play,
  Trash2,
  Edit3,
  X,
  Sparkles,
  Library,
} from "lucide-react"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"
import { FocusSession, PostIt, PostItCollection } from "@/lib/types"
import { cn } from "@/lib/utils"

type Tab = "sessions" | "postits" | "collections"

const POST_IT_COLORS = {
  yellow: "bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100",
  pink: "bg-pink-200 dark:bg-pink-900/50 text-pink-900 dark:text-pink-100",
  blue: "bg-blue-200 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100",
  green: "bg-green-200 dark:bg-green-900/50 text-green-900 dark:text-green-100",
  purple: "bg-purple-200 dark:bg-purple-900/50 text-purple-900 dark:text-purple-100",
}

export default function SessionsPage() {
  const router = useRouter()
  const hasHydrated = useHasHydrated()
  const {
    objective,
    sessions,
    postItCollections,
    togglePostItLike,
    createCollection,
    deleteCollection,
    renameCollection,
    addPostItToCollection,
    removePostItFromCollection,
    getAllPostIts,
    visualPrefs,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<Tab>("sessions")
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionEmoji, setNewCollectionEmoji] = useState("#")
  const [addingToCollection, setAddingToCollection] = useState<string | null>(null)

  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en

  useEffect(() => {
    if (hasHydrated && !objective) {
      router.push("/app/define")
    }
  }, [objective, hasHydrated, router])

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const objectiveSessions = sessions
    .filter((s) => s.objectiveId === objective?.id && s.endedAt)
    .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime())

  const allPostIts = getAllPostIts()
  const likedPostIts = allPostIts.filter(p => p.liked)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return
    createCollection(newCollectionName.trim(), newCollectionEmoji)
    setNewCollectionName("")
    setNewCollectionEmoji("#")
    setShowNewCollectionModal(false)
  }

  const handleAddToCollection = (postItId: string, collectionId: string) => {
    addPostItToCollection(collectionId, postItId)
    setAddingToCollection(null)
  }

  const getCollectionPostIts = (collection: PostItCollection): PostIt[] => {
    return collection.postItIds
      .map(id => allPostIts.find(p => p.id === id))
      .filter((p): p is PostIt => p !== undefined)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative px-4 md:px-8 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Library</h1>
            <p className="text-muted-foreground">
              {t("Your sessions, notes and collections", "Tes sessions, notes et collections")}
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-6 mt-6 text-sm"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-semibold">{objectiveSessions.length}</span>
              <span className="text-muted-foreground">sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold">{allPostIts.length}</span>
              <span className="text-muted-foreground">notes</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="font-semibold">{likedPostIts.length}</span>
              <span className="text-muted-foreground">likes</span>
            </div>
            <div className="flex items-center gap-2">
              <Library className="w-4 h-4 text-blue-500" />
              <span className="font-semibold">{postItCollections.length}</span>
              <span className="text-muted-foreground">collections</span>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {[
              { id: "sessions", label: "Sessions", icon: Zap },
              { id: "postits", label: "Post-its", icon: StickyNote },
              { id: "collections", label: "Collections", icon: Library },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 hover:bg-white/10 text-muted-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 pb-8">
        <AnimatePresence mode="wait">
          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {objectiveSessions.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t("No sessions", "Aucune session")}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {t("Start your first focus session", "Lance ta premiere session de focus")}
                  </p>
                  <button
                    onClick={() => router.push("/app/focus")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Go Focus
                  </button>
                </div>
              ) : (
                objectiveSessions.map((session, index) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    index={index}
                    isExpanded={expandedSession === session.id}
                    onToggle={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                    onLikePostIt={(postItId) => togglePostItLike(session.id, postItId)}
                    onAddToCollection={(postItId) => setAddingToCollection(postItId)}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatDuration={formatDuration}
                  />
                ))
              )}
            </motion.div>
          )}

          {/* Post-its Tab */}
          {activeTab === "postits" && (
            <motion.div
              key="postits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Liked section */}
              {likedPostIts.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                    {t("Liked notes", "Notes likees")}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {likedPostIts.map((postIt) => (
                      <PostItCard
                        key={postIt.id}
                        postIt={postIt}
                        onLike={() => postIt.sessionId && togglePostItLike(postIt.sessionId, postIt.id)}
                        onAddToCollection={() => setAddingToCollection(postIt.id)}
                        tiltEnabled={visualPrefs.tiltPostIts}
                        bouncingHeart={visualPrefs.bouncingHeart}
                        lang={lang}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All post-its */}
              <div>
                <h2 className="text-lg font-semibold mb-4">{t("All notes", "Toutes les notes")}</h2>
                {allPostIts.length === 0 ? (
                  <div className="text-center py-16 bg-card border border-border rounded-2xl">
                    <StickyNote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t("No notes yet", "Pas encore de notes")}</h3>
                    <p className="text-muted-foreground text-sm">
                      {t("Your session post-its will appear here", "Tes post-its de session apparaitront ici")}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {allPostIts.map((postIt) => (
                      <PostItCard
                        key={postIt.id}
                        postIt={postIt}
                        onLike={() => postIt.sessionId && togglePostItLike(postIt.sessionId, postIt.id)}
                        onAddToCollection={() => setAddingToCollection(postIt.id)}
                        tiltEnabled={visualPrefs.tiltPostIts}
                        bouncingHeart={visualPrefs.bouncingHeart}
                        lang={lang}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Collections Tab */}
          {activeTab === "collections" && (
            <motion.div
              key="collections"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Create collection button */}
              <button
                onClick={() => setShowNewCollectionModal(true)}
                className="w-full mb-6 p-4 border-2 border-dashed border-white/10 hover:border-primary/30 rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <FolderPlus className="w-5 h-5" />
                {t("Create a collection", "Creer une collection")}
              </button>

              {/* Collections grid */}
              {postItCollections.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                  <Library className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t("No collections", "Pas de collections")}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t("Organize your notes into collections", "Organise tes notes en collections")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {postItCollections.map((collection) => (
                    <CollectionCard
                      key={collection.id}
                      collection={collection}
                      postIts={getCollectionPostIts(collection)}
                      onSelect={() => setSelectedCollection(collection.id)}
                      onDelete={() => deleteCollection(collection.id)}
                      t={t}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Collection Modal */}
      <AnimatePresence>
        {showNewCollectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewCollectionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">{t("New collection", "Nouvelle collection")}</h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const icons = ["#", "A", "B", "C", "I", "P", "S", "X"]
                      const current = icons.indexOf(newCollectionEmoji)
                      setNewCollectionEmoji(icons[(current + 1) % icons.length])
                    }}
                    className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 flex items-center justify-center text-lg font-bold text-primary transition-colors"
                  >
                    {newCollectionEmoji}
                  </button>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder={t("Collection name", "Nom de la collection")}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewCollectionModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-medium transition-colors"
                >
                  {t("Cancel", "Annuler")}
                </button>
                <button
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim()}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("Create", "Creer")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add to Collection Modal */}
      <AnimatePresence>
        {addingToCollection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setAddingToCollection(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">{t("Add to a collection", "Ajouter a une collection")}</h2>

              {postItCollections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">{t("No collection yet", "Pas encore de collection")}</p>
                  <button
                    onClick={() => {
                      setAddingToCollection(null)
                      setShowNewCollectionModal(true)
                    }}
                    className="text-primary hover:underline"
                  >
                    {t("Create a collection", "Creer une collection")}
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {postItCollections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => handleAddToCollection(addingToCollection, collection.id)}
                      className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-3 transition-colors"
                    >
                      <span className="text-xl">{collection.emoji || "#"}</span>
                      <span className="font-medium">{collection.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {collection.postItIds.length} {t("notes", "notes")}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setAddingToCollection(null)}
                className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-medium transition-colors"
              >
                {t("Cancel", "Annuler")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collection Detail Modal */}
      <AnimatePresence>
        {selectedCollection && (
          <CollectionDetailModal
            collection={postItCollections.find(c => c.id === selectedCollection)!}
            postIts={getCollectionPostIts(postItCollections.find(c => c.id === selectedCollection)!)}
            onClose={() => setSelectedCollection(null)}
            onRemovePostIt={(postItId) => removePostItFromCollection(selectedCollection, postItId)}
            onLikePostIt={(sessionId, postItId) => togglePostItLike(sessionId, postItId)}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Session Card Component
function SessionCard({
  session,
  index,
  isExpanded,
  onToggle,
  onLikePostIt,
  onAddToCollection,
  formatDate,
  formatTime,
  formatDuration,
}: {
  session: FocusSession
  index: number
  isExpanded: boolean
  onToggle: () => void
  onLikePostIt: (postItId: string) => void
  onAddToCollection: (postItId: string) => void
  formatDate: (date: string) => string
  formatTime: (date: string) => string
  formatDuration: (minutes: number) => string
}) {
  const distractions = session.distractions?.length || 0
  const impact = distractions === 0
    ? { label: "Perfect", color: "text-green-500", bg: "bg-green-500/10" }
    : distractions <= 2
    ? { label: "Good", color: "text-yellow-500", bg: "bg-yellow-500/10" }
    : { label: "Tough", color: "text-red-500", bg: "bg-red-500/10" }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="font-medium">{formatDate(session.endedAt!)}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span>{formatTime(session.startedAt)}</span>
              <span>·</span>
              <span>{formatDuration(session.actualDuration || session.duration)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden md:flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${impact.bg} ${impact.color}`}>
            {impact.label}
          </div>
          {session.postIts && session.postIts.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-yellow-500">
              <StickyNote className="w-4 h-4" />
              {session.postIts.length}
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-4">
              {session.reflection && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Reflection</h4>
                  <p className="text-sm bg-white/5 rounded-xl p-3">{session.reflection}</p>
                </div>
              )}

              {session.nextAction && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Next Action</h4>
                  <p className="text-sm bg-primary/10 text-primary rounded-xl p-3">{session.nextAction}</p>
                </div>
              )}

              {session.postIts && session.postIts.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Post-its ({session.postIts.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {session.postIts.map((postIt) => (
                      <div
                        key={postIt.id}
                        className={`${POST_IT_COLORS[postIt.color || "yellow"]} rounded-xl p-3 text-sm relative group`}
                      >
                        <p>{postIt.text}</p>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onLikePostIt(postIt.id)
                            }}
                            className="p-1 rounded-full bg-black/20 hover:bg-black/30"
                          >
                            <Heart className={`w-3 h-3 ${postIt.liked ? "fill-pink-500 text-pink-500" : ""}`} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onAddToCollection(postIt.id)
                            }}
                            className="p-1 rounded-full bg-black/20 hover:bg-black/30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {session.distractions && session.distractions.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Distractions ({session.distractions.length})
                  </h4>
                  <div className="space-y-1">
                    {session.distractions.map((d) => (
                      <div key={d.id} className="text-sm text-muted-foreground bg-white/5 rounded-lg px-3 py-2">
                        {d.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Post-it Card Component with 3D tilt effect
function PostItCard({
  postIt,
  onLike,
  onAddToCollection,
  tiltEnabled = false,
  bouncingHeart = false,
  lang = 'en',
}: {
  postIt: PostIt
  onLike: () => void
  onAddToCollection: () => void
  tiltEnabled?: boolean
  bouncingHeart?: boolean
  lang?: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isLiking, setIsLiking] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10
    setTilt({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (bouncingHeart) {
      setIsLiking(true)
      setTimeout(() => setIsLiking(false), 400)
    }
    onLike()
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: tiltEnabled ? 1.05 : 1.02, rotate: postIt.rotation * 0.5 }}
      className={cn(
        POST_IT_COLORS[postIt.color || "yellow"],
        "rounded-xl p-4 relative group cursor-pointer transition-shadow duration-300",
        tiltEnabled && "hover:shadow-xl hover:shadow-black/20"
      )}
      style={{
        transform: `rotate(${postIt.rotation}deg) perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      <p className="text-sm pr-6">{postIt.text}</p>
      {postIt.createdAt && (
        <p className="text-[10px] opacity-60 mt-2">
          {new Date(postIt.createdAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
        </p>
      )}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          onClick={handleLike}
          animate={isLiking ? { scale: [1, 1.4, 0.9, 1.2, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
        >
          <Heart className={cn(
            "w-3.5 h-3.5 transition-all",
            postIt.liked && "fill-pink-500 text-pink-500",
            isLiking && "scale-110"
          )} />
        </motion.button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddToCollection()
          }}
          className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

// Collection Card Component
function CollectionCard({
  collection,
  postIts,
  onSelect,
  onDelete,
  t,
}: {
  collection: PostItCollection
  postIts: PostIt[]
  onSelect: () => void
  onDelete: () => void
  t: (en: string, fr: string) => string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
      className="bg-card border border-border rounded-2xl p-4 cursor-pointer group relative overflow-hidden"
    >
      {/* Preview grid of post-its */}
      <div className="grid grid-cols-2 gap-1 mb-4 h-24 overflow-hidden rounded-xl">
        {postIts.slice(0, 4).map((postIt, i) => (
          <div
            key={postIt.id}
            className={`${POST_IT_COLORS[postIt.color || "yellow"]} p-2 text-[10px] overflow-hidden`}
          >
            {postIt.text.slice(0, 30)}...
          </div>
        ))}
        {postIts.length === 0 && (
          <div className="col-span-2 flex items-center justify-center text-muted-foreground text-sm">
            {t("Empty collection", "Collection vide")}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-2xl">{collection.emoji || "#"}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{collection.name}</h3>
          <p className="text-xs text-muted-foreground">{postIts.length} {t("notes", "notes")}</p>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute top-3 right-3 p-2 rounded-full bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// Collection Detail Modal
function CollectionDetailModal({
  collection,
  postIts,
  onClose,
  onRemovePostIt,
  onLikePostIt,
  t,
}: {
  collection: PostItCollection
  postIts: PostIt[]
  onClose: () => void
  onRemovePostIt: (postItId: string) => void
  onLikePostIt: (sessionId: string, postItId: string) => void
  t: (en: string, fr: string) => string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center gap-4">
          <span className="text-4xl">{collection.emoji || "#"}</span>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{collection.name}</h2>
            <p className="text-muted-foreground text-sm">{postIts.length} {t("notes", "notes")}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {postIts.length === 0 ? (
            <div className="text-center py-12">
              <StickyNote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("This collection is empty", "Cette collection est vide")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {postIts.map((postIt) => (
                <div
                  key={postIt.id}
                  className={`${POST_IT_COLORS[postIt.color || "yellow"]} rounded-xl p-4 relative group`}
                >
                  <p className="text-sm">{postIt.text}</p>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => postIt.sessionId && onLikePostIt(postIt.sessionId, postIt.id)}
                      className="p-1.5 rounded-full bg-black/20 hover:bg-black/30"
                    >
                      <Heart className={`w-3.5 h-3.5 ${postIt.liked ? "fill-pink-500 text-pink-500" : ""}`} />
                    </button>
                    <button
                      onClick={() => onRemovePostIt(postIt.id)}
                      className="p-1.5 rounded-full bg-black/20 hover:bg-black/30"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
