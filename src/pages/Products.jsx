import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { categories, products } from "../data/data";

const Products = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const uniqueProducts = products.filter((product, index, list) => {
    const key = `${product.category}-${product.subcategory}-${product.image || product.visual}`;
    return list.findIndex((item) => {
      const itemKey = `${item.category}-${item.subcategory}-${item.image || item.visual}`;
      return itemKey === key;
    }) === index;
  });

  const displayProducts = useMemo(() => {
    if (activeCategory === "all") return uniqueProducts;
    return uniqueProducts.filter((product) => product.category === activeCategory);
  }, [activeCategory, uniqueProducts]);

  const activeCategoryName = activeCategory === "all"
    ? "All Products"
    : categories.find((category) => category.id === activeCategory)?.name;

  return (
    <div>
      <section className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 py-16">
        <div className="container-custom">
          <p className="section-kicker">Vision Catalog</p>
          <h1 className="mb-4 text-5xl font-black uppercase tracking-normal text-slate-950">All Products</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">Browse every frontend product page, category, and subcategory in the Vision appliance range.</p>
        </div>
      </section>

      <section className="container-custom py-12">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:items-start">
          <aside className="rounded-lg border border-cyan-100 bg-white p-4 shadow-sm">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-vision-blue">Filter</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`rounded-md border px-4 py-3 text-left text-sm font-black transition ${
                  activeCategory === "all"
                    ? "border-vision-blue bg-vision-blue text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-vision-blue hover:text-vision-blue"
                }`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`rounded-md border px-4 py-3 text-left text-sm font-black transition ${
                    activeCategory === category.id
                      ? "border-vision-blue bg-vision-blue text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-vision-blue hover:text-vision-blue"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </aside>

          <div>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">{activeCategoryName}</p>
                <h2 className="section-title">Products</h2>
              </div>
              <p className="text-sm font-bold text-slate-500">{displayProducts.length} items</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {displayProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
