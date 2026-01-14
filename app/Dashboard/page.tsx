"use client";

import { useState, useRef, useEffect } from "react";
import {
    ShoppingBag,
    Users,
    Package,
    DollarSign,
    Plus,
    Edit,
    Trash2,
    Search,
    Eye,
    X,
    BarChart3,
    TrendingUp,
    ShoppingCart,
    Upload,
    Image as ImageIcon,
    Star,
    ArrowLeft,
    Store,
    Link as LinkIcon,
    MoreVertical
} from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

// Interfaces
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
    createdAt: Date;
}

interface CustomerOrder {
    id?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    productId: string;
    productName: string;
    quantity: number;
    totalAmount: number;
    orderDate: Date;
    status: "Pending" | "Confirmed" | "Shipped" | "Delivered";
    shippingAddress: string;
}

interface Order {
    id: string;
    customer: string;
    date: string;
    total: number;
    status: "Pending" | "Processing" | "Delivered";
}

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    orders: number;
    joinDate: string;
    avatar?: string;
}

export default function Dashboard() {
    // Hydration-safe state for current date (for product creation)
    const [now, setNow] = useState<Date | null>(null);
    useEffect(() => {
        setNow(new Date());
    }, []);

    // State management
    const [activeTab, setActiveTab] = useState<"Dashboard" | "Products" | "Orders" | "Customers" | "Shop">("Dashboard");
    const [products, setProducts] = useState<Product[]>([]);
    const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [mobileView, setMobileView] = useState<"table" | "cards">("cards");
    
    // New state for image upload method
    const [imageMethod, setImageMethod] = useState<"upload" | "url">("upload");

    // New product form state
    const [newProduct, setNewProduct] = useState({
        name: "",
        category: "",
        price: "",
        stock: "",
        description: "",
        image: "",
        featured: false
    });

    // Orders state (manual orders)
    const [orders, setOrders] = useState<Order[]>([
        { id: "ORD001", customer: "John Doe", date: "2024-01-15", total: 129.98, status: "Delivered" },
        { id: "ORD002", customer: "Jane Smith", date: "2024-01-14", total: 79.99, status: "Processing" },
    ]);

    // Hydration-safe state for delete confirmation
    const [deleteId, setDeleteId] = useState<string | null>(null);
    useEffect(() => {
        if (deleteId) {
            if (window.confirm("Are you sure you want to delete this product?")) {
                actuallyDeleteProduct(deleteId);
            }
            setDeleteId(null);
        }
    }, [deleteId]);

    // Customers state
    const [customers, setCustomers] = useState<Customer[]>([
        {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            phone: "+1234567890",
            orders: 5,
            joinDate: "2023-12-01",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        },
        {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "+1234567891",
            orders: 3,
            joinDate: "2023-12-15",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop"
        },
    ]);

    // Load products from Firebase
    const loadProducts = async () => {
        try {
            setLoading(true);
            if (!db) throw new Error("Firestore is not initialized");
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

    // Load customer orders from Firebase
    const loadCustomerOrders = async () => {
        try {
            setLoading(true);
            if (!db) throw new Error("Firestore is not initialized");
            const querySnapshot = await getDocs(collection(db!, "orders"));
            const ordersData: CustomerOrder[] = [];
            querySnapshot.forEach((doc) => {
                ordersData.push({ id: doc.id, ...doc.data() } as CustomerOrder);
            });
            setCustomerOrders(ordersData);
        } catch (error) {
            console.error("Error loading orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
        loadCustomerOrders();
        // Check if mobile
        const checkMobile = () => {
            if (window.innerWidth < 768) {
                setMobileView("cards");
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setNewProduct({ ...newProduct, image: imageUrl });
            setImagePreview(imageUrl);
        }
    };

    // Handle URL input change
    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setNewProduct({ ...newProduct, image: url });
        setImagePreview(url);
    };

    // Add/Edit Product
    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(newProduct.price) || 0;
        const stock = parseInt(newProduct.stock) || 0;

        let status = "Out of Stock";
        if (stock > 20) status = "In Stock";
        else if (stock > 0) status = "Low Stock";

        // Use hydration-safe date
        const productData = {
            name: newProduct.name,
            category: newProduct.category,
            price,
            stock,
            status,
            description: newProduct.description,
            image: newProduct.image,
            featured: newProduct.featured,
            createdAt: now || new Date()
        };

        try {
            if (!db) throw new Error("Firestore is not initialized");
            if (editingProduct) {
                // Update existing product
                await updateDoc(doc(db!, "products", editingProduct.id), productData);
                toast.success("Product updated successfully!");
                setProducts(products.map(p => 
                    p.id === editingProduct.id ? { ...p, ...productData, id: editingProduct.id } : p
                ));
            } else {
                // Add new product
                const docRef = await addDoc(collection(db!, "products"), productData);
                toast.success("Product added successfully!");
                setProducts([...products, { id: docRef.id, ...productData }]);
            }

            resetProductForm();
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error("Failed to save product");
        }
    };

    // Delete product
    const deleteProduct = async (id: string) => {
        setDeleteId(id);
    };

    // Actual delete logic, called after confirmation
    const actuallyDeleteProduct = async (id: string) => {
        try {
            if (!db) throw new Error("Firestore is not initialized");
            await deleteDoc(doc(db!, "products", id));
            setProducts(products.filter(p => p.id !== id));
            toast.success("Product deleted successfully!");
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Failed to delete product");
        }
    };

    // Edit product
    const editProduct = (product: Product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name,
            category: product.category,
            price: product.price.toString(),
            stock: product.stock.toString(),
            description: product.description || "",
            image: product.image || "",
            featured: product.featured || false
        });
        setImagePreview(product.image || null);
        setShowAddProduct(true);
        
        // Set image method based on whether image is a URL or local
        if (product.image && product.image.startsWith('http')) {
            setImageMethod("url");
        } else {
            setImageMethod("upload");
        }
    };

    // Toggle featured status
    const toggleFeatured = async (product: Product) => {
        try {
            if (!db) throw new Error("Firestore is not initialized");
            const updatedProduct = { ...product, featured: !product.featured };
            await updateDoc(doc(db!, "products", product.id), {
                featured: updatedProduct.featured
            });
            setProducts(products.map(p => 
                p.id === product.id ? updatedProduct : p
            ));
            toast.success("Product updated!");
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Failed to update product");
        }
    };

    // Reset form
    const resetProductForm = () => {
        setNewProduct({
            name: "",
            category: "",
            price: "",
            stock: "",
            description: "",
            image: "",
            featured: false
        });
        setImagePreview(null);
        setEditingProduct(null);
        setShowAddProduct(false);
        setImageMethod("upload");
    };

    // Dashboard stats
    const stats = {
        totalSales: customerOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        totalOrders: customerOrders.length,
        totalProducts: products.length,
        totalCustomers: customers.length,
        pendingOrders: customerOrders.filter(order => order.status === "Pending").length,
        lowStockProducts: products.filter(product => product.status === "Low Stock").length,
        featuredProducts: products.filter(product => product.featured).length
    };

    // Filtered products
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Categories
    const categories = Array.from(new Set(products.map(p => p.category)));

    // Get product image by productId
    const getProductImage = (productId: string) => {
        const product = products.find(p => p.id === productId);
        return product?.image || null;
    };

    // Filter customer orders to only show orders for products that exist in our products list
    const validCustomerOrders = customerOrders.filter(order => 
        products.some(product => product.id === order.productId)
    );

    // PRODUCTS PAGE COMPONENT - FULLY RESPONSIVE
    const renderProductsPage = () => {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Products Management</h2>
                        <p className="text-sm text-gray-500 mt-1">{products.length} products</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setShowAddProduct(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C67F90] to-pink-400 text-white rounded-lg hover:opacity-90 transition w-full sm:w-auto justify-center"
                        >
                            <Plus size={20} /> <span>Add Product</span>
                        </button>
                        {/* Mobile view toggle */}
                        <button
                            onClick={() => setMobileView(mobileView === "cards" ? "table" : "cards")}
                            className="md:hidden p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="Toggle view"
                        >
                            {mobileView === "cards" ? (
                                <span className="text-sm">Table</span>
                            ) : (
                                <span className="text-sm">Cards</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Stats bar - Responsive */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-xs sm:text-sm text-gray-500">Total Products</p>
                        <p className="text-xl sm:text-2xl font-bold">{products.length}</p>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-xs sm:text-sm text-gray-500">Featured</p>
                        <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.featuredProducts}</p>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-xs sm:text-sm text-gray-500">Low Stock</p>
                        <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.lowStockProducts}</p>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-xs sm:text-sm text-gray-500">Out of Stock</p>
                        <p className="text-xl sm:text-2xl font-bold text-red-600">{products.filter(p => p.status === "Out of Stock").length}</p>
                    </div>
                </div>

                {/* Search bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Products table - Mobile responsive with cards */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <Package className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <button
                            onClick={() => setShowAddProduct(true)}
                            className="px-4 py-2 bg-gradient-to-r from-[#C67F90] to-pink-400 text-white rounded-lg hover:opacity-90 transition"
                        >
                            Add Your First Product
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                            <div className="min-w-[600px]">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    {product.image ? (
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                                            <ImageIcon className="text-gray-400" size={24} />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900 flex items-center gap-2">
                                                        {product.name}
                                                        {product.featured && (
                                                            <Star className="text-yellow-500 fill-yellow-500" size={16} />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">${product.price.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === "In Stock" ? "bg-green-100 text-green-800" :
                                                            product.status === "Low Stock" ? "bg-yellow-100 text-yellow-800" :
                                                                "bg-red-100 text-red-800"
                                                        }`}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => toggleFeatured(product)}
                                                            className={`p-1 rounded ${product.featured ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                                                            title={product.featured ? "Remove from featured" : "Mark as featured"}
                                                        >
                                                            <Star className={product.featured ? "fill-yellow-500" : ""} size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => editProduct(product)}
                                                            className="p-1 text-pink-600 hover:text-pink-900 hover:bg-pink-50 rounded"
                                                            title="Edit"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteProduct(product.id)}
                                                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile View - Updated for better responsiveness */}
                        <div className="md:hidden">
                            {mobileView === "cards" ? (
                                // Card Layout for Mobile
                                <div className="space-y-4">
                                    {filteredProducts.map((product) => (
                                        <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    {product.image ? (
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                                            <ImageIcon className="text-gray-400" size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-gray-900 flex items-center gap-2 mb-1">
                                                                <span className="truncate">{product.name}</span>
                                                                {product.featured && (
                                                                    <Star className="text-yellow-500 fill-yellow-500 flex-shrink-0" size={16} />
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-1 mb-2">
                                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                                                    {product.category}
                                                                </span>
                                                                <span className={`px-2 py-1 text-xs rounded-full ${product.status === "In Stock" ? "bg-green-100 text-green-800" :
                                                                        product.status === "Low Stock" ? "bg-yellow-100 text-yellow-800" :
                                                                            "bg-red-100 text-red-800"
                                                                    }`}>
                                                                    {product.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            <button
                                                                onClick={() => toggleFeatured(product)}
                                                                className={`p-1 rounded ${product.featured ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                                                                title={product.featured ? "Remove from featured" : "Mark as featured"}
                                                            >
                                                                <Star className={product.featured ? "fill-yellow-500" : ""} size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => editProduct(product)}
                                                                className="p-1 text-pink-600 hover:text-pink-900 hover:bg-pink-50 rounded"
                                                                title="Edit"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteProduct(product.id)}
                                                                className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
                                                        <div className="flex items-center gap-4">
                                                            <div>
                                                                <div className="text-sm text-gray-500">Price</div>
                                                                <div className="font-medium text-gray-900">${product.price.toFixed(2)}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm text-gray-500">Stock</div>
                                                                <div className="font-medium text-gray-900">{product.stock}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Mobile Table View with Horizontal Scroll
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <div className="inline-block min-w-full align-middle">
                                            <div className="overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Product
                                                            </th>
                                                            <th scope="col" className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Price
                                                            </th>
                                                            <th scope="col" className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Stock
                                                            </th>
                                                            <th scope="col" className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Status
                                                            </th>
                                                            <th scope="col" className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {filteredProducts.map((product) => (
                                                            <tr key={product.id} className="hover:bg-gray-50">
                                                                <td className="py-3 px-2">
                                                                    <div className="flex items-center">
                                                                        <div className="flex-shrink-0 h-10 w-10 mr-2">
                                                                            {product.image ? (
                                                                                <img
                                                                                    src={product.image}
                                                                                    alt={product.name}
                                                                                    className="h-10 w-10 rounded-lg object-cover"
                                                                                />
                                                                            ) : (
                                                                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                                    <ImageIcon className="text-gray-400" size={20} />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                                                                {product.name}
                                                                                {product.featured && (
                                                                                    <Star className="inline ml-1 text-yellow-500 fill-yellow-500" size={12} />
                                                                                )}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                                                                {product.category}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    ${product.price.toFixed(2)}
                                                                </td>
                                                                <td className="py-3 px-2 whitespace-nowrap text-sm text-gray-500">
                                                                    {product.stock}
                                                                </td>
                                                                <td className="py-3 px-2 whitespace-nowrap">
                                                                    <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${product.status === "In Stock" ? "bg-green-100 text-green-800" :
                                                                            product.status === "Low Stock" ? "bg-yellow-100 text-yellow-800" :
                                                                                "bg-red-100 text-red-800"
                                                                        }`}>
                                                                        {product.status === "In Stock" ? "In" : product.status === "Low Stock" ? "Low" : "Out"}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-2 whitespace-nowrap text-sm font-medium">
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            onClick={() => toggleFeatured(product)}
                                                                            className={`p-1 rounded ${product.featured ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                                                                            title={product.featured ? "Remove from featured" : "Mark as featured"}
                                                                        >
                                                                            <Star className={product.featured ? "fill-yellow-500" : ""} size={14} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => editProduct(product)}
                                                                            className="p-1 text-pink-600 hover:text-pink-900 hover:bg-pink-50 rounded"
                                                                            title="Edit"
                                                                        >
                                                                            <Edit size={14} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => deleteProduct(product.id)}
                                                                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    };

    // CUSTOMERS PAGE COMPONENT (Customer Orders) - FULLY RESPONSIVE
    const renderCustomersPage = () => {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Customer Orders</h2>
                        <p className="text-sm text-gray-500 mt-1">{validCustomerOrders.length} orders</p>
                    </div>
                    {/* Mobile view toggle */}
                    <button
                        onClick={() => setMobileView(mobileView === "cards" ? "table" : "cards")}
                        className="md:hidden p-2 border border-gray-300 rounded-lg hover:bg-gray-50 self-end"
                        title="Toggle view"
                    >
                        {mobileView === "cards" ? (
                            <span className="text-sm">Table</span>
                        ) : (
                            <span className="text-sm">Cards</span>
                        )}
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    </div>
                ) : validCustomerOrders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <ShoppingBag className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500">Customer orders will appear here when customers place orders</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                            <div className="min-w-[700px]">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {validCustomerOrders.map((order) => {
                                            const productImage = getProductImage(order.productId);
                                            return (
                                                <tr key={order.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        {productImage ? (
                                                            <img
                                                                src={productImage}
                                                                alt={order.productName}
                                                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                                                <Package className="text-gray-400" size={24} />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#{order.id?.substring(0, 8)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="font-medium">{order.customerName}</div>
                                                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                                                            <div className="text-sm text-gray-500">{order.customerPhone}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium">{order.productName}</div>
                                                        <div className="text-sm text-gray-500">ID: {order.productId}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{order.quantity}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                                        {typeof order.totalAmount === 'number' ? `$${order.totalAmount.toFixed(2)}` : '$0.00'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                        {typeof window !== 'undefined' && order.orderDate ?
                                                            new Date(order.orderDate).toLocaleDateString() :
                                                            ''}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${order.status === "Delivered" ? "bg-green-100 text-green-800" :
                                                                order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                                                                    order.status === "Confirmed" ? "bg-yellow-100 text-yellow-800" :
                                                                        "bg-gray-100 text-gray-800"
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile View - Updated for better responsiveness */}
                        <div className="md:hidden">
                            {mobileView === "cards" ? (
                                // Card Layout for Mobile
                                <div className="space-y-4">
                                    {validCustomerOrders.map((order) => {
                                        const productImage = getProductImage(order.productId);
                                        const shortOrderId = order.id ? `#${order.id.substring(0, 6)}...` : '#N/A';
                                        return (
                                            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        {productImage ? (
                                                            <img
                                                                src={productImage}
                                                                alt={order.productName}
                                                                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                                                <Package className="text-gray-400" size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium text-gray-900">{shortOrderId}</div>
                                                                <div className="text-sm text-gray-900 font-medium mt-1 truncate">{order.customerName}</div>
                                                                <div className="text-xs text-gray-500 truncate">{order.customerEmail}</div>
                                                            </div>
                                                            <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${order.status === "Delivered" ? "bg-green-100 text-green-800" :
                                                                    order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                                                                        order.status === "Confirmed" ? "bg-yellow-100 text-yellow-800" :
                                                                            "bg-gray-100 text-gray-800"
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <div className="font-medium text-sm truncate">{order.productName}</div>
                                                                <div className="text-xs text-gray-500">Product ID: {order.productId.substring(0, 8)}...</div>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <div className="text-sm text-gray-600">
                                                                    Qty: {order.quantity}
                                                                </div>
                                                                <div className="font-medium">
                                                                    {typeof order.totalAmount === 'number' ? `$${order.totalAmount.toFixed(2)}` : '$0.00'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            {typeof window !== 'undefined' && order.orderDate ?
                                                                new Date(order.orderDate).toLocaleDateString() :
                                                                ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                // Mobile Table View with Horizontal Scroll
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <div className="inline-block min-w-full align-middle">
                                            <div className="overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Order
                                                            </th>
                                                            <th scope="col" className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Customer
                                                            </th>
                                                            <th scope="col" className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Product
                                                            </th>
                                                            <th scope="col" className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Total
                                                            </th>
                                                            <th scope="col" className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {validCustomerOrders.map((order) => {
                                                            const shortOrderId = order.id ? `#${order.id.substring(0, 6)}...` : '#N/A';
                                                            return (
                                                                <tr key={order.id} className="hover:bg-gray-50">
                                                                    <td className="py-3 px-2">
                                                                        <div className="text-xs font-medium text-gray-900">{shortOrderId}</div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {typeof window !== 'undefined' && order.orderDate ?
                                                                                new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                                                                                ''}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 px-2">
                                                                        <div className="text-sm font-medium text-gray-900 truncate max-w-[100px]">
                                                                            {order.customerName}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 truncate max-w-[100px]">
                                                                            {order.customerEmail}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 px-2">
                                                                        <div className="text-sm font-medium text-gray-900 truncate max-w-[100px]">
                                                                            {order.productName}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
                                                                    </td>
                                                                    <td className="py-3 px-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                        ${typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : '0.00'}
                                                                    </td>
                                                                    <td className="py-3 px-2 whitespace-nowrap">
                                                                        <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${order.status === "Delivered" ? "bg-green-100 text-green-800" :
                                                                                order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                                                                                    order.status === "Confirmed" ? "bg-yellow-100 text-yellow-800" :
                                                                                        "bg-gray-100 text-gray-800"
                                                                            }`}>
                                                                            {order.status === "Delivered" ? "Del" : 
                                                                             order.status === "Shipped" ? "Ship" : 
                                                                             order.status === "Confirmed" ? "Conf" : "Pen"}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    };

    // Render content
    const renderContent = () => {
        switch (activeTab) {
            case "Products":
                return renderProductsPage();
            case "Customers":
                return renderCustomersPage();
            case "Dashboard":
            default:
                return (
                    <>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Mara Dashboard Overview</h1>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="p-4 sm:p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Total Sales</p>
                                        <h3 className="text-xl sm:text-2xl font-bold">{typeof window !== 'undefined' ? `$${stats.totalSales.toLocaleString()}` : `$${stats.totalSales}`}</h3>
                                        <p className="text-xs sm:text-sm text-green-600 flex items-center gap-1">
                                            <TrendingUp size={14} /> <span>+12.5%</span>
                                        </p>
                                    </div>
                                    <div className="p-2 sm:p-3 bg-green-50 rounded-full">
                                        <DollarSign className="text-green-600" size={24} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="p-4 sm:p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Total Orders</p>
                                        <h3 className="text-xl sm:text-2xl font-bold">{stats.totalOrders}</h3>
                                        <p className="text-xs sm:text-sm text-pink-600 flex items-center gap-1">
                                            <TrendingUp size={14} /> <span>+8.2%</span>
                                        </p>
                                    </div>
                                    <div className="p-2 sm:p-3 bg-pink-50 rounded-full">
                                        <ShoppingBag className="text-pink-600" size={24} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="p-4 sm:p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Products</p>
                                        <h3 className="text-xl sm:text-2xl font-bold">{stats.totalProducts}</h3>
                                        <p className="text-xs sm:text-sm text-purple-600">{stats.featuredProducts} featured</p>
                                    </div>
                                    <div className="p-2 sm:p-3 bg-purple-50 rounded-full">
                                        <Package className="text-purple-600" size={24} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="p-4 sm:p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Customers</p>
                                        <h3 className="text-xl sm:text-2xl font-bold">{stats.totalCustomers}</h3>
                                        <p className="text-xs sm:text-sm text-gray-500">Active users</p>
                                    </div>
                                    <div className="p-2 sm:p-3 bg-pink-50 rounded-full">
                                        <Users className="text-pink-600" size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders Only - Full Width */}
                        <div className="grid grid-cols-1 gap-6 sm:gap-8 mb-8">
                            {/* Recent Orders */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-4 sm:p-6 border-b">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg sm:text-xl font-semibold">Recent Customer Orders</h2>
                                        <button
                                            onClick={() => setActiveTab("Customers")}
                                            className="text-sm text-pink-600 hover:text-pink-800 font-medium cursor-pointer"
                                        >
                                            View All →
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6">
                                    <div className="space-y-4">
                                        {validCustomerOrders.slice(0, 5).map((order) => {
                                            const productImage = getProductImage(order.productId);
                                            return (
                                                <div key={order.id} className="flex items-center gap-3 sm:gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                                    <div className="flex-shrink-0">
                                                        {productImage ? (
                                                            <img
                                                                src={productImage}
                                                                alt={order.productName}
                                                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                                                <Package className="text-gray-400" size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{order.customerName}</p>
                                                                <p className="text-xs sm:text-sm text-gray-500 truncate">{order.productName}</p>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {typeof window !== 'undefined' && order.orderDate ?
                                                                        new Date(order.orderDate).toLocaleDateString() :
                                                                        ''}
                                                                </p>
                                                            </div>
                                                            <div className="text-right mt-1 sm:mt-0 ml-0 sm:ml-4">
                                                                <p className="font-medium text-base sm:text-lg">
                                                                    ${Number(order.totalAmount || 0).toFixed(2)}
                                                                </p>
                                                                <span className={`px-2 py-1 text-xs rounded-full ${order.status === "Delivered" ? "bg-green-100 text-green-800" :
                                                                        order.status === "Confirmed" ? "bg-yellow-100 text-yellow-800" :
                                                                            order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                                                                                "bg-gray-100 text-gray-800"
                                                                    }`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <span className="font-medium">Qty:</span> {order.quantity}
                                                            </span>
                                                            <span>•</span>
                                                            <span className="truncate max-w-[120px] sm:max-w-none">{order.customerEmail}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {validCustomerOrders.length === 0 && (
                                            <div className="text-center py-8">
                                                <ShoppingBag className="mx-auto text-gray-400 mb-2" size={32} />
                                                <p className="text-gray-500 mb-1">No customer orders yet</p>
                                                <p className="text-sm text-gray-400">Orders will appear here when customers place orders</p>
                                                <Link
                                                    href="/Shop"
                                                    className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-[#C67F90] to-pink-400 text-white rounded-lg hover:opacity-90 transition text-sm"
                                                >
                                                    View Shop
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions - Responsive */}
                        <div className="mt-8">
                            <h2 className="text-lg sm:text-xl font-semibold mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <button
                                    onClick={() => setShowAddProduct(true)}
                                    className="px-4 py-3 bg-gradient-to-r from-[#C67F90] to-pink-400 text-white rounded-lg cursor-pointer hover:opacity-80 transition flex items-center gap-3 justify-center text-sm sm:text-base"
                                >
                                    <Plus size={18} /> <span>Add Product</span>
                                </button>
                                <Link
                                    href="/Shop"
                                    className="px-4 py-3 bg-gradient-to-r from-[#C67F90] to-pink-400 text-white cursor-pointer rounded-lg hover:opacity-80 transition flex items-center gap-3 justify-center text-sm sm:text-base"
                                >
                                    <Store size={18} /> <span>View Shop</span>
                                </Link>
                                <button
                                    onClick={() => setActiveTab("Products")}
                                    className="px-4 py-3 border bg-gradient-to-r from-[#C67F90] to-pink-400 cursor-pointer text-white rounded-lg hover:opacity-80 transition flex items-center gap-3 justify-center text-sm sm:text-base"
                                >
                                    <Package size={18} /> <span>Manage Products</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("Customers")}
                                    className="px-4 py-3 border bg-gradient-to-r from-[#C67F90] to-pink-400 cursor-pointer text-white rounded-lg hover:opacity-80 transition flex items-center gap-3 justify-center text-sm sm:text-base"
                                >
                                    <Users size={18} /> <span>View Orders</span>
                                </button>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Toaster position="top-right" />
            
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-r from-[#C67F90] to-pink-400 text-white p-6 hidden md:block sticky top-0 h-screen">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold">Mara Admin</h2>
                    <p className="text-sm text-white/80 mt-1">Admin Dashboard</p>
                </div>
                <nav className="space-y-1">
                    <button
                        onClick={() => setActiveTab("Dashboard")}
                        className={`w-full text-left hover:bg-white/10 cursor-pointer flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === "Dashboard" ? "bg-white/20" : ""}`}
                    >
                        <BarChart3 size={20} /><span> Dashboard</span>
                    </button>
                    <Link
                        href="/Shop"
                        className="w-full text-left hover:bg-white/10 cursor-pointer flex items-center gap-3 p-3 rounded-lg transition-colors"
                    >
                        <Store size={20} /><span> Shop (Customers)</span>
                    </Link>
                    <button
                        onClick={() => setActiveTab("Products")}
                        className={`w-full text-left hover:bg-white/10 cursor-pointer flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === "Products" ? "bg-white/20" : ""}`}
                    >
                        <Package size={20} /> <span>Products</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("Customers")}
                        className={`w-full text-left hover:bg-white/10 cursor-pointer flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === "Customers" ? "bg-white/20" : ""}`}
                    >
                        <ShoppingBag size={20} /> <span>Customer Orders</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-3 sm:p-4 md:p-6">
                {/* Mobile Header */}
                <div className="md:hidden mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Mara Admin</h2>
                        <select
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value as any)}
                            className="p-2 border border-gray-300 rounded-lg bg-white text-sm"
                        >
                            <option value="Dashboard">Dashboard</option>
                            <option value="Products">Products</option>
                            <option value="Customers">Customer Orders</option>
                        </select>
                    </div>
                    {activeTab !== "Dashboard" && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {renderContent()}
            </main>

            {/* Add Product Modal - Responsive */}
            {showAddProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg sm:text-xl font-bold">
                                {editingProduct ? "Edit Product" : "Add New Product"}
                            </h3>
                            <button
                                onClick={resetProductForm}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddProduct}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {/* Left Column - Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                                    
                                    {/* Image Method Tabs */}
                                    <div className="flex mb-3 border-b border-gray-200">
                                        <button
                                            type="button"
                                            className={`flex-1 py-2 text-center font-medium text-xs sm:text-sm ${imageMethod === "upload" ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-500 hover:text-gray-700"}`}
                                            onClick={() => setImageMethod("upload")}
                                        >
                                            <Upload size={14} className="inline mr-2" />
                                            <span>Upload</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={`flex-1 py-2 text-center font-medium text-xs sm:text-sm ${imageMethod === "url" ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-500 hover:text-gray-700"}`}
                                            onClick={() => setImageMethod("url")}
                                        >
                                            <LinkIcon size={14} className="inline mr-2" />
                                            <span>URL</span>
                                        </button>
                                    </div>

                                    {/* Image Preview */}
                                    <div className="mb-4">
                                        {imagePreview || newProduct.image ? (
                                            <div className="relative">
                                                <img
                                                    src={imagePreview || newProduct.image}
                                                    alt="Preview"
                                                    className="w-full h-40 sm:h-48 object-cover rounded-lg border border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setNewProduct({ ...newProduct, image: "" });
                                                        setImagePreview(null);
                                                    }}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full h-40 sm:h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                                                <ImageIcon className="text-gray-400 mb-2" size={28} />
                                                <p className="text-sm text-gray-500">No image selected</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Image Section */}
                                    {imageMethod === "upload" ? (
                                        <div className="mb-4">
                                            <div
                                                className="w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:border-pink-500 transition-colors"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className="text-gray-400 mb-2" size={28} />
                                                <p className="text-sm text-gray-500">Click to upload image</p>
                                                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                    ) : (
                                        /* URL Input Section */
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Image URL
                                            </label>
                                            <input
                                                type="url"
                                                placeholder="https://example.com/image.jpg"
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                                                value={newProduct.image}
                                                onChange={handleImageUrlChange}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Enter a direct image URL
                                            </p>
                                        </div>
                                    )}

                                    {/* Featured Checkbox */}
                                    <div className="mt-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newProduct.featured}
                                                onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                                                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                <Star size={14} /> <span>Mark as featured</span>
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Right Column - Product Details */}
                                <div className="space-y-3 sm:space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                        <input
                                            type="text"
                                            placeholder="Enter product name"
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                        <select
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                            required
                                        >
                                            <option value="">Select category</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            <option value="new">+ Add New Category</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                                                value={newProduct.stock}
                                                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            placeholder="Enter product description"
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                                            rows={3}
                                            value={newProduct.description}
                                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#C67F90] to-pink-400 text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
                                        >
                                            {editingProduct ? "Update Product" : "Add Product"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetProductForm}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}