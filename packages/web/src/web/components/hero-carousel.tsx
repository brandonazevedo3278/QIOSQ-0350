import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const slides = [
  {
    src: "/images/hero-carousel/slide-1.webp",
    alt: "Quiosque à beira-mar com cobertura de madeira e sofás azuis",
  },
  {
    src: "/images/hero-carousel/slide-2.webp",
    alt: "Restaurante de praia iluminado ao anoitecer no calçadão",
  },
  {
    src: "/images/hero-carousel/slide-3.webp",
    alt: "Quiosques e calçadão de Copacabana em um dia de céu azul",
  },
  {
    src: "/images/hero-carousel/slide-4.webp",
    alt: "Coqueiros e pessoas passeando na orla de Copacabana",
  },
  {
    src: "/images/hero-carousel/slide-5.webp",
    alt: "Mar, surfistas e faixa de areia com montanhas ao fundo",
  },
  {
    src: "/images/hero-carousel/slide-6.webp",
    alt: "Vista panorâmica da orla iluminada ao entardecer",
  },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const surface = useRef<HTMLElement>(null);
  const advance = (amount: number) =>
    setActive((i) => (i + amount + slides.length) % slides.length);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(preference.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updatePreference();
    updateVisibility();
    preference.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      preference.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (paused || hovered || focused || hidden || reduceMotion) return;
    const timer = window.setInterval(() => advance(1), 6000);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, hidden, reduceMotion, active]);

  useEffect(() => {
    const node = surface.current;
    if (!node) return;
    let start = 0;
    const down = (e: PointerEvent) => {
      start = e.clientX;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerType === "touch" && Math.abs(e.clientX - start) > 50) {
        advance(e.clientX < start ? 1 : -1);
      }
    };
    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    node.addEventListener("pointerdown", down);
    node.addEventListener("pointerup", up);
    node.addEventListener("mouseenter", enter);
    node.addEventListener("mouseleave", leave);
    return () => {
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("mouseenter", enter);
      node.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <section
      ref={surface}
      className="hero-carousel"
      aria-label="Fotografias da orla e dos quiosques"
      aria-roledescription="carrossel"
    >
      <div className="hero-carousel-slides">
        {slides.map((slide, i) => (
          <img
            key={slide.src}
            className={i === active ? "active" : ""}
            src={slide.src}
            alt={slide.alt}
            aria-hidden={i !== active}
            fetchPriority={i === 0 ? "high" : "auto"}
            decoding="async"
          />
        ))}
      </div>
      <div className="hero-carousel-shade" />
      <div className="minimal-photo-caption">
        <span>RIO DE JANEIRO, BRASIL</span>
        <p>Mais tempo para viver o seu momento.</p>
      </div>
      <div
        className="hero-carousel-controls"
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
        }}
      >
        <button aria-label="Imagem anterior" onClick={() => advance(-1)}>
          <ChevronLeft size={18} />
        </button>
        <div className="hero-carousel-dots">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              className={i === active ? "active" : ""}
              aria-label={`Mostrar imagem ${i + 1} de ${slides.length}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              <i />
            </button>
          ))}
        </div>
        <button aria-label="Próxima imagem" onClick={() => advance(1)}>
          <ChevronRight size={18} />
        </button>
        <button
          aria-label={paused ? "Retomar carrossel" : "Pausar carrossel"}
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>
    </section>
  );
}
