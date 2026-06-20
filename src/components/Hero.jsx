import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { assetPath } from "../data/data";

const slides = [
  {
    image: "/hero/kettle-blue-tea.jpeg",
    alt: "Vision blue kettle with tea",
  },
  {
    image: "/hero/kettle-glass-boiling.jpeg",
    alt: "Vision glass electric kettle",
  },
  {
    image: "/hero/kettle-red-electric.jpeg",
    alt: "Vision red electric kettle",
  },
  {
    image: "/hero/kettle-black-electric.jpeg",
    alt: "Vision black electric kettle",
  },
  {
    image: "/hero/kettle-steel-electric.jpeg",
    alt: "Vision steel electric kettle",
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
