import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { assetPath } from "../data/data";

const slides = [
  {
    image: "/hero/side-by-side.jpg",
    alt: "Vision side by side refrigerator",
    kicker: "Vision Cooling",
    title: "Side by Side Refrigerator",
    subtitle: "Smart storage, premium finish, and fresh cooling for modern homes.",
    tone: "light",
  },
  {
    image: "/hero/single-door.jpg",
    alt: "Vision single door refrigerator",
    kicker: "Compact Freshness",
    title: "Single Door Refrigerator",
    subtitle: "Space-saving cooling with dependable everyday performance.",
    tone: "light",
  },
  {
    image: "/hero/non-forst-english-1920x550.jpg",
    alt: "Vision no frost refrigerator",
    kicker: "No Frost Series",
    title: "Fresh Cooling, Less Hassle",
    subtitle: "Advanced no-frost performance with lasting durability.",
    tone: "dark",
    align: "right",
  },
  {
    image: "/hero/verticle-freezer.jpg",
    alt: "Vision vertical freezer",
    kicker: "Vertical Freezer",
    title: "More Space, Clean Design",
    subtitle: "Compact freezer capacity for a smarter modern kitchen.",
    tone: "light",
  },
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <Swiper modules={[Pagination, Autoplay, EffectFade]} effect="fade" pagination={{ clickable: true }} autoplay={{ delay: 4500 }} loop className="hero-swiper">
        {slides.map((slide) => (
          <SwiperSlide key={slide.image}>
            <div className="hero-banner">
              <img src={assetPath(slide.image)} alt={slide.alt} />
              <div className={`hero-copy ${slide.tone === "dark" ? "hero-copy-dark" : ""} ${slide.align === "right" ? "hero-copy-right" : ""}`}>
                <p>{slide.kicker}</p>
                <h1>{slide.title}</h1>
                <span>{slide.subtitle}</span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Hero;
