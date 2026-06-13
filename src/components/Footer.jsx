import { Link } from "react-router-dom";
import { Facebook, Github, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { assetPath, categories } from "../data/data";

const socialLinks = [
  { Icon: Facebook, href: "#", label: "Facebook" },
  { Icon: Instagram, href: "#", label: "Instagram" },
  { Icon: Youtube, href: "#", label: "Youtube" },
  { Icon: Github, href: "https://github.com/", label: "Github" },
];

const officeLocations = [
  {
    title: "Singapore Office",
    address: "15C Kang Choon Bin Road, S548276 Singapore.",
  },
  {
    title: "Bangladesh Office",
    address: "House: 12, Road: 01, Block: F, Banani, Dhaka-1236.",
  },
  {
    title: "Timor-Leste Office",
    address: "Aimutin, Comoro, Dom Aleixo, Dili, Timor-Leste.",
  },
];

const hotlineNumbers = ["+65 9427 9703", "+670 7551 3983", "+670 7717 9555"];

const Footer = () => {
  return (
    <footer className="border-t border-cyan-200 bg-vision-dark pt-14 text-white">
      <div className="container-custom">
        <div className="grid grid-cols-2 gap-8 pb-12 text-center md:grid-cols-2 md:text-left lg:grid-cols-[1.2fr_0.8fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-5 flex items-center justify-center gap-3 md:justify-start">
              <img src={assetPath("/vision-logo.jpeg")} alt="Vision Smart" className="h-16 w-auto rounded-md bg-white object-contain p-2" />
            </div>
            <p className="mx-auto max-w-sm text-sm leading-7 text-slate-300 md:mx-0">
              Modern electronics and appliances designed for Bangladeshi homes, shops, and everyday routines.
            </p>
            <div className="mt-6 flex justify-center gap-3 md:justify-start">
              {socialLinks.map(({ Icon, href, label }) => (
                <a key={label} href={href} target={href === "#" ? undefined : "_blank"} rel={href === "#" ? undefined : "noreferrer"} className="grid h-10 w-10 place-items-center rounded-md bg-white/10 transition hover:bg-vision-cyan hover:text-vision-dark" aria-label={label}>
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-black uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/support" className="hover:text-white">Support</Link></li>
              <li><Link to="/news" className="hover:text-white">News</Link></li>
              <li><Link to="/media" className="hover:text-white">Media & Events</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-black uppercase tracking-widest">Products</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              {categories.map((category) => (
                <li key={category.id}><Link to={category.path} className="hover:text-white">{category.name}</Link></li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h3 className="mb-5 text-sm font-black uppercase tracking-widest">Contact</h3>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex justify-center gap-3 md:justify-start">
                <Phone className="mt-1 h-4 w-4 shrink-0 text-vision-cyan" />
                <div>
                  <div className="mb-1 font-black uppercase text-white">Hotline</div>
                  <div className="space-y-1">
                    {hotlineNumbers.map((number) => (
                      <a key={number} href={`tel:${number.replace(/\s/g, "")}`} className="block hover:text-white">
                        {number}
                      </a>
                    ))}
                  </div>
                </div>
              </li>
              <li className="flex justify-center gap-3 md:justify-start">
                <Mail className="mt-1 h-4 w-4 shrink-0 text-vision-cyan" />
                <a href="mailto:visionsg26@gmail.com" className="hover:text-white">visionsg26@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-10 rounded-lg border border-white/10 bg-white/5 p-5">
          <h3 className="mb-5 text-center text-sm font-black uppercase tracking-widest text-white md:text-left">Our Locations</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {officeLocations.map((location) => (
              <div key={location.title} className="flex gap-3 rounded-md bg-white/5 p-4 text-left">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-vision-cyan" />
                <div>
                  <div className="mb-1 font-black text-white">{location.title}</div>
                  <p className="text-sm leading-6 text-slate-300">{location.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-white/10 py-6 text-center text-sm text-slate-400 md:flex-row md:items-center md:justify-between md:text-left">
          <p>Copyright 2026 Vision Appliances. All rights reserved.</p>
          <div className="flex justify-center gap-5">
            <a href="https://digitalwebars.com/" target="_blank" rel="noreferrer" className="hover:text-white">Design and Development by DigitalWebars</a>
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
