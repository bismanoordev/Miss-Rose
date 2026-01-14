"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, Star, Package, ArrowLeft, Loader2 } from "lucide-react";
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
}

interface OrderFormData {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    productId: string;
    productName: string;
    quantity: number;
    shippingAddress: string;
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orderForm, setOrderForm] = useState<OrderFormData>({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        productId: "",
        productName: "",
        quantity: 1,
        shippingAddress: ""
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

    // Handle Order Now button click
    const handleOrderNow = (product: Product) => {
        setSelectedProduct(product);
        setOrderForm({
            ...orderForm,
            productId: product.id,
            productName: product.name,
            quantity: 1
        });
        setShowOrderForm(true);
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
                status: "Pending" as const
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
                shippingAddress: ""
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

    // Filter products based on search
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get featured products
    const featuredProducts = products.filter(product => product.featured);

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-4">
                            {/* <Link
                                href="/"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft size={20} />
                                <span className="hidden sm:inline">Back to Dashboard</span>
                            </Link> */}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Miss Rose Shop</h1>
                                <p className="text-sm text-gray-600">Browse and order our products</p>
                            </div>
                        </div>
                        
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C67F90]"
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
                                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    {product.image && (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                                            <span className="text-sm text-gray-500">{product.category}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${product.status === "In Stock" ? "bg-green-100 text-green-800" :
                                                    product.status === "Low Stock" ? "bg-yellow-100 text-yellow-800" :
                                                        "bg-red-100 text-red-800"
                                                }`}>
                                                {product.status}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleOrderNow(product)}
                                            disabled={product.status === "Out of Stock"}
                                            className={`w-full py-2 rounded-lg font-medium transition ${product.status === "Out of Stock"
                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    : "bg-[#C67F90] text-white hover:bg-[#b36a7a]"
                                                }`}
                                        >
                                            {product.status === "Out of Stock" ? "Out of Stock" : "Order Now"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Products Section */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <ShoppingBag size={24} className="text-gray-700" />
                        <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
                        <span className="text-sm text-gray-500 ml-2">({filteredProducts.length} products)</span>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="animate-spin mx-auto text-[#C67F90]" size={48} />
                            <p className="mt-4 text-gray-600">Loading products...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <Package className="mx-auto text-gray-400 mb-4" size={48} />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    {product.image && (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                                            {product.featured && (
                                                <Star className="text-yellow-500 fill-yellow-500" size={18} />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${product.status === "In Stock" ? "bg-green-100 text-green-800" :
                                                    product.status === "Low Stock" ? "bg-yellow-100 text-yellow-800" :
                                                        "bg-red-100 text-red-800"
                                                }`}>
                                                {product.status}
                                            </span>
                                        </div>
                                        
                                        <button
                                            onClick={() => handleOrderNow(product)}
                                            disabled={product.status === "Out of Stock"}
                                            className={`w-full py-2 rounded-lg font-medium transition ${product.status === "Out of Stock"
                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    : "bg-[#C67F90] text-white hover:bg-[#b36a7a]"
                                                }`}
                                        >
                                            {product.status === "Out of Stock" ? "Out of Stock" : "Order Now"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Order Form Modal */}
            {showOrderForm && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Place Your Order</h3>
                            <button
                                onClick={() => setShowOrderForm(false)}
                                className="p-1 hover:bg-gray-100 rounded"
                                disabled={submitting}
                            >
                                <ArrowLeft size={24} />
                            </button>
                        </div>
                        
                        {/* Product Info */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                                {selectedProduct.image && (
                                    <img
                                        src={selectedProduct.image}
                                        alt={selectedProduct.name}
                                        className="w-20 h-20 rounded-lg object-cover"
                                    />
                                )}
                                <div>
                                    <h4 className="font-bold text-lg">{selectedProduct.name}</h4>
                                    <p className="text-gray-600">{selectedProduct.category}</p>
                                    <p className="text-2xl font-bold text-[#C67F90]">${selectedProduct.price.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitOrder}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C67F90]"
                                        value={orderForm.customerName}
                                        onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="your.email@example.com"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C67F90]"
                                        value={orderForm.customerEmail}
                                        onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+91 9876543210"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C67F90]"
                                        value={orderForm.customerPhone}
                                        onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedProduct.stock}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C67F90]"
                                        value={orderForm.quantity}
                                        onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })}
                                        required
                                        disabled={submitting}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Available: {selectedProduct.stock} units
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Shipping Address *
                                    </label>
                                    <textarea
                                        placeholder="Enter your complete shipping address"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C67F90]"
                                        rows={3}
                                        value={orderForm.shippingAddress}
                                        onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-medium text-lg">Total Amount:</span>
                                        <span className="text-2xl font-bold text-[#C67F90]">
                                            ${(selectedProduct.price * orderForm.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full px-4 py-3 bg-[#C67F90] text-white rounded-lg hover:bg-[#b36a7a] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="animate-spin" size={20} />
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