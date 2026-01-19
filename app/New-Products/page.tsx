"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, Star, Package, ArrowLeft, Loader2, ChevronLeft, ChevronRight, Heart, Share2, Truck, RotateCcw, Shield, X } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: string;
    description?: string;
    image?: string;
    featured?: boolean;
    images?: string[]; // Multiple images for product gallery
    rating?: number;
    reviewsCount?: number;
    color?: string;
    size?: string;
    deliveryInfo?: string;
    returnInfo?: string;
}

interface OrderFormData {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    productId: string;
    productName: string;
    quantity: number;
    shippingAddress: string;
    deliveryOption?: string;
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [showProductDetail, setShowProductDetail] = useState(false);
    const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [wishlist, setWishlist] = useState<string[]>([]);
    
    const [orderForm, setOrderForm] = useState<OrderFormData>({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        productId: "",
        productName: "",
        quantity: 1,
        shippingAddress: "",
        deliveryOption: "standard"
    });
    const [submitting, setSubmitting] = useState(false);

    // Load products from Firebase
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            if (!db) throw new Error("Firestore is not initialized.");
            const querySnapshot = await getDocs(collection(db!, "products"));
            const productsData: Product[] = [];
            querySnapshot.forEach((doc) => {
                productsData.push({ id: doc.id, ...doc.data() } as Product);
            });
            setProducts(productsData);
        } catch (error) {
            console.error("Error loading products:", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    // Handle product detail view
    const handleViewDetails = (product: Product) => {
        setSelectedProductDetail(product);
        setCurrentImageIndex(0);
        setSelectedSize(product.size?.split(",")[0] || "");
        setShowProductDetail(true);
    };

    // Handle image navigation
    const nextImage = () => {
        if (selectedProductDetail?.images) {
            setCurrentImageIndex((prev) => 
                prev === selectedProductDetail.images!.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        if (selectedProductDetail?.images) {
            setCurrentImageIndex((prev) => 
                prev === 0 ? selectedProductDetail.images!.length - 1 : prev - 1
            );
        }
    };

    // Handle Order Now button click from detail view
    const handleOrderNow = (product: Product) => {
        setSelectedProduct(product);
        setOrderForm({
            ...orderForm,
            productId: product.id,
            productName: product.name,
            quantity: 1,
            deliveryOption: "standard"
        });
        setShowOrderForm(true);
        setShowProductDetail(false);
    };

    // Handle order submission
    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProduct) return;
        if (!db) {
            toast.error("Firestore is not initialized.");
            return;
        }
        if (orderForm.quantity > selectedProduct.stock) {
            toast.error(`Only ${selectedProduct.stock} items available in stock`);
            return;
        }

        setSubmitting(true);

        try {
            // Create order data
            const orderData = {
                ...orderForm,
                totalAmount: selectedProduct.price * orderForm.quantity,
                orderDate: new Date(),
                status: "Pending" as const,
                deliveryOption: orderForm.deliveryOption
            };

            // Save order to Firebase
            const orderRef = await addDoc(collection(db!, "orders"), orderData);

            // Update product stock
            const newStock = selectedProduct.stock - orderForm.quantity;
            await updateDoc(doc(db!, "products", selectedProduct.id), {
                stock: newStock,
                status: newStock === 0 ? "Out of Stock" :
                    newStock <= 10 ? "Low Stock" : "In Stock"
            });

            // Update local state
            setProducts(products.map(product =>
                product.id === selectedProduct.id
                    ? { ...product, stock: newStock }
                    : product
            ));

            toast.success("Order placed successfully!");

            // Reset form
            setOrderForm({
                customerName: "",
                customerEmail: "",
                customerPhone: "",
                productId: "",
                productName: "",
                quantity: 1,
                shippingAddress: "",
                deliveryOption: "standard"
            });
            setShowOrderForm(false);
            setSelectedProduct(null);

        } catch (error) {
            console.error("Error placing order:", error);
            toast.error("Failed to place order. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle wishlist
    const toggleWishlist = (productId: string) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    // Filter products based on search
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get featured products
    const featuredProducts = products.filter(product => product.featured);

    // Product sizes
    const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

    return (
        <div className="min-h-screen bg-[#FFFFFF] py-10">
            <Toaster position="top-right" />

            {/* Header */}
            <header className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-serif font-bold text-gray-900">Miss Rose Shop</h1>
                                <p className="text-md font-serif text-gray-600">Browse and order our products</p>
                            </div>
                        </div>

                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C67F90] cursor-pointer"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Featured Products Section */}
                {featuredProducts.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <Star className="text-yellow-500 fill-yellow-500" size={24} />
                            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {featuredProducts.slice(0, 3).map((product) => (
                                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                                    <div className="relative">
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            />
                                        ) : product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center cursor-pointer">
                                                <Package className="text-gray-400" size={48} />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => toggleWishlist(product.id)}
                                            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition cursor-pointer"
                                        >
                                            <Heart 
                                                size={20} 
                                                className={wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"}
                                            />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-gray-900 cursor-pointer hover:text-[#C67F90]" onClick={() => handleViewDetails(product)}>{product.name}</h3>
                                            <span className="text-sm text-gray-500 cursor-pointer">{product.category}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 cursor-pointer">{product.description}</p>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-gray-900 cursor-pointer">${product.price.toFixed(2)}</span>
                                                {product.rating && (
                                                    <div className="flex items-center cursor-pointer">
                                                        <Star className="text-yellow-500 fill-yellow-500" size={14} />
                                                        <span className="text-sm text-gray-600 ml-1 cursor-pointer">{product.rating}</span>
                                                        {product.reviewsCount && (
                                                            <span className="text-sm text-gray-500 ml-1 cursor-pointer">({product.reviewsCount})</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full cursor-pointer ${product.status === "In Stock" ? "bg-green-100 text-green-800" :
                                                product.status === "Low Stock" ? "bg-yellow-100 text-yellow-800" :
                                                    "bg-red-100 text-red-800"
                                                }`}>
                                                {product.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewDetails(product)}
                                                className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition cursor-pointer"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => handleOrderNow(product)}
                                                disabled={product.status === "Out of Stock"}
                                                className={`flex-1 py-2 rounded-lg font-medium transition cursor-pointer ${product.status === "Out of Stock"
                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    : "bg-[#C67F90] text-white hover:bg-[#b36a7a]"
                                                    }`}
                                            >
                                                Order Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Products Section */}
                <div>
                    <div className="flex items-center gap-2 mb-11">
                        <ShoppingBag size={24} className="text-gray-700 cursor-pointer" />
                        <h2 className="text-2xl font-serif font-bold text-gray-900 cursor-pointer">All Products</h2>
                        <span className="text-sm font-serif text-gray-500 ml-2 cursor-pointer">({filteredProducts.length} products)</span>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="animate-spin font-serif mx-auto text-[#C67F90] cursor-pointer" size={48} />
                            <p className="mt-4 text-gray-600 cursor-pointer">Loading products...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <Package className="mx-auto text-gray-400 mb-4 cursor-pointer" size={48} />
                            <h3 className="text-lg font-serif font-medium text-gray-900 mb-2 cursor-pointer">No products found</h3>
                            <p className="text-gray-500 font-serif cursor-pointer">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                                    <div className="relative">
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                onClick={() => handleViewDetails(product)}
                                            />
                                        ) : product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                onClick={() => handleViewDetails(product)}
                                            />
                                        ) : (
                                            <div 
                                                className="w-full h-48 bg-gray-200 flex items-center justify-center cursor-pointer"
                                                onClick={() => handleViewDetails(product)}
                                            >
                                                <Package className="text-gray-400" size={48} />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => toggleWishlist(product.id)}
                                            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition cursor-pointer"
                                        >
                                            <Heart 
                                                size={20} 
                                                className={wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"}
                                            />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 
                                                className="font-bold font-serif text-lg text-gray-900 cursor-pointer hover:text-[#C67F90]"
                                                onClick={() => handleViewDetails(product)}
                                            >
                                                {product.name}
                                            </h3>
                                            {product.featured && (
                                                <Star className="text-yellow-500 fill-yellow-500 cursor-pointer" size={18} />
                                            )}
                                        </div>
                                        <p className="text-sm font-serif text-gray-500 mb-2 cursor-pointer">{product.category}</p>
                                        <p className="text-sm font-serif text-gray-600 mb-3 line-clamp-2 cursor-pointer">{product.description}</p>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold font-serif text-gray-900 cursor-pointer">${product.price.toFixed(2)}</span>
                                                {product.rating && (
                                                    <div className="flex items-center cursor-pointer">
                                                        <Star className="text-yellow-500 fill-yellow-500 cursor-pointer" size={14} />
                                                        <span className="text-sm text-gray-600 ml-1 cursor-pointer">{product.rating}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full cursor-pointer ${product.status === "In Stock" ? "bg-green-100 text-green-800" :
                                                product.status === "Low Stock" ? "bg-yellow-100 text-yellow-800" :
                                                    "bg-red-100 text-red-800"
                                                }`}>
                                                {product.status}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewDetails(product)}
                                                className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition cursor-pointer"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => handleOrderNow(product)}
                                                disabled={product.status === "Out of Stock"}
                                                className={`flex-1 py-2 rounded-lg font-medium transition cursor-pointer ${product.status === "Out of Stock"
                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    : "bg-[#C67F90] text-white hover:bg-[#b36a7a]"
                                                    }`}
                                            >
                                                {product.status === "Out of Stock" ? "Out of Stock" : "Order Now"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Product Detail Modal (Screenshot style) - RESPONSIVE VERSION */}
            {showProductDetail && selectedProductDetail && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl md:max-w-3xl lg:max-w-6xl max-h-[95vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 cursor-pointer">{selectedProductDetail.name}</h3>
                                <p className="text-sm sm:text-base text-gray-600 cursor-pointer">Product details & Reviews</p>
                            </div>
                            <button
                                onClick={() => setShowProductDetail(false)}
                                className="p-1 sm:p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                            >
                                <X size={20} className="sm:size-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                            {/* Left Column - Images */}
                            <div className="order-2 lg:order-1">
                                {/* Main Image */}
                                <div className="relative mb-3 sm:mb-4">
                                    <img
                                        src={selectedProductDetail.images?.[currentImageIndex] || selectedProductDetail.image || ""}
                                        alt={selectedProductDetail.name}
                                        className="w-full h-48 sm:h-64 md:h-80 lg:h-[400px] object-cover rounded-lg cursor-pointer"
                                    />
                                    {selectedProductDetail.images && selectedProductDetail.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 p-1 sm:p-2 bg-white/80 rounded-full hover:bg-white cursor-pointer"
                                            >
                                                <ChevronLeft size={16} className="sm:size-6" />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 p-1 sm:p-2 bg-white/80 rounded-full hover:bg-white cursor-pointer"
                                            >
                                                <ChevronRight size={16} className="sm:size-6" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Thumbnail Gallery */}
                                {selectedProductDetail.images && selectedProductDetail.images.length > 1 && (
                                    <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-2">
                                        {selectedProductDetail.images.map((img, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 cursor-pointer ${index === currentImageIndex ? 'border-[#C67F90]' : 'border-transparent'}`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="w-full h-full object-cover cursor-pointer"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Details */}
                            <div className="order-1 lg:order-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4">
                                    <div className="mb-3 sm:mb-0">
                                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                            <span className="text-2xl sm:text-3xl font-bold text-gray-900 cursor-pointer">${selectedProductDetail.price.toFixed(2)}</span>
                                            <span className="text-base sm:text-lg text-gray-500 line-through cursor-pointer">$16.00</span>
                                            <span className="px-2 py-0.5 sm:py-1 bg-red-100 text-red-800 text-xs sm:text-sm rounded cursor-pointer">50% OFF</span>
                                        </div>
                                        
                                        {selectedProductDetail.rating && (
                                            <div className="flex items-center gap-1 sm:gap-2 cursor-pointer">
                                                <div className="flex cursor-pointer">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={12}
                                                            className={`sm:size-4 cursor-pointer ${i < Math.floor(selectedProductDetail.rating!) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs sm:text-sm text-gray-600 cursor-pointer">
                                                    {selectedProductDetail.rating} ({selectedProductDetail.reviewsCount || 0} reviews)
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex gap-1 sm:gap-2">
                                        <button
                                            onClick={() => toggleWishlist(selectedProductDetail.id)}
                                            className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                        >
                                            <Heart 
                                                size={16}
                                                className="sm:size-5"
                                                fill={wishlist.includes(selectedProductDetail.id) ? "#ef4444" : "none"}
                                                color={wishlist.includes(selectedProductDetail.id) ? "#ef4444" : "#4b5563"}
                                            />
                                        </button>
                                        <button className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <Share2 size={16} className="sm:size-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Color Options */}
                                {selectedProductDetail.color && (
                                    <div className="mb-4 sm:mb-6">
                                        <h4 className="font-medium text-sm sm:text-base mb-1 sm:mb-2 cursor-pointer">Color: <span className="font-normal cursor-pointer">{selectedProductDetail.color}</span></h4>
                                        <div className="flex gap-1 sm:gap-2">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-pink-500 border-2 border-gray-300 cursor-pointer"></div>
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 border-2 border-transparent cursor-pointer"></div>
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black border-2 border-transparent cursor-pointer"></div>
                                        </div>
                                    </div>
                                )}

                                {/* Size Options */}
                                <div className="mb-4 sm:mb-6">
                                    <h4 className="font-medium text-sm sm:text-base mb-1 sm:mb-2 cursor-pointer">Size</h4>
                                    <div className="flex flex-wrap gap-1 sm:gap-2">
                                        {sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-2 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm cursor-pointer ${selectedSize === size ? 'border-[#C67F90] text-[#C67F90]' : 'border-gray-300'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Stock Status */}
                                <div className="mb-4 sm:mb-6">
                                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm cursor-pointer ${selectedProductDetail.status === "In Stock" ? "bg-green-100 text-green-800" :
                                        selectedProductDetail.status === "Low Stock" ? "bg-yellow-100 text-yellow-800" :
                                            "bg-red-100 text-red-800"
                                        }`}>
                                        {selectedProductDetail.status}
                                    </span>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 cursor-pointer">
                                        {selectedProductDetail.stock} units available
                                    </p>
                                </div>

                                {/* Add to Cart Section */}
                                <div className="mb-6 sm:mb-8">
                                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                                        <div className="flex items-center border border-gray-300 rounded-lg w-full sm:w-auto">
                                            <button className="px-3 sm:px-4 py-1.5 sm:py-2 cursor-pointer text-sm sm:text-base">-</button>
                                            <span className="px-3 sm:px-4 py-1.5 sm:py-2 border-x border-gray-300 cursor-pointer text-sm sm:text-base">1</span>
                                            <button className="px-3 sm:px-4 py-1.5 sm:py-2 cursor-pointer text-sm sm:text-base">+</button>
                                        </div>
                                        <button className="w-full sm:w-auto flex-1 py-2 sm:py-3 bg-[#C67F90] text-white rounded-lg font-medium hover:bg-[#b36a7a] transition cursor-pointer text-sm sm:text-base">
                                            Add to cart
                                        </button>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleOrderNow(selectedProductDetail)}
                                        className="w-full py-2 sm:py-3 border-2 border-[#C67F90] text-[#C67F90] rounded-lg font-medium hover:bg-[#C67F90] hover:text-white transition cursor-pointer text-sm sm:text-base"
                                    >
                                        Order Now
                                    </button>
                                </div>

                                {/* Returns Info */}
                                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                                    <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-4 flex items-center gap-1 sm:gap-2 cursor-pointer">
                                        <RotateCcw size={16} className="sm:size-5" /> Returns
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 cursor-pointer">
                                        You have 60 days to return the item(s) using any of the following methods:
                                    </p>
                                    <ul className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
                                        <li className="flex items-center gap-1 sm:gap-2 cursor-pointer">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full cursor-pointer"></div>
                                            Free returns
                                        </li>
                                        <li className="flex items-center gap-1 sm:gap-2 cursor-pointer">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full cursor-pointer"></div>
                                            Returns via USPS Drop-off Service
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Form Modal */}
            {showOrderForm && selectedProduct && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto mx-2">
                        <div className="flex items-center mb-4">
                            <button
                                onClick={() => setShowOrderForm(false)}
                                className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                                disabled={submitting}
                            >
                                <ArrowLeft size={20} className="sm:size-6" />
                            </button>
                            <h3 className="text-lg sm:text-xl font-serif font-bold ml-2 cursor-pointer">Place Your Order</h3>
                        </div>

                        {/* Product Info */}
                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3 sm:gap-4">
                                {selectedProduct.images?.[0] || selectedProduct.image ? (
                                    <img
                                        src={selectedProduct.images?.[0] || selectedProduct.image}
                                        alt={selectedProduct.name}
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover cursor-pointer"
                                    />
                                ) : null}
                                <div>
                                    <h4 className="font-bold font-serif text-base sm:text-lg cursor-pointer">{selectedProduct.name}</h4>
                                    <p className="text-sm sm:text-base text-gray-600 font-serif cursor-pointer">{selectedProduct.category}</p>
                                    <p className="text-xl sm:text-2xl font-bold font-serif text-[#C67F90] cursor-pointer">${selectedProduct.price.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitOrder}>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C67F90] cursor-pointer"
                                        value={orderForm.customerName}
                                        onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="your.email@example.com"
                                        className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C67F90] cursor-pointer"
                                        value={orderForm.customerEmail}
                                        onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+91 9876543210"
                                        className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C67F90] cursor-pointer"
                                        value={orderForm.customerPhone}
                                        onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                {/* Delivery Options */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                                        Delivery Option *
                                    </label>
                                    <div className="space-y-2">
                                        {["standard", "express", "pickup"].map((option) => (
                                            <label key={option} className="flex items-center justify-between p-2 sm:p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <input
                                                        type="radio"
                                                        name="deliveryOption"
                                                        value={option}
                                                        checked={orderForm.deliveryOption === option}
                                                        onChange={(e) => setOrderForm({ ...orderForm, deliveryOption: e.target.value })}
                                                        className="text-[#C67F90] focus:ring-[#C67F90] cursor-pointer"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-xs sm:text-sm capitalize cursor-pointer">{option} delivery</p>
                                                        <p className="text-xs text-gray-600 cursor-pointer">
                                                            {option === "standard" && "3-4 business days"}
                                                            {option === "express" && "3 business days"}
                                                            {option === "pickup" && "Pick up in store"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="font-medium text-xs sm:text-sm cursor-pointer">
                                                    {option === "pickup" ? "Free" : option === "standard" ? "$4.50" : "$9.00"}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                                        Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedProduct.stock}
                                        className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C67F90] cursor-pointer"
                                        value={orderForm.quantity}
                                        onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })}
                                        required
                                        disabled={submitting}
                                    />
                                    <p className="text-xs text-gray-500 mt-1 cursor-pointer">
                                        Available: {selectedProduct.stock} units
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                                        Shipping Address *
                                    </label>
                                    <textarea
                                        placeholder="Enter your complete shipping address"
                                        className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C67F90] cursor-pointer"
                                        rows={3}
                                        value={orderForm.shippingAddress}
                                        onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="pt-3 sm:pt-4 border-t">
                                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                                        <span className="font-medium text-base sm:text-lg cursor-pointer">Total Amount:</span>
                                        <span className="text-xl sm:text-2xl font-bold text-[#C67F90] cursor-pointer">
                                            ${(selectedProduct.price * orderForm.quantity).toFixed(2)}
                                            {orderForm.deliveryOption === "standard" && " + $4.50"}
                                            {orderForm.deliveryOption === "express" && " + $9.00"}
                                        </span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full px-4 py-2 sm:py-3 bg-[#C67F90] text-white rounded-lg hover:bg-[#b36a7a] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base"
                                    >
                                        {submitting ? (
                                            <span className="flex items-center justify-center gap-2 cursor-pointer">
                                                <Loader2 className="animate-spin cursor-pointer sm:size-6" size={16} />
                                                Placing Order...
                                            </span>
                                        ) : (
                                            "Confirm Order"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}