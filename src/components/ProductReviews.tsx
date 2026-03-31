import { useState } from 'react';
import { Star } from 'lucide-react';
import { useProductReviews, useSubmitReview } from '@/hooks/useProductReviews';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function ProductReviews({ productSlug }: { productSlug: string }) {
  const { data: reviews = [], isLoading } = useProductReviews(productSlug);
  const submitReview = useSubmitReview();
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const alreadyReviewed = reviews.some(r => r.user_id === user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to leave a review.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment.');
      return;
    }
    try {
      await submitReview.mutateAsync({
        product_slug: productSlug,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        rating,
        comment: comment.trim(),
      });
      toast.success('Review submitted!');
      setComment('');
      setRating(5);
      setShowForm(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit review');
    }
  };

  const StarRating = ({ value, interactive = false }: { value: number; interactive?: boolean }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 cursor-${interactive ? 'pointer' : 'default'} transition-colors ${
            i <= (interactive ? (hoverRating || rating) : value) ? 'fill-primary text-primary' : 'text-muted-foreground/30'
          }`}
          onClick={interactive ? () => setRating(i) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 p-6 bg-primary/10 border border-primary/20">
          <div className="text-5xl font-black text-primary">{avgRating.toFixed(1)}</div>
          <div>
            <StarRating value={Math.round(avgRating)} />
            <div className="text-muted-foreground font-medium mt-1">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        </div>
      )}

      {/* Write review button */}
      {user && !alreadyReviewed && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary text-sm px-6 py-2"
        >
          Write a Review
        </button>
      )}

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-border p-4 space-y-4">
          <div>
            <label className="font-display uppercase text-xs tracking-widest block mb-2">Your Rating</label>
            <StarRating value={rating} interactive />
          </div>
          <div>
            <label className="font-display uppercase text-xs tracking-widest block mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="Share your experience..."
              required
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitReview.isPending} className="btn-primary text-sm px-6 py-2 disabled:opacity-50">
              {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground text-sm hover:text-foreground px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!user && (
        <p className="text-muted-foreground text-sm">Sign in to leave a review.</p>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No reviews yet</h3>
          <p className="text-muted-foreground">Be the first to review this product.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="border-b border-border pb-4">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-foreground">{r.user_name || 'Anonymous'}</span>
                <span className="text-sm text-muted-foreground/70">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              <StarRating value={r.rating} />
              {r.comment && <p className="text-muted-foreground mt-2">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
