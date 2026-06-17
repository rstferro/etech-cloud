import type { Metadata } from "next";
import { listProducts } from "@/lib/db/products";
import { ProductsManager } from "@/components/produtos/products-manager";

export const metadata: Metadata = {
  title: "Produtos · E-Tech Cloud",
};

export default async function ProdutosPage() {
  const products = await listProducts();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-8 py-10">
      <ProductsManager products={products} />
    </main>
  );
}
