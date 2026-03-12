
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ShoppingCart, Star, Check, ShieldCheck, Truck, RotateCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product, ProductVariation } from '@/types';
import { ENHANCED_CATEGORIES } from '@/constants';

interface ProductDetailsProps {
  productId: string;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ productId }) => {
  const navigate = useNavigate();
  const { products, cart, addToCart, t, formatPrice, addToast } = useApp();
  const product = products.find(p => p.id === productId);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVar, setSelectedVar] = useState<ProductVariation | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product && product.variations.length > 0) {
      // Selecionar a primeira variação com stock, se disponível
      const firstAvailable = product.variations.find(v => v.stock > 0) || product.variations[0];
      setSelectedVar(firstAvailable);
    }
  }, [product]);

  if (!product) return <div className="p-20 text-center">Produto não encontrado</div>;

  const getTranslatedProductName = (p: Product) => t.products[p.id] || p.name;
  const getTranslatedCategoryName = (categoryName: string) => {
    const cat = ENHANCED_CATEGORIES.find(c => c.name === categoryName);
    if (cat) return t.categories[cat.slug] || cat.name;
    return categoryName;
  };

  const currentPrice = selectedVar ? selectedVar.price : product.price;
  const currentStock = selectedVar ? selectedVar.stock : product.stock;

  const handleAddToCart = () => {
    const inCart = cart.find(i => i.productId === product.id && i.variationId === selectedVar?.id);
    const inCartQty = inCart ? inCart.quantity : 0;

    if (inCartQty + quantity > currentStock) {
      addToast(`Quantidade total no carrinho (${inCartQty + quantity}) excede o stock (${currentStock}).`, 'error');
      return;
    }

    addToCart({
      productId: product.id,
      variationId: selectedVar?.id,
      quantity,
      price: currentPrice,
      name: `${getTranslatedProductName(product)}${selectedVar ? ` - ${selectedVar.name}` : ''}`,
      image: product.images[0]
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-colors group"
      >
        <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-all">
          <ArrowLeft size={16} />
        </div>
        Voltar para a Loja
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Gallery */}
        <div className="space-y-6 sticky top-24">
          <div className="aspect-square rounded-[3rem] overflow-hidden bg-white border border-gray-100 shadow-xl group cursor-zoom-in">
            <img 
              src={product.images[selectedImage] || product.images[0]} 
              alt={getTranslatedProductName(product)} 
              className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" 
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 p-1 bg-white ${selectedImage === idx ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover rounded-xl" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-indigo-200">Marca Oficial</span>
              <div className="flex items-center gap-1 text-yellow-500 font-bold ml-auto">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'opacity-20'}`} />
                ))}
                <span className="text-gray-900 text-sm ml-2 font-black">{product.rating}</span>
              </div>
            </div>
            <h1 className="text-5xl font-black text-gray-900 leading-[1.1] tracking-tighter">{getTranslatedProductName(product)}</h1>
            <p className="text-gray-500 text-lg leading-relaxed">{product.description}</p>
            
            <div className="flex items-center gap-4">
              <p className="text-gray-400 font-bold text-sm flex items-center gap-2 uppercase tracking-widest">
                Categoria: <span className="text-indigo-600 underline underline-offset-4">{getTranslatedCategoryName(product.category)}</span>
              </p>
              <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${currentStock > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100 animate-pulse'}`}>
                {currentStock > 0 ? `${currentStock} EM STOCK` : 'PRODUTO ESGOTADO'}
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-6 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <span className="text-6xl font-black text-gray-900 tracking-tighter">{formatPrice(currentPrice)}</span>
          </div>

          {/* Variações */}
          {product.variations.length > 0 && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Selecione a Opção:</label>
              <div className="flex flex-wrap gap-3">
                {product.variations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => { setSelectedVar(v); setQuantity(1); }}
                    className={`px-6 py-4 rounded-2xl border-2 font-black text-sm uppercase transition-all flex flex-col items-start ${selectedVar?.id === v.id ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100' : 'border-gray-100 hover:border-gray-200 text-gray-500'} ${v.stock <= 0 ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                  >
                    <span>{v.name}</span>
                    <span className={`text-[10px] ${v.stock <= 0 ? 'text-red-500' : 'opacity-60'}`}>{v.stock <= 0 ? 'Esgotado' : `${v.stock} un.`}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
            <div className={`flex items-center border-2 border-gray-100 rounded-2xl overflow-hidden h-20 bg-white px-2 ${currentStock <= 0 ? 'opacity-20 pointer-events-none' : ''}`}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-14 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors font-black text-2xl">-</button>
              <span className="w-16 text-center font-black text-xl text-gray-900">{quantity}</span>
              <button 
                onClick={() => {
                  if (quantity + 1 > currentStock) {
                    addToast(`Stock máximo atingido (${currentStock} un.)`, 'warning');
                    return;
                  }
                  setQuantity(quantity + 1);
                }} 
                className="w-14 h-14 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors font-black text-2xl"
              >+</button>
            </div>
            <button 
              disabled={currentStock <= 0}
              onClick={handleAddToCart}
              className="flex-1 h-20 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-indigo-700 active:scale-95 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-30 disabled:grayscale"
            >
              <ShoppingCart className="h-5 w-5" /> {currentStock > 0 ? 'ADICIONAR AO CARRINHO' : 'ESGOTADO'}
            </button>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10">
             {[
               { icon: Truck, title: 'Envio Expresso', desc: '48h para Luanda' },
               { icon: RotateCcw, title: 'Troca Grátis', desc: 'Até 15 dias úteis' },
               { icon: ShieldCheck, title: 'Garantia Nexus', desc: '2 anos de cobertura' }
             ].map((b, i) => (
               <div key={i} className="flex flex-col gap-3 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                 <b.icon className="h-6 w-6 text-indigo-600" />
                 <div><p className="text-xs font-black uppercase text-gray-900">{b.title}</p><p className="text-[10px] text-gray-500 font-bold">{b.desc}</p></div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
