import { useState, useEffect } from "react";
import { Loader2, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MenuManager() {
  const [activeView, setActiveView] = useState<'categories' | 'items'>('categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms State
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [catForm, setCatForm] = useState({ name: "", description: "", is_active: true, sort_order: 0 });

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemForm, setItemForm] = useState({ 
    name: "", description: "", image_url: "", category_id: "", 
    is_veg: false, is_active: true, is_out_of_stock: false, sort_order: 0 
  });
  
  const [variantsForm, setVariantsForm] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `menu/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath);
      
      setItemForm({ ...itemForm, image_url: data.publicUrl });
    } catch (err: any) {
      alert("Failed to upload image: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, itemsRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('menu_items').select('*, item_variants(*)').order('sort_order', { ascending: true })
      ]);
      if (catsRes.error) throw catsRes.error;
      if (itemsRes.error) throw itemsRes.error;
      
      setCategories(catsRes.data || []);
      setItems(itemsRes.data || []);
    } catch (err: any) {
      alert("Failed to load menu data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CATEGORY HANDLERS
  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await supabase.from('categories').update(catForm).eq('id', editingCat.id);
      } else {
        await supabase.from('categories').insert([catForm]);
      }
      setShowCatModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure? This will delete all items in this category!")) return;
    try {
      await supabase.from('categories').delete().eq('id', id);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ITEM HANDLERS
  const openItemModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name, description: item.description || "", image_url: item.image_url || "",
        category_id: item.category_id, is_veg: item.is_veg, is_active: item.is_active,
        is_out_of_stock: item.is_out_of_stock, sort_order: item.sort_order
      });
      setVariantsForm(item.item_variants || []);
    } else {
      setEditingItem(null);
      setItemForm({
        name: "", description: "", image_url: "", category_id: categories[0]?.id || "",
        is_veg: false, is_active: true, is_out_of_stock: false, sort_order: 0
      });
      setVariantsForm([{ name: "Regular", price: 0, is_default: true, is_active: true }]);
    }
    setShowItemModal(true);
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let itemId = editingItem?.id;
      
      // Save Item
      if (editingItem) {
        await supabase.from('menu_items').update(itemForm).eq('id', itemId);
      } else {
        const { data } = await supabase.from('menu_items').insert([itemForm]).select().single();
        if (data) itemId = data.id;
      }

      // Save Variants (Delete old, insert new for simplicity, or upsert)
      if (itemId) {
        await supabase.from('item_variants').delete().eq('item_id', itemId);
        const varsToInsert = variantsForm.map(v => ({ ...v, item_id: itemId }));
        await supabase.from('item_variants').insert(varsToInsert);
      }

      setShowItemModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await supabase.from('menu_items').delete().eq('id', id);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-black/10 pb-4">
        <button 
          onClick={() => setActiveView('categories')}
          className={`font-bold px-4 py-2 rounded-full transition ${activeView === 'categories' ? 'bg-amber text-white' : 'bg-white hover:bg-atmosphere'}`}
        >
          Categories
        </button>
        <button 
          onClick={() => setActiveView('items')}
          className={`font-bold px-4 py-2 rounded-full transition ${activeView === 'items' ? 'bg-amber text-white' : 'bg-white hover:bg-atmosphere'}`}
        >
          Menu Items
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-amber" /></div>
      ) : (
        <>
          {/* CATEGORIES VIEW */}
          {activeView === 'categories' && (
            <div className="bg-white rounded-3xl p-6 shadow-card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Manage Categories</h2>
                <button 
                  onClick={() => { setEditingCat(null); setCatForm({ name: "", description: "", is_active: true, sort_order: 0 }); setShowCatModal(true); }}
                  className="bg-amber text-white px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Category
                </button>
              </div>
              <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between bg-atmosphere/50 p-4 rounded-2xl">
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {cat.name}
                        {!cat.is_active && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Inactive</span>}
                      </div>
                      <div className="text-xs text-foreground/60">{cat.description}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingCat(cat); setCatForm(cat); setShowCatModal(true); }} className="p-2 hover:bg-black/5 rounded-full"><Edit2 className="h-4 w-4 text-blue-500" /></button>
                      <button onClick={() => deleteCategory(cat.id)} className="p-2 hover:bg-black/5 rounded-full"><Trash2 className="h-4 w-4 text-red-500" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ITEMS VIEW */}
          {activeView === 'items' && (
            <div className="bg-white rounded-3xl p-6 shadow-card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Manage Menu Items</h2>
                <button 
                  onClick={() => openItemModal()}
                  className="bg-amber text-white px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </button>
              </div>
              <div className="space-y-6">
                {categories.map(cat => (
                  <div key={cat.id} className="border border-black/5 rounded-2xl p-4">
                    <h3 className="font-bold text-lg mb-3 border-b border-black/5 pb-2">{cat.name}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {items.filter(item => item.category_id === cat.id).map(item => (
                        <div key={item.id} className="flex gap-4 bg-atmosphere/50 p-3 rounded-xl items-start">
                          <div className="w-16 h-16 rounded-lg bg-black/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="h-6 w-6 opacity-20" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold flex items-center gap-2 truncate">
                              {item.name}
                              {item.is_veg && <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" title="Veg"></span>}
                              {item.is_out_of_stock && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Out of Stock</span>}
                            </div>
                            <div className="text-xs text-foreground/60 truncate">{item.description}</div>
                            <div className="text-xs font-semibold text-amber mt-1">
                              {item.item_variants?.map((v:any) => `${v.name}: ₹${v.price}`).join(', ')}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button onClick={() => openItemModal(item)} className="p-1.5 hover:bg-black/5 rounded-md"><Edit2 className="h-3.5 w-3.5 text-blue-500" /></button>
                            <button onClick={() => deleteItem(item.id)} className="p-1.5 hover:bg-black/5 rounded-md"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
                          </div>
                        </div>
                      ))}
                      {items.filter(item => item.category_id === cat.id).length === 0 && (
                        <div className="text-sm text-foreground/40 italic col-span-2 p-2">No items in this category.</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* CATEGORY MODAL */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editingCat ? 'Edit' : 'Add'} Category</h2>
            <form onSubmit={saveCategory} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-foreground/50">Name</label>
                <input required value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full bg-atmosphere rounded-xl p-3 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-foreground/50">Description</label>
                <input value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="w-full bg-atmosphere rounded-xl p-3 outline-none" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold uppercase text-foreground/50">Sort Order</label>
                  <input type="number" value={catForm.sort_order} onChange={e => setCatForm({...catForm, sort_order: parseInt(e.target.value)})} className="w-full bg-atmosphere rounded-xl p-3 outline-none" />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="cat-active" checked={catForm.is_active} onChange={e => setCatForm({...catForm, is_active: e.target.checked})} className="w-5 h-5 accent-amber" />
                  <label htmlFor="cat-active" className="font-bold">Active</label>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowCatModal(false)} className="flex-1 bg-atmosphere py-3 rounded-full font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-amber text-white py-3 rounded-full font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ITEM MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit' : 'Add'} Menu Item</h2>
            <form onSubmit={saveItem} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-foreground/50">Name</label>
                  <input required value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} className="w-full bg-atmosphere rounded-xl p-3 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-foreground/50">Category</label>
                  <select required value={itemForm.category_id} onChange={e => setItemForm({...itemForm, category_id: e.target.value})} className="w-full bg-atmosphere rounded-xl p-3 outline-none">
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold uppercase text-foreground/50">Description</label>
                <input value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} className="w-full bg-atmosphere rounded-xl p-3 outline-none" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Item Image</label>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input value={itemForm.image_url} onChange={e => setItemForm({...itemForm, image_url: e.target.value})} placeholder="Paste image link (https://...)" className="flex-1 bg-atmosphere rounded-xl p-3 outline-none text-sm" />
                  <span className="text-xs font-bold text-foreground/40 text-center">OR</span>
                  <label className="cursor-pointer bg-atmosphere text-foreground px-4 py-3 rounded-xl font-bold text-sm hover:bg-amber hover:text-white transition shadow-sm relative overflow-hidden flex items-center justify-center gap-2 border border-black/5">
                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ImageIcon className="h-4 w-4" /> Upload</>}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingImage} />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={itemForm.is_veg} onChange={e => setItemForm({...itemForm, is_veg: e.target.checked})} className="w-5 h-5 accent-amber" />
                  <span className="font-bold">Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={itemForm.is_active} onChange={e => setItemForm({...itemForm, is_active: e.target.checked})} className="w-5 h-5 accent-amber" />
                  <span className="font-bold">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-red-500">
                  <input type="checkbox" checked={itemForm.is_out_of_stock} onChange={e => setItemForm({...itemForm, is_out_of_stock: e.target.checked})} className="w-5 h-5 accent-red-500" />
                  <span className="font-bold">Out of Stock</span>
                </label>
              </div>

              <div className="border-t border-black/10 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold uppercase text-foreground/80">Variants & Pricing</label>
                  <button type="button" onClick={() => setVariantsForm([...variantsForm, { name: "", price: 0, is_default: false, is_active: true }])} className="text-xs bg-amber/10 text-amber px-2 py-1 rounded font-bold">+ Add Variant</button>
                </div>
                <div className="space-y-2">
                  {variantsForm.map((v, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-atmosphere/50 p-2 rounded-xl">
                      <input required placeholder="Name (e.g. Regular)" value={v.name} onChange={e => { const nv = [...variantsForm]; nv[idx].name = e.target.value; setVariantsForm(nv); }} className="flex-1 bg-white rounded-lg p-2 text-sm outline-none" />
                      <input required type="number" placeholder="Price" value={v.price} onChange={e => { const nv = [...variantsForm]; nv[idx].price = parseFloat(e.target.value); setVariantsForm(nv); }} className="w-24 bg-white rounded-lg p-2 text-sm outline-none" />
                      <button type="button" onClick={() => { const nv = variantsForm.filter((_, i) => i !== idx); setVariantsForm(nv); }} className="p-2 hover:bg-black/5 rounded-md"><Trash2 className="h-4 w-4 text-red-500" /></button>
                    </div>
                  ))}
                  {variantsForm.length === 0 && <div className="text-xs text-red-500">You must add at least one variant.</div>}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t mt-6">
                <button type="button" onClick={() => setShowItemModal(false)} className="flex-1 bg-atmosphere py-3 rounded-full font-bold">Cancel</button>
                <button type="submit" disabled={variantsForm.length === 0} className="flex-1 bg-amber text-white py-3 rounded-full font-bold disabled:opacity-50">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
