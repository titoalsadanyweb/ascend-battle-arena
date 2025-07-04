import { useFeed, usePlaceBet } from '@/hooks/useFeed'
import PostCreator from '@/components/feed/PostCreator'
import { useState } from 'react'

export default function FeedPage() {
  const { data: posts = [], isLoading, refetch } = useFeed()
  const placeBet = usePlaceBet()
  const [localPosts, setLocalPosts] = useState([])

  const handlePostCreate = (post) => {
    setLocalPosts([post, ...localPosts])
    refetch()
  }

  if (isLoading) return <div>Loading feed…</div>
  return (
    <div className="space-y-6 p-4 max-w-lg mx-auto">
      <PostCreator onPostCreate={handlePostCreate} />
      {[...localPosts, ...posts].map(post => (
        <div key={post.id} className="bg-white rounded-2xl shadow p-4">
          <p className="mb-2">{post.content}</p>
          {post.media_url && <img src={post.media_url} className="rounded-xl mb-2 max-h-80 w-full object-cover" alt="Post media" />}
          <div className="flex items-center justify-between">
            <span>{post.total_staked} 💎</span>
            <button
              onClick={() => placeBet.mutate({ post_id: post.id, amount: 10 })}
              disabled={post.user_has_bet}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg"
            >
              {post.user_has_bet ? 'Bet Placed' : 'Place 10 💎 Bet'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
} 