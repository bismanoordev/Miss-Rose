"use client";

import { Suspense } from "react";
import ProductFormContent from "./ProductFormContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProductFormContent />
    </Suspense>
  );
}
