import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { assetPath } from "../data/data";

const slides = [
  {
    image: "/hero/side-by-side-refrigerator.jpeg",
    alt: "Vision side by side refrigerator",
  },
  {
    image: "/hero/vertical-freezer.jpeg",
    alt: "Vision vertical freezer",
  },
  {
    image: "/hero/single-door-refrigerator.jpeg",
    alt: "Vision single door refrigerator",
  },
  {
    image: "/hero/no-frost-refrigerator.jpeg",
    alt: "Vision no frost refrigerator",
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
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Hero;
