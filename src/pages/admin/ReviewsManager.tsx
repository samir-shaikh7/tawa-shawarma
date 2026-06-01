import { useState, useEffect } from "react";
import { Loader2, Plus, Edit2, Trash2, CheckCircle, XCircle, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [form, setForm] = useState({ customer_name: "", rating: 5, comment: "", is_published: true });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      alert("Failed to load reviews: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openModal = (review: any = null) => {
    if (review) {
      setEditingReview(review);
      setForm({
        customer_name: review.customer_name,
        rating: review.rating,
        comment: review.comment || "",
        is_published: review.is_published
      });
    } else {
      setEditingReview(null);
      setForm({ customer_name: "", rating: 5, comment: "", is_published: true });
    }
    setShowModal(true);
  };

  const saveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await supabase.from('reviews').update(form).eq('id', editingReview.id);
      } else {
        await supabase.from('reviews').insert([form]);
      }
      setShowModal(false);
      fetchReviews();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await supabase.from('reviews').delete().eq('id', id);
      fetchReviews();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await supabase.from('reviews').update({ is_published: !currentStatus }).eq('id', id);
      setReviews(reviews.map(r => r.id === id ? { ...r, is_published: !currentStatus } : r));
    } catch (err: any) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Reviews Moderation</h2>
        <button 
          onClick={() => openModal()}
          className="bg-amber text-white px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Review
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-amber" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {reviews.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-foreground/50">No reviews found.</div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className={`p-5 rounded-2xl border-2 transition ${review.is_published ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold">{review.customer_name}</h3>
                    <div className="flex text-amber text-sm">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button 
                      onClick={() => togglePublish(review.id, review.is_published)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${review.is_published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                    >
                      {review.is_published ? <><CheckCircle className="h-3 w-3"/> Published</> : <><XCircle className="h-3 w-3"/> Hidden</>}
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => openModal(review)} className="p-1.5 bg-white hover:bg-black/5 rounded shadow-sm"><Edit2 className="h-3.5 w-3.5 text-blue-500" /></button>
                      <button onClick={() => deleteReview(review.id)} className="p-1.5 bg-white hover:bg-black/5 rounded shadow-sm"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-foreground/70 italic">"{review.comment}"</p>
                <div className="text-[10px] text-foreground/40 mt-3 text-right">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editingReview ? 'Edit' : 'Add'} Review</h2>
            <form onSubmit={saveReview} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-foreground/50">Customer Name</label>
                <input required value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} className="w-full bg-atmosphere rounded-xl p-3 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-foreground/50">Rating (1-5)</label>
                <select required value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value)})} className="w-full bg-atmosphere rounded-xl p-3 outline-none">
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Poor</option>
                  <option value={1}>1 Star - Terrible</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-foreground/50">Review Comment</label>
                <textarea required rows={4} value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} className="w-full bg-atmosphere rounded-xl p-3 outline-none resize-none" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="rev-active" checked={form.is_published} onChange={e => setForm({...form, is_published: e.target.checked})} className="w-5 h-5 accent-green-600" />
                <label htmlFor="rev-active" className="font-bold text-sm">Publish to Homepage immediately</label>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-atmosphere py-3 rounded-full font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-amber text-white py-3 rounded-full font-bold">Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
