import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, Search, ArrowLeft, Tag, Phone, Mail, MapPin, Lock } from 'lucide-react';
import { blogPosts } from '../../data/blogData';

interface BlogDetailProps {
    onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ onOpenAuthModal }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const blog = blogPosts.find(post => post.id === id);

    if (!blog) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
                    <button
                        onClick={() => navigate('/blog')}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                        Return to Blog
                    </button>
                </div>
            </div>
        );
    }

    const relatedBlogs = blogPosts.filter(post => post.id !== id).slice(0, 4);
    const categories = [
        { name: 'Health Care', count: 2 },
        { name: 'Nutritions', count: 4 },
        { name: 'Health Tips', count: 5 },
        { name: 'Medical Research', count: 4 },
        { name: 'Health Treatment', count: 6 }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Contact Bar */}
            <div className="bg-blue-600 text-white py-2.5 text-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>+977 1234567890</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4" />
                                <span>contact@medisewa.com</span>
                            </div>
                            <div className="hidden md:flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>Kathmandu, Nepal</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <a href="#" className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center">
                            <a href="/" className="flex items-center">
                                <img src="/LOGO.png" alt="MediSEWA" className="h-24 w-auto object-contain" />
                            </a>
                        </div>

                        {/* Navigation Menu */}
                        <div className="hidden lg:flex items-center space-x-8">
                            <a href="/" className="text-gray-700 font-medium hover:text-blue-600 transition-colors pb-1">
                                Home
                            </a>
                            <a href="#" className="text-gray-700 font-medium hover:text-blue-600 transition-colors pb-1">
                                Doctors
                            </a>
                            <a href="#" className="text-gray-700 font-medium hover:text-blue-600 transition-colors pb-1">
                                Pharmacy
                            </a>
                            <a href="/blog" className="text-blue-600 font-medium hover:text-blue-700 transition-colors border-b-2 border-blue-600 pb-1">
                                Blog
                            </a>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                            {onOpenAuthModal ? (
                                <>
                                    <button
                                        onClick={() => onOpenAuthModal('login')}
                                        className="rounded-full px-6 py-2.5 font-medium shadow-md hover:shadow-lg transition-all bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
                                    >
                                        <Lock className="h-4 w-4" />
                                        <span>Login</span>
                                    </button>
                                    <button
                                        onClick={() => onOpenAuthModal('register')}
                                        className="rounded-full px-6 py-2.5 font-medium shadow-md hover:shadow-lg transition-all bg-gray-900 hover:bg-gray-800 text-white flex items-center space-x-2"
                                    >
                                        <User className="h-4 w-4" />
                                        <span>Sign-up</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <a
                                        href="/"
                                        className="rounded-full px-6 py-2.5 font-medium shadow-md hover:shadow-lg transition-all bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
                                    >
                                        <Lock className="h-4 w-4" />
                                        <span>Login</span>
                                    </a>
                                    <a
                                        href="/"
                                        className="rounded-full px-6 py-2.5 font-medium shadow-md hover:shadow-lg transition-all bg-gray-900 hover:bg-gray-800 text-white flex items-center space-x-2"
                                    >
                                        <User className="h-4 w-4" />
                                        <span>Sign-up</span>
                                    </a>
                                </>
                            )}
                            <button className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors lg:hidden">
                                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Image */}
            <div className="relative h-[400px] overflow-hidden">
                <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                            {/* Back Button */}
                            <button
                                onClick={() => navigate('/blog')}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Back to Blog
                            </button>

                            {/* Title */}
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                {blog.title}
                            </h1>

                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                                <span className="inline-block text-sm font-semibold text-white bg-blue-600 px-4 py-2 rounded-full">
                                    {blog.category}
                                </span>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <User className="h-5 w-5" />
                                    <span className="font-medium">{blog.author.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="h-5 w-5" />
                                    <span>{blog.date}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="h-5 w-5" />
                                    <span>{blog.readTime}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div
                                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic"
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                            />

                            {/* Tags */}
                            <div className="mt-12 pt-8 border-t border-gray-200">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Tag className="h-5 w-5 text-gray-600" />
                                    <span className="font-semibold text-gray-900">Tags:</span>
                                    {blog.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* About Author */}
                            <div className="mt-12 pt-8 border-t border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">About Author</h3>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                                            {blog.author.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">{blog.author.name}</h4>
                                        <p className="text-gray-600 leading-relaxed">
                                            As a certified nutritionist and wellness coach, I'm passionate about helping others achieve a balanced lifestyle and lasting health. My journey into health started with my own desire to feel better physically and mentally, and along the way, I've learned the importance of consistency and small, sustainable changes. I love exploring ways to stay active, experimenting with healthy meals, and sharing tips that are practical and realistic for people with busy lives.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-8">
                            {/* Search */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        <Search className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Categories</h3>
                                <div className="space-y-3">
                                    {categories.map((category, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
                                        >
                                            <span className="text-gray-700 group-hover:text-blue-600 font-medium">
                                                {category.name}
                                            </span>
                                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                ({category.count})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Latest News */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Latest News</h3>
                                <div className="space-y-6">
                                    {relatedBlogs.map((relatedBlog) => (
                                        <div
                                            key={relatedBlog.id}
                                            onClick={() => navigate(`/blog/${relatedBlog.id}`)}
                                            className="flex gap-4 cursor-pointer group"
                                        >
                                            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                                                <img
                                                    src={relatedBlog.image}
                                                    alt={relatedBlog.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-500 mb-1">{relatedBlog.date}</p>
                                                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                    {relatedBlog.title}
                                                </h4>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Health Tips', 'Awareness', 'Health', 'Wellness', 'Treatments', 'Checkup', 'Prevention'].map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
