"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Product type
type Product = {
    id: string;
    img: string;
    title: string;
    price: string;
    originalPrice: string;
    discount: string;
    stock: number;
};


const products: Product[] = [
    { id: "1", img: "card1.png", title: "Miss Rose Silk Flawless Foundation", price: "$16.00", originalPrice: "$32.00", discount: "50% OFF", stock: 200 },
    { id: "2", img: "card2.png", title: "Miss Rose Full Coverage Concealer", price: "$12.99", originalPrice: "$25.99", discount: "50% OFF", stock: 150 },
    { id: "3", img: "card3.png", title: "Miss Rose Perfect Cover 24H Hydrating Concealer", price: "$18.50", originalPrice: "$37.00", discount: "50% OFF", stock: 180 },
    { id: "4", img: "card4.png", title: "Miss Rose Full Coverage Matte Foundation", price: "$22.00", originalPrice: "$44.00", discount: "50% OFF", stock: 120 },
    { id: "5", img: "card5.png", title: "Miss Rose Silk Radiance BB Cream", price: "$15.99", originalPrice: "$31.98", discount: "50% OFF", stock: 200 },
    { id: "6", img: "card6.png", title: "Miss Rose Glossy Gloss Lip Comfort", price: "$8.99", originalPrice: "$17.98", discount: "50% OFF", stock: 250 },
    { id: "7", img: "card7.png", title: "Miss Rose Cat Eye Mascara Permanent", price: "$10.50", originalPrice: "$21.00", discount: "50% OFF", stock: 170 },
    { id: "8", img: "card8.png", title: "Miss Rose Two Way Compact Powder", price: "$14.25", originalPrice: "$28.50", discount: "50% OFF", stock: 140 },
    { id: "9", img: "card3.png", title: "Miss Rose Perfect Cover 24H Hydrating Concealer", price: "$18.50", originalPrice: "$37.00", discount: "50% OFF", stock: 160 },
    { id: "10", img: "card4.png", title: "Miss Rose Full Coverage Matte Foundation", price: "$22.00", originalPrice: "$44.00", discount: "50% OFF", stock: 110 },
    { id: "11", img: "card5.png", title: "Miss Rose Silk Radiance BB Cream", price: "$15.99", originalPrice: "$31.98", discount: "50% OFF", stock: 130 },
    { id: "12", img: "card6.png", title: "Miss Rose Glossy Gloss Lip Comfort", price: "$8.99", originalPrice: "$17.98", discount: "50% OFF", stock: 90 },
];

export default function ProductForm() {
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedSize, setSelectedSize] = useState<string>("M");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState<string>("details");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const productId = searchParams.get('productId') || "1";
    const sizes: string[] = ["XS", "S", "M", "L", "XL", "XXL"];

    useEffect(() => {
        const product = products.find((p) => p.id === productId) || null;
        setSelectedProduct(product);
    }, [productId]);

    const handleAddToCart = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            alert(`Added ${quantity} item(s) to cart!`);
            setIsLoading(false);
        }, 500);
    };

    const handleOrderNow = () => {
        router.push(`/Checkout?productId=${productId}&quantity=${quantity}&size=${selectedSize}`);
    };

    const handleBack = () => {
        router.back();
    };

    if (!selectedProduct) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p>Loading product details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-serif py-10 pb-10">
            {/* Back Button */}
            <div className="container mx-auto px-4 py-6">
                <button
                    onClick={handleBack}
                    className="flex items-center text-gray-600 hover:text-black mb-6"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
            </div>

            <div className="container mx-auto px-4 pb-12">
                <div className="max-w-6xl mx-auto">
                    {/* Breadcrumb */}
                    <div className="text-sm text-gray-500 mb-6">
                        Home / Makeup / Foundation / {selectedProduct.title}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Product Image */}
                        <div className="bg-gray-50 rounded-2xl p-8">
                            <div className="aspect-square rounded-xl overflow-hidden bg-white">
                                <img
                                    src={`/${selectedProduct.img}`}
                                    alt={selectedProduct.title}
                                    className="w-full h-full object-contain p-4"
                                />
                            </div>
                            {/* Thumbnails */}
                            <div className="flex space-x-4 mt-6 overflow-x-auto">
                                {[1, 2, 3, 4].map((num) => (
                                    <div key={num} className="w-20 h-20 rounded-lg bg-white border border-gray-200 shrink-0">
                                        <img
                                            src={`/card${num}.png`}
                                            alt={`Thumbnail ${num}`}
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div>
                            {/* Brand & Title */}
                            <div className="mb-4">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">MISS ROSE</span>
                                <h1 className="text-3xl font-bold text-gray-900 mt-1">{selectedProduct.title}</h1>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center mb-6">
                                <div className="flex text-yellow-400 mr-2">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-gray-600">4.8 • 256 reviews</span>
                            </div>

                            {/* Price Section */}
                            <div className="mb-8">
                                <div className="flex items-center mb-2">
                                    <span className="text-4xl font-bold text-gray-900">{selectedProduct.price}</span>
                                    <span className="ml-3 text-2xl text-gray-500 line-through">{selectedProduct.originalPrice}</span>
                                    <span className="ml-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                                        {selectedProduct.discount}
                                    </span>
                                </div>
                                <p className="text-green-600 font-medium">
                                    <svg className="w-5 h-5 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Save ${(parseFloat(selectedProduct.originalPrice.replace('$', '')) - parseFloat(selectedProduct.price.replace('$', ''))).toFixed(2)}
                                </p>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 mb-6">
                                <nav className="flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab("details")}
                                        className={`py-2 px-1 font-medium text-sm ${activeTab === "details" ? "text-black border-b-2 border-black" : "text-gray-500"}`}
                                    >
                                        Product details & Reviews
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("shipping")}
                                        className={`py-2 px-1 font-medium text-sm ${activeTab === "shipping" ? "text-black border-b-2 border-black" : "text-gray-500"}`}
                                    >
                                        Shipping & Returns
                                    </button>
                                </nav>
                            </div>

                            {/* Size Selection */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-3">Size</h3>
                                <div className="flex flex-wrap gap-3">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`w-14 h-14 flex items-center justify-center border rounded-lg font-medium transition-all ${selectedSize === size ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-gray-400'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    <strong>Size Guide:</strong> Check our size chart for the perfect fit
                                </p>
                            </div>

                            {/* Stock Status */}
                            <div className="mb-8">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                    <span className="font-semibold text-green-700">In Stock</span>
                                </div>
                                <p className="text-gray-600 mt-1">
                                    {selectedProduct.stock} units available
                                </p>
                            </div>

                            {/* Quantity & Add to Cart */}
                            <div className="mb-8">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                            className="w-12 h-12 flex items-center justify-center text-xl hover:bg-gray-50"
                                        >
                                            -
                                        </button>
                                        <div className="w-16 h-12 flex items-center justify-center text-lg font-semibold border-x border-gray-300">
                                            {quantity}
                                        </div>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-12 h-12 flex items-center justify-center text-xl hover:bg-gray-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isLoading}
                                        className="flex-1 h-12 bg-white border-2 border-black text-black font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                </svg>
                                                Adding...
                                            </span>
                                        ) : "Add to cart"}
                                    </button>
                                </div>
                            </div>

                            {/* Order Now Button */}
                            <button
                                onClick={handleOrderNow}
                                className="w-full h-14 bg-[#C67F90] text-white font-semibold rounded-lg hover:bg-[#B36A7A] transition-colors mb-8"
                            >
                                Order Now
                            </button>

                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}