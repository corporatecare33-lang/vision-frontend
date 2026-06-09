import { Link } from "react-router-dom";
import { Facebook, Github, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { categories } from "../data/data";

const socialLinks = [
  { Icon: Facebook, href: "#", label: "Facebook" },
  { Icon: Instagram, href: "#", label: "Instagram" },
  { Icon: Youtube, href: "#", label: "Youtube" },
  { Icon: Github, href: "https://github.com/", label: "Github" },
];

const Footer = () => {
  return (
    <footer className="border-t border-cyan-200 bg-vision-dark pt-14 text-white">
      <div className="container-custom">
        <div className="grid grid-cols-2 gap-8 pb-12 text-center md:grid-cols-2 md:text-left lg:grid-cols-[1.2fr_0.8fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-5 flex items-center justify-center gap-3 md:justify-start">
              <img src="/vision-logo.jpeg" alt="Vision Smart" className="h-16 w-auto rounded-md bg-white object-contain p-2" />
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
              <li className="flex justify-center gap-3 md:justify-start"><MapPin className="mt-1 h-4 w-4 text-vision-cyan" />Vision Tower, Dhaka, Bangladesh</li>
              <li className="flex justify-center gap-3 md:justify-start"><Phone className="h-4 w-4 text-vision-cyan" />+880 123 456 789</li>
              <li className="flex justify-center gap-3 md:justify-start"><Mail className="h-4 w-4 text-vision-cyan" />support@vision.com</li>
            </ul>
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
