import { Factory, PlayCircle, ShieldCheck } from "lucide-react";
import { assetPath } from "../data/data";

const applianceImages = [
  {
    src: "/manufacturing/appliance-washer-front.jpeg",
    alt: "Washing machine manufacturing sample",
  },
  {
    src: "/manufacturing/appliance-freezer-open.jpeg",
    alt: "Freezer manufacturing inspection",
  },
  {
    src: "/manufacturing/appliance-washer-packed.jpeg",
    alt: "Packed washing machine manufacturing sample",
  },
];

const acImages = [
  {
    src: "/manufacturing/ac-production-rack-front.jpeg",
    alt: "AC manufacturing production rack",
  },
  {
    src: "/manufacturing/ac-production-rack-angle.jpeg",
    alt: "AC production rack from angle",
  },
  {
    src: "/manufacturing/ac-compressor-gree.jpeg",
    alt: "AC compressor assembly",
  },
  {
    src: "/manufacturing/ac-internal-coil.jpeg",
    alt: "AC internal coil assembly",
  },
  {
    src: "/manufacturing/ac-compressor-wide.jpeg",
    alt: "AC compressor and copper pipe details",
  },
  {
    src: "/manufacturing/ac-full-internals.jpeg",
    alt: "AC internal manufacturing components",
  },
];

const videos = [
  {
    src: "/manufacturing/factory-video-assembly-1.mp4",
    title: "Assembly Line",
  },
  {
    src: "/manufacturing/factory-video-assembly-2.mp4",
    title: "Component Check",
  },
  {
    src: "/manufacturing/factory-video-assembly-3.mp4",
    title: "Production View",
  },
];

const ImageTile = ({ image, className = "" }) => (
  <div className={`overflow-hidden rounded-lg border border-cyan-100 bg-white shadow-sm ${className}`}>
    <img src={assetPath(image.src)} alt={image.alt} className="h-full w-full object-cover" loading="lazy" />
  </div>
);

const ManufacturingShowcase = () => {
  return (
    <section className="border-y border-slate-100 bg-slate-50 py-16">
      <div className="container-custom">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">Factory Gallery</p>
            <h2 className="section-title">Manufacturing Highlights</h2>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-black uppercase tracking-widest text-vision-dark">
            <span className="inline-flex items-center gap-2 rounded-md border border-cyan-200 bg-white px-3 py-2">
              <Factory className="h-4 w-4 text-vision-blue" />
              Refrigerator  Manufacturing
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-cyan-200 bg-white px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-vision-blue" />
              AC Manufacturing
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="overflow-hidden rounded-lg border border-cyan-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-vision-blue">Refrigerator  Manufacturing</p>
              <h3 className="mt-2 text-2xl font-black uppercase tracking-normal text-slate-950">Appliance Production</h3>
            </div>
            <div className="grid gap-3 p-3 sm:grid-cols-2">
              <ImageTile image={applianceImages[0]} className="aspect-[4/5] sm:row-span-2" />
              <ImageTile image={applianceImages[1]} className="aspect-[16/11]" />
              <ImageTile image={applianceImages[2]} className="aspect-[16/11]" />
            </div>
          </article>

          <article className="overflow-hidden rounded-lg border border-cyan-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-vision-blue">AC Manufacturing</p>
              <h3 className="mt-2 text-2xl font-black uppercase tracking-normal text-slate-950">AC Assembly Details</h3>
            </div>
            <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {acImages.map((image, index) => (
                <ImageTile key={image.src} image={image} className={index < 2 ? "aspect-[4/5]" : "aspect-square"} />
              ))}
            </div>
          </article>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-cyan-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5">
            <PlayCircle className="h-6 w-6 text-vision-blue" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-vision-blue">Video Option</p>
              <h3 className="text-xl font-black uppercase tracking-normal text-slate-950">Factory Videos</h3>
            </div>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-3">
            {videos.map((video) => (
              <div key={video.src} className="overflow-hidden rounded-lg border border-slate-100 bg-slate-950">
                <video className="aspect-video w-full object-cover" src={assetPath(video.src)} controls preload="metadata" playsInline />
                <div className="bg-white px-4 py-3 text-sm font-black text-slate-950">{video.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManufacturingShowcase;
