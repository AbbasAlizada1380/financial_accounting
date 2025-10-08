// src/pages/WishlistPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import { products as allProducts } from "../data/products";
import ProductCard from "../Components/ProductCard";
import { Heart } from "lucide-react";

const WishlistPage = ({ wishlist, onToggleWishlist, onQuickView }) => {
  // Find the full product objects that match the IDs in the wishlist
  const wishlistedProducts = allProducts.filter((product) =>
    wishlist.includes(product.id)
  );

  return (
    <div className="bg-white">
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            My Wishlist
          </h1>
          <p className="mt-4 text-base text-gray-500">
            You have {wishlistedProducts.length} item(s) in your wishlist.
          </p>
        </div>

        <section className="pt-12 pb-24">
          {wishlistedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {wishlistedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlist={wishlist}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          ) : (
            // Displayed when the wishlist is empty
            <div className="text-center py-20">
              <Heart className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-2 text-lg font-medium text-gray-900">
                Your wishlist is empty
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Tap the heart on any product to save it here for later.
              </p>
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default WishlistPage;
