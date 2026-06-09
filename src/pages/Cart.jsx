import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Tag, Trash2, Truck } from "lucide-react";
import ProductVisual from "../components/ProductVisual";
import { getCartItems, saveCartItems } from "../utils/cart";

const Cart = ({ mode = "cart" }) => {
  const [items, setItems] = useState([]);
  const [deliveryArea, setDeliveryArea] = useState("inside");
  const navigate = useNavigate();

  const deliveryFee = deliveryArea === "inside" ? 60 : 110;

  useEffect(() => {
    setItems(getCartItems());
  }, []);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );

  const updateItems = (nextItems) => {
    setItems(nextItems);
    saveCartItems(nextItems);
  };

  const updateQuantity = (item, quantity) => {
    updateItems(
      items.map((cartItem) =>
        cartItem.id === item.id && cartItem.option === item.option
          ? { ...cartItem, quantity: Math.max(1, quantity) }
          : cartItem
      )
    );
  };

  const removeItem = (item) => {
    updateItems(items.filter((cartItem) => !(cartItem.id === item.id && cartItem.option === item.option)));
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const order = {
      id: `VSN-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customer: {
        name: formData.get("name"),
        phone: formData.get("phone"),
        address: formData.get("address"),
      },
      deliveryArea,
      paymentMethod: "Cash On Delivery",
      items,
      itemCount,
      subtotal,
      deliveryFee,
      total,
    };

    localStorage.setItem("vision-last-order", JSON.stringify(order));
    saveCartItems([]);
    setItems([]);
    navigate("/thank-you", { state: { order } });
  };

  if (mode === "cart") {
    return (
      <div className="bg-slate-50">
        <section className="border-b border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-12">
          <div className="container-custom">
            <Link to="/products" className="mb-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-vision-blue hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
            <h1 className="text-4xl font-black uppercase text-vision-dark md:text-6xl">Shopping Cart</h1>
            <p className="mt-3 max-w-2xl text-slate-600">Review your selected Vision products before placing an order.</p>
          </div>
        </section>

        <section className="container-custom py-12">
          {items.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
              <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-vision-cyan" />
              <h2 className="mb-3 text-2xl font-black uppercase text-vision-dark">Your cart is empty</h2>
              <p className="mb-6 text-slate-600">Add a product from the catalog and it will show here.</p>
              <Link to="/products" className="btn-primary inline-flex">Browse Products</Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                {items.map((item) => (
                  <article key={`${item.id}-${item.option}`} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[140px_1fr]">
                    <Link to={`/products/${item.id}`} className="flex aspect-square items-center justify-center rounded-md bg-gradient-to-br from-white via-cyan-50 to-blue-50">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-contain p-4" />
                      ) : (
                        <ProductVisual type={item.visual} color={item.color} compact />
                      )}
                    </Link>
                    <div>
                      <div className="mb-1 text-xs font-black uppercase tracking-wider text-vision-blue">{item.model}</div>
                      <Link to={`/products/${item.id}`} className="text-xl font-black text-vision-dark hover:text-vision-blue">{item.name}</Link>
                      <div className="mt-2 text-sm font-bold text-slate-500">Option: {item.option}</div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="text-2xl font-black text-vision-blue">Tk {item.price * item.quantity}</div>
                        <div className="flex items-center gap-3">
                          <div className="grid grid-cols-3 overflow-hidden rounded-md border border-slate-200">
                            <button type="button" onClick={() => updateQuantity(item, item.quantity - 1)} className="grid h-10 w-10 place-items-center hover:bg-cyan-50" aria-label="Decrease quantity">
                              <Minus className="h-4 w-4" />
                            </button>
                            <div className="grid h-10 w-12 place-items-center border-x border-slate-200 font-black">{item.quantity}</div>
                            <button type="button" onClick={() => updateQuantity(item, item.quantity + 1)} className="grid h-10 w-10 place-items-center hover:bg-cyan-50" aria-label="Increase quantity">
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button type="button" onClick={() => removeItem(item)} className="grid h-10 w-10 place-items-center rounded-md border border-red-100 text-red-500 hover:bg-red-50" aria-label="Remove item">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="h-fit rounded-lg border border-cyan-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-black uppercase text-vision-dark">Cart Summary</h2>
                <div className="space-y-3 border-b border-slate-100 pb-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Items</span>
                    <span className="font-black">{itemCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-black">Tk {subtotal}</span>
                  </div>
                </div>
                <div className="flex justify-between py-5 text-xl font-black text-vision-dark">
                  <span>Total</span>
                  <span>Tk {subtotal}</span>
                </div>
                <Link to="/order" className="inline-flex w-full items-center justify-center rounded-md bg-vision-blue px-6 py-3 font-black text-white transition hover:bg-vision-dark">
                  Proceed to Order
                </Link>
              </aside>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <section className="container-custom py-12 lg:py-20">
        {items.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-vision-cyan" />
            <h2 className="mb-3 text-2xl font-black uppercase text-vision-dark">Your cart is empty</h2>
            <p className="mb-6 text-slate-600">Add a product from the catalog and it will show here.</p>
            <Link to="/products" className="btn-primary inline-flex">Browse Products</Link>
          </div>
        ) : (
          <>
            <Link to="/products" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-vision-blue">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <div className="mb-8 rounded-md border border-vision-blue/20 bg-cyan-50 px-5 py-4 text-center text-sm font-bold text-vision-dark">
              Fill in your details and click Place Order to confirm, or call +880 123 456 789.
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
              <form className="space-y-6" onSubmit={handlePlaceOrder}>
                <div>
                  <label htmlFor="customer-name" className="mb-2 block font-black text-slate-950">Your Name *</label>
                  <input id="customer-name" name="name" className="form-input border-cyan-100 bg-cyan-50/70" placeholder="Full name" required />
                </div>

                <div>
                  <label htmlFor="customer-phone" className="mb-2 block font-black text-slate-950">Phone Number *</label>
                  <input id="customer-phone" name="phone" className="form-input border-cyan-100 bg-cyan-50/70" placeholder="01XXXXXXXXX" required />
                </div>

                <div>
                  <label htmlFor="customer-address" className="mb-2 block font-black text-slate-950">Delivery Address *</label>
                  <textarea id="customer-address" name="address" className="form-input min-h-28 resize-none border-cyan-100 bg-cyan-50/70" placeholder="Full delivery address" required />
                </div>

                <div>
                  <h2 className="mb-3 font-black text-slate-950">Select Delivery Area *</h2>
                  <div className="grid gap-3">
                    <label className={`flex cursor-pointer items-center justify-between rounded-md border bg-white px-4 py-4 transition ${deliveryArea === "inside" ? "border-vision-blue ring-4 ring-cyan-100" : "border-slate-200 hover:border-cyan-300"}`}>
                      <span className="flex items-center gap-3 font-bold text-slate-900">
                        <input type="radio" name="delivery-area" value="inside" checked={deliveryArea === "inside"} onChange={() => setDeliveryArea("inside")} className="accent-vision-blue" />
                        Inside Dhaka
                      </span>
                      <span className="font-black text-vision-blue">Tk 60</span>
                    </label>
                    <label className={`flex cursor-pointer items-center justify-between rounded-md border bg-white px-4 py-4 transition ${deliveryArea === "outside" ? "border-vision-blue ring-4 ring-cyan-100" : "border-slate-200 hover:border-cyan-300"}`}>
                      <span className="flex items-center gap-3 font-bold text-slate-900">
                        <input type="radio" name="delivery-area" value="outside" checked={deliveryArea === "outside"} onChange={() => setDeliveryArea("outside")} className="accent-vision-blue" />
                        Outside Dhaka
                      </span>
                      <span className="font-black text-vision-blue">Tk 110</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 font-black text-slate-950">Payment Method</h2>
                  <label className="inline-flex items-center gap-3 rounded-md border border-vision-blue bg-white px-4 py-3 font-bold text-vision-dark ring-4 ring-cyan-100">
                    <input type="radio" name="payment" defaultChecked className="accent-vision-blue" />
                    Cash On Delivery
                  </label>
                </div>

                <button type="submit" className="w-full rounded-md bg-vision-blue px-6 py-4 text-lg font-black text-white shadow-sm transition hover:bg-vision-dark">
                  Place Order
                </button>
              </form>

              <aside className="h-fit overflow-hidden rounded-lg border border-cyan-100 bg-white shadow-sm">
                <div className="bg-vision-dark px-5 py-4">
                  <h2 className="text-2xl font-black text-white">Order Summary</h2>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-[1fr_80px] border-b border-slate-200 pb-3 text-sm font-bold text-slate-500">
                    <span>Details</span>
                    <span className="text-right">Price</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <article key={`${item.id}-${item.option}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-4">
                        <button type="button" onClick={() => removeItem(item)} className="text-red-500 transition hover:text-red-600" aria-label="Remove item">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="flex min-w-0 items-center gap-3">
                          <Link to={`/products/${item.id}`} className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md border border-slate-100 bg-cyan-50">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-contain p-2" />
                            ) : (
                              <ProductVisual type={item.visual} color={item.color} compact />
                            )}
                          </Link>
                          <div className="min-w-0">
                            <Link to={`/products/${item.id}`} className="line-clamp-1 font-black text-slate-950 hover:text-vision-blue">{item.name}</Link>
                            <p className="text-xs font-bold text-slate-500">Option: {item.option}</p>
                            <div className="mt-2 inline-grid grid-cols-3 overflow-hidden rounded-md border border-slate-200">
                              <button type="button" onClick={() => updateQuantity(item, item.quantity - 1)} className="grid h-8 w-8 place-items-center hover:bg-cyan-50" aria-label="Decrease quantity">
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="grid h-8 w-10 place-items-center border-x border-slate-200 text-sm font-black">{item.quantity}</span>
                              <button type="button" onClick={() => updateQuantity(item, item.quantity + 1)} className="grid h-8 w-8 place-items-center hover:bg-cyan-50" aria-label="Increase quantity">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-black text-vision-dark">Tk {item.price * item.quantity}</div>
                      </article>
                    ))}
                  </div>

                  <div className="border-y border-slate-200 py-4">
                    <div className="mb-3 flex items-center gap-2 font-black text-slate-950">
                      <Tag className="h-4 w-4 text-vision-blue" />
                      Coupon Code
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <input className="form-input border-cyan-100 bg-cyan-50/70 py-2" placeholder="Enter coupon code" />
                      <button type="button" className="rounded-md border border-vision-blue px-4 font-black text-vision-blue transition hover:bg-vision-blue hover:text-white">Apply</button>
                    </div>
                  </div>

                  <div className="space-y-2 border-b border-slate-200 py-4 text-sm">
                    <div className="flex justify-between">
                      <span>Items:</span>
                      <span className="font-bold">{itemCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-bold">Tk {subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Charge:</span>
                      <span className="font-bold">Tk {deliveryFee}</span>
                    </div>
                  </div>

                  <div className="flex justify-between py-4 text-xl font-black text-vision-dark">
                    <span>Total:</span>
                    <span>Tk {total}</span>
                  </div>

                  <div className="flex gap-3 rounded-md border border-cyan-200 bg-cyan-50 p-4 text-sm font-bold leading-6 text-vision-dark">
                    <Truck className="mt-1 h-5 w-5 shrink-0 text-vision-blue" />
                    <p>Please place your order only after confirming all details. Pay in cash when you receive the product.</p>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Cart;
