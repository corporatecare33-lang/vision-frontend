import { Link, useLocation } from "react-router-dom";
import { CheckCircle, Download, Printer } from "lucide-react";

const getStoredOrder = () => {
  try {
    return JSON.parse(localStorage.getItem("vision-last-order"));
  } catch {
    return null;
  }
};

const escapePdfText = (value) =>
  String(value ?? "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const downloadPdf = (order) => {
  const rows = [
    "Vision Appliances Invoice",
    `Invoice: ${order.id}`,
    `Date: ${new Date(order.createdAt).toLocaleString()}`,
    "",
    `Customer: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Address: ${order.customer.address}`,
    `Payment: ${order.paymentMethod}`,
    `Delivery: ${order.deliveryArea === "inside" ? "Inside Dhaka" : "Outside Dhaka"}`,
    "",
    "Items:",
    ...order.items.map((item) => `${item.name} (${item.option}) x ${item.quantity} - Tk ${item.price * item.quantity}`),
    "",
    `Subtotal: Tk ${order.subtotal}`,
    `Delivery: Tk ${order.deliveryFee}`,
    `Total: Tk ${order.total}`,
  ];

  const stream = [
    "BT",
    "/F1 14 Tf",
    "50 780 Td",
    ...rows.flatMap((row, index) => [
      index === 0 ? "" : "0 -22 Td",
      `(${escapePdfText(row)}) Tj`,
    ]),
    "ET",
  ].filter(Boolean).join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${order.id}-invoice.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};

const ThankYou = () => {
  const location = useLocation();
  const order = location.state?.order || getStoredOrder();

  if (!order) {
    return (
      <div className="container-custom py-24 text-center">
        <h1 className="mb-4 text-3xl font-black uppercase text-vision-dark">No order found</h1>
        <Link to="/products" className="btn-primary inline-flex">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <section className="container-custom py-12 lg:py-16">
        <div className="mb-8 rounded-lg border border-cyan-100 bg-white p-8 text-center shadow-sm">
          <CheckCircle className="mx-auto mb-4 h-14 w-14 text-vision-cyan" />
          <p className="section-kicker">Order Confirmed</p>
          <h1 className="mb-3 text-4xl font-black uppercase text-vision-dark">Thank You</h1>
          <p className="text-slate-600">Your order has been received. We will contact you soon to confirm delivery.</p>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-cyan-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 bg-vision-dark px-6 py-5 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Invoice</h2>
              <p className="text-sm text-cyan-100">{order.id}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 font-bold hover:bg-white/20">
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button type="button" onClick={() => downloadPdf(order)} className="inline-flex items-center gap-2 rounded-md bg-vision-cyan px-4 py-2 font-black text-vision-dark hover:bg-cyan-300">
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-black text-vision-dark">Customer Details</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Name:</strong> {order.customer.name}</p>
                <p><strong>Phone:</strong> {order.customer.phone}</p>
                <p><strong>Address:</strong> {order.customer.address}</p>
                <p><strong>Payment:</strong> {order.paymentMethod}</p>
              </div>
            </div>
            <div>
              <h3 className="mb-3 font-black text-vision-dark">Order Details</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Delivery:</strong> {order.deliveryArea === "inside" ? "Inside Dhaka" : "Outside Dhaka"}</p>
                <p><strong>Items:</strong> {order.itemCount}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-3">Product</th>
                    <th className="py-3">Option</th>
                    <th className="py-3 text-center">Qty</th>
                    <th className="py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <tr key={`${item.id}-${item.option}`}>
                      <td className="py-3 font-bold text-slate-950">{item.name}</td>
                      <td className="py-3 text-slate-600">{item.option}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right font-black text-vision-blue">Tk {item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto mt-6 max-w-sm space-y-2 border-t border-slate-200 pt-4">
              <div className="flex justify-between"><span>Subtotal</span><strong>Tk {order.subtotal}</strong></div>
              <div className="flex justify-between"><span>Delivery</span><strong>Tk {order.deliveryFee}</strong></div>
              <div className="flex justify-between text-xl font-black text-vision-dark"><span>Total</span><span>Tk {order.total}</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThankYou;
