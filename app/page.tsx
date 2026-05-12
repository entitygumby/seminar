"use client";

import { useState, useRef, useEffect } from "react";

/* ──────────────────────── NAVIGATION ──────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#about", label: "About" },
    { href: "#schedule", label: "Schedule" },
    { href: "#venue", label: "Venue" },
    { href: "#register", label: "Register" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-parchment/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="font-serif text-lg font-semibold tracking-wide text-ink">
          Takemusu Aiki Association
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-sans text-sm font-medium tracking-widest uppercase text-ink-light hover:text-crimson transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-ink transition-transform duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-ink transition-opacity duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-ink transition-transform duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-parchment/98 backdrop-blur-md border-t border-ink/5 px-6 pb-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 font-sans text-sm font-medium tracking-widest uppercase text-ink-light hover:text-crimson"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

/* ──────────────────────── SECTION REVEAL ──────────────────────── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────── HERO ──────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden noise-overlay">
      {/* Background kanji */}
      <div className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 kanji-watermark">
        合気道
      </div>

      {/* Large "50" watermark */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 select-none pointer-events-none">
        <span className="font-serif font-bold text-[20rem] md:text-[32rem] leading-none text-crimson/[0.04]">
          50
        </span>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="max-w-3xl ml-auto md:ml-32 lg:ml-48">
          <p className="animate-fade-up font-sans text-xs tracking-[0.3em] uppercase text-crimson font-semibold mb-6">
            Takemusu Aiki Association Inc.
          </p>

          <h1 className="animate-fade-up animation-delay-100">
            <span className="block font-serif text-3xl md:text-5xl font-light text-ink-light leading-tight mb-2">
              50 Year Anniversary Seminar with
            </span>
            <span className="block font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-crimson leading-[0.9] tracking-tight">
              Takayasu
            </span>
            <span className="block font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-crimson leading-[0.9] tracking-tight">
              Sensei
            </span>
          </h1>

          <div className="animate-fade-up animation-delay-300 mt-10 flex flex-col sm:flex-row gap-6 sm:gap-12">
            <div>
              <p className="font-sans text-xs tracking-[0.2em] uppercase text-warm-gray mb-1">Date</p>
              <p className="font-serif text-xl md:text-2xl font-medium">31 Oct &amp; 1 Nov 2026</p>
            </div>
            <div>
              <p className="font-sans text-xs tracking-[0.2em] uppercase text-warm-gray mb-1">Venue</p>
              <p className="font-serif text-xl md:text-2xl font-medium">Pymble Town Hall, Sydney</p>
            </div>
          </div>

          <div className="animate-fade-up animation-delay-400 mt-10 flex flex-wrap gap-4">
            <a
              href="#register"
              className="inline-block bg-crimson text-white font-sans text-sm font-semibold tracking-widest uppercase px-8 py-4 hover:bg-crimson-dark transition-colors duration-300"
            >
              Register Now
            </a>
            <a
              href="#schedule"
              className="inline-block border-2 border-ink/20 text-ink font-sans text-sm font-semibold tracking-widest uppercase px-8 py-4 hover:border-crimson hover:text-crimson transition-colors duration-300"
            >
              View Schedule
            </a>
          </div>

          <p className="animate-fade-up animation-delay-500 mt-8 font-sans text-sm text-crimson font-semibold">
            Limited to 50 attendees — register early to secure your place.
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up animation-delay-600">
        <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-warm-gray">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-warm-gray to-transparent" />
      </div>
    </section>
  );
}

/* ──────────────────────── PHOTO CAROUSEL ──────────────────────── */
const photos = [
  { src: "/photos/dojo-throw.jpg", caption: "Takayasu Sensei demonstrating at the Iwama dojo" },
  { src: "/photos/three-masters.jpg", caption: "With Saito Sensei in Australia, early years" },
  { src: "/photos/saito-takayasu.jpg", caption: "Saito Sensei and Takayasu Sensei" },
  { src: "/photos/bokken-practice.jpg", caption: "Weapons demonstration" },
  { src: "/photos/weapons-demo.jpg", caption: "Handling a live blade" },
  { src: "/photos/jo-technique.jpg", caption: "Ken suburi demonstration" },
];

function PhotoCarousel() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isHovered) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isHovered]);

  const go = (dir: -1 | 1) => setCurrent((prev) => (prev + dir + photos.length) % photos.length);

  return (
    <div
      className="relative w-full overflow-hidden bg-slate-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main image area */}
      <div className="relative aspect-[4/3] md:aspect-[3/2]">
        {photos.map((photo, i) => (
          <div
            key={photo.src}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.caption}
              className="w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}

        {/* Gradient overlay at bottom for caption */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/50 to-transparent" />

        {/* Caption */}
        <div className="absolute bottom-4 left-5 right-16">
          <p className="font-sans text-sm text-white/90 drop-shadow-md transition-opacity duration-500">
            {photos[current].caption}
          </p>
        </div>

        {/* Nav arrows */}
        <button
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-crimson transition-all duration-200 shadow-sm"
          aria-label="Previous photo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-crimson transition-all duration-200 shadow-sm"
          aria-label="Next photo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 py-3 bg-white">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current ? "bg-crimson w-6" : "bg-slate-300 hover:bg-slate-400"
            }`}
            aria-label={`Go to photo ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────── ABOUT ──────────────────────── */
function About() {
  return (
    <section id="about" className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-crimson font-semibold mb-4">
            About the Seminar
          </p>
        </Reveal>

        <Reveal delay={100}>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink mb-12 max-w-2xl">
            50 Years of Authentic Iwama-style Aikido in Australia
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Text — shorter, punchier */}
          <div className="space-y-6">
            <Reveal delay={200}>
              <p className="font-sans text-base leading-relaxed text-ink-light">
                Takayasu Sensei, 7th Dan, is one of the few remaining instructors with direct
                experience of O-Sensei&apos;s teaching — present at O-Sensei&apos;s last class in Iwama
                and a long-term student of the late Morihiro Saito Sensei.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <p className="font-sans text-base leading-relaxed text-ink-light">
                This landmark seminar covers the full spectrum of Takemusu Aiki: fundamental
                principles, throwing techniques, weapons work and practical applications — a
                culmination of five decades of teaching experience.
              </p>
            </Reveal>
            <Reveal delay={400}>
              <p className="font-sans text-base leading-relaxed text-ink-light">
                All aikido-ka are warmly welcome, whether long-term students or visitors from
                other traditions. Numbers are limited to 50.
              </p>
            </Reveal>
          </div>

          {/* Photo carousel */}
          <Reveal delay={250}>
            <PhotoCarousel />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── SCHEDULE ──────────────────────── */
const day1 = [
  { time: "09:00 – 10:00", title: "Registration", desc: "" },
  { time: "10:00 – 11:00", title: "Understanding of Aikido Kihon", desc: "Taino-henko, Kino-nagare, Suwari-waza Ikkyo to Gokyo. Awase-no-kokyu" },
  { time: "11:00 – 11:15", title: "Break", desc: "" },
  { time: "11:15 – 12:15", title: "Understanding of Kihon Throwing Techniques", desc: "Morote-dori Kokyu nage, Shiho-nage, Kote-gaeshi, Irimi-nage" },
  { time: "12:15 – 13:30", title: "Lunch", desc: "" },
  { time: "13:30 – 15:00", title: "Variety of Throwing Techniques", desc: "Shiho-nage, Kote-gaeshi, Irimi-nage, Kokyu-nage, Koshi-nage, Tenchi-nage, Juji-garami" },
  { time: "15:00 – 15:15", title: "Break", desc: "" },
  { time: "15:15 – 16:15", title: "Ushiro-waza & Practical Application", desc: "Variety of Ushiro-waza & practical application of Aikido (Ooyo waza)" },
  { time: "18:30", title: "50th Anniversary Dinner", desc: "Dinner at a local restaurant" },
];

const day2 = [
  { time: "08:30 – 09:00", title: "Registration", desc: "" },
  { time: "09:00 – 10:30", title: "Ken Techniques", desc: "Kihon ken suburi (100 cuts), 7 Ken awase, Kimusubi-no-tachi, 5 Kumi-tachi & variations" },
  { time: "10:30 – 10:45", title: "Break", desc: "" },
  { time: "10:45 – 12:15", title: "Jo Techniques", desc: "31 Jo kata, 13 Jo kata, 7 Jo awase, 10 Kumi-jo, 31 Jo awase" },
  { time: "12:15 – 13:30", title: "Lunch", desc: "" },
  { time: "13:30 – 15:00", title: "Demonstrations", desc: "Demonstration by Aikido instructors & related Japanese martial art instructors (kenjitsu, jujitsu)" },
];

function Schedule() {
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const schedule = activeDay === 1 ? day1 : day2;

  return (
    <section id="schedule" className="relative py-24 md:py-32 bg-parchment-dark">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <Reveal>
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-crimson font-semibold mb-4">
            Programme
          </p>
        </Reveal>

        <Reveal delay={100}>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink mb-12">
            Seminar Schedule
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <div className="flex gap-4 mb-12">
            <button
              onClick={() => setActiveDay(1)}
              className={`font-sans text-sm font-semibold tracking-widest uppercase px-6 py-3 border-2 transition-all duration-300 ${
                activeDay === 1
                  ? "bg-crimson border-crimson text-white"
                  : "border-ink/15 text-ink-light hover:border-crimson/40 hover:text-crimson"
              }`}
            >
              Day 1 — Sat 31 Oct
            </button>
            <button
              onClick={() => setActiveDay(2)}
              className={`font-sans text-sm font-semibold tracking-widest uppercase px-6 py-3 border-2 transition-all duration-300 ${
                activeDay === 2
                  ? "bg-crimson border-crimson text-white"
                  : "border-ink/15 text-ink-light hover:border-crimson/40 hover:text-crimson"
              }`}
            >
              Day 2 — Sun 1 Nov
            </button>
          </div>
        </Reveal>

        <div className="space-y-0">
          {schedule.map((item, i) => (
            <Reveal key={`${activeDay}-${i}`} delay={100 + i * 50}>
              <div className="schedule-row flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 py-5 border-b border-ink/8">
                <span className="font-sans text-sm tracking-wider text-crimson font-medium w-40 shrink-0">
                  {item.time}
                </span>
                <div>
                  <span className="font-serif text-xl md:text-2xl font-semibold text-ink">
                    {item.title}
                  </span>
                  {item.desc && (
                    <p className="font-sans text-sm text-ink-light/70 mt-1">
                      {item.desc}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── PRICING ──────────────────────── */
function Pricing() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-crimson font-semibold mb-4">
            Registration &amp; Payment
          </p>
        </Reveal>

        <Reveal delay={100}>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink mb-12">
            Seminar Fees
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          <Reveal delay={200}>
            <div className="border-2 border-ink/10 p-8 hover:border-crimson/30 transition-colors duration-500 bg-white">
              <p className="font-sans text-xs tracking-[0.2em] uppercase text-warm-gray font-semibold mb-4">Full Seminar</p>
              <p className="font-serif text-5xl font-bold text-crimson mb-2">$150</p>
              <p className="font-sans text-sm text-ink-light">Full training access for both days of the seminar</p>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="border-2 border-ink/10 p-8 hover:border-crimson/30 transition-colors duration-500 bg-white">
              <p className="font-sans text-xs tracking-[0.2em] uppercase text-warm-gray font-semibold mb-4">One Day Training</p>
              <p className="font-serif text-5xl font-bold text-crimson mb-2">$80</p>
              <p className="font-sans text-sm text-ink-light">Single day training access (Saturday or Sunday)</p>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="border-2 border-ink/10 p-8 hover:border-crimson/30 transition-colors duration-500 bg-white">
              <p className="font-sans text-xs tracking-[0.2em] uppercase text-warm-gray font-semibold mb-4">Anniversary Dinner</p>
              <p className="font-serif text-5xl font-bold text-crimson mb-2">TBC</p>
              <p className="font-sans text-sm text-ink-light">Saturday dinner party with Takayasu Sensei at a local restaurant (optional)</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={500}>
          <p className="mt-8 font-sans text-sm text-ink-light">
            Payment details will be provided upon registration confirmation. Payment is reconciled offline.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────── VENUE ──────────────────────── */
function Venue() {
  return (
    <section id="venue" className="py-24 md:py-32 bg-parchment-dark relative noise-overlay">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <Reveal>
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-crimson font-semibold mb-4">
                Location
              </p>
            </Reveal>

            <Reveal delay={100}>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink mb-8">
                Seminar Venue
              </h2>
            </Reveal>

            <Reveal delay={200}>
              <div className="space-y-4">
                <div>
                  <p className="font-serif text-2xl font-semibold text-ink">Ku-ring-gai Town Hall</p>
                  <p className="font-sans text-base text-ink-light mt-1">1186 Pacific Highway</p>
                  <p className="font-sans text-base text-ink-light">Pymble, NSW 2073</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-8 p-6 border-l-4 border-crimson bg-white">
                <p className="font-sans text-xs tracking-[0.2em] uppercase text-warm-gray font-semibold mb-2">Parking</p>
                <p className="font-sans text-sm text-ink-light">Limited parking available on-site at the Town Hall.</p>
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal delay={200}>
              <div className="bg-ink/5 h-72 md:h-full min-h-[300px] flex items-center justify-center overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3316.4!2d151.143!3d-33.746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12a8c0b7e5d7e9%3A0x1c045b0c85b99b1c!2sKu-ring-gai%20Town%20Hall!5e0!3m2!1sen!2sau!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "300px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ku-ring-gai Town Hall map"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── REGISTRATION FORM ──────────────────────── */
function RegistrationForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dojo: "",
    rank: "",
    registrationType: "both" as "saturday" | "sunday" | "both",
    attendDinner: false,
    dietaryRequirements: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      setStatus("success");
      setForm({ name: "", email: "", phone: "", dojo: "", rank: "", registrationType: "both", attendDinner: false, dietaryRequirements: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (status === "success") {
    return (
      <section id="register" className="py-24 md:py-32 bg-parchment-dark relative">
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <div className="kanji-accent text-[6rem] leading-none font-bold text-crimson/15 mb-6" style={{ fontFamily: "var(--font-jp)" }}>
            合
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink mb-6">
            Registration Received
          </h2>
          <p className="font-sans text-lg text-ink-light mb-4">
            Thank you for registering your interest. You will receive a confirmation
            email with payment details shortly.
          </p>
          <p className="font-sans text-sm text-warm-gray">
            If you have any questions, please contact{" "}
            <a href="mailto:seminar@aikidoaus.com.au" className="text-crimson hover:underline">
              seminar@aikidoaus.com.au
            </a>
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-8 inline-block border-2 border-ink/15 text-ink font-sans text-sm font-semibold tracking-widest uppercase px-8 py-4 hover:border-crimson hover:text-crimson transition-colors duration-300"
          >
            Register Another Person
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="register" className="py-24 md:py-32 bg-parchment-dark relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <Reveal>
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-crimson font-semibold mb-4">
                Secure Your Place
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink mb-6">
                Register Your Interest
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="font-sans text-base text-ink-light mb-8 leading-relaxed">
                Numbers are limited to 50 attendees. Register your interest below and
                we will confirm your place and provide payment details.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-crimson mt-2 shrink-0" />
                  <p className="font-sans text-sm text-ink-light">Full seminar: <span className="text-ink font-semibold">$150</span> (two days)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-crimson mt-2 shrink-0" />
                  <p className="font-sans text-sm text-ink-light">Anniversary dinner: <span className="text-ink font-semibold">TBC</span> (optional)</p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full bg-white border border-ink/10 text-ink font-sans text-sm px-4 py-3 placeholder-warm-gray/60"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full bg-white border border-ink/10 text-ink font-sans text-sm px-4 py-3 placeholder-warm-gray/60"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full bg-white border border-ink/10 text-ink font-sans text-sm px-4 py-3 placeholder-warm-gray/60"
                  placeholder="04xx xxx xxx"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-2">
                    Dojo / Organisation
                  </label>
                  <input
                    type="text"
                    value={form.dojo}
                    onChange={(e) => update("dojo", e.target.value)}
                    className="w-full bg-white border border-ink/10 text-ink font-sans text-sm px-4 py-3 placeholder-warm-gray/60"
                    placeholder="Your dojo"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-2">
                    Rank / Grade
                  </label>
                  <input
                    type="text"
                    value={form.rank}
                    onChange={(e) => update("rank", e.target.value)}
                    className="w-full bg-white border border-ink/10 text-ink font-sans text-sm px-4 py-3 placeholder-warm-gray/60"
                    placeholder="e.g. 3rd Kyu"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-3">
                  Registration Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "both", label: "Both Days", price: "$150" },
                    { value: "saturday", label: "Saturday Only", price: "$80" },
                    { value: "sunday", label: "Sunday Only", price: "$80" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("registrationType", opt.value)}
                      className={`text-left px-4 py-3 border-2 transition-all duration-200 ${
                        form.registrationType === opt.value
                          ? "border-crimson bg-crimson/5"
                          : "border-ink/10 bg-white hover:border-ink/20"
                      }`}
                    >
                      <span className={`block font-sans text-sm font-medium ${
                        form.registrationType === opt.value ? "text-crimson" : "text-ink"
                      }`}>
                        {opt.label}
                      </span>
                      <span className="block font-sans text-xs text-warm-gray mt-0.5">{opt.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="dinner"
                  checked={form.attendDinner}
                  onChange={(e) => update("attendDinner", e.target.checked)}
                  className="w-4 h-4 accent-crimson"
                />
                <label htmlFor="dinner" className="font-sans text-sm text-ink-light cursor-pointer">
                  Add Anniversary Dinner — Saturday evening (price TBC)
                </label>
              </div>

              <div>
                <label className="block font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-2">
                  Dietary Requirements
                </label>
                <input
                  type="text"
                  value={form.dietaryRequirements}
                  onChange={(e) => update("dietaryRequirements", e.target.value)}
                  className="w-full bg-white border border-ink/10 text-ink font-sans text-sm px-4 py-3 placeholder-warm-gray/60"
                  placeholder="Any dietary requirements for dinner"
                />
              </div>

              {status === "error" && (
                <p className="font-sans text-sm text-crimson">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-crimson text-white font-sans text-sm font-semibold tracking-widest uppercase px-8 py-4 hover:bg-crimson-dark transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {status === "submitting" ? "Submitting..." : "Register Interest"}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── FOOTER ──────────────────────── */
function Footer() {
  return (
    <footer className="py-16 border-t border-ink/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <p className="font-serif text-xl font-semibold text-ink mb-4">Takemusu Aiki Association Inc.</p>
            <p className="font-sans text-sm text-ink-light leading-relaxed">
              Preserving and transmitting the authentic teachings of O-Sensei Morihei Ueshiba&apos;s Takemusu Aiki.
            </p>
          </div>

          <div>
            <p className="font-sans text-xs tracking-[0.2em] uppercase text-warm-gray font-semibold mb-4">
              Contact
            </p>
            <a
              href="mailto:seminar@aikidoaus.com.au"
              className="font-sans text-sm text-ink-light hover:text-crimson transition-colors block mb-2"
            >
              seminar@aikidoaus.com.au
            </a>
            <a
              href="https://www.aikidoaus.com.au"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-sm text-ink-light hover:text-crimson transition-colors"
            >
              www.aikidoaus.com.au
            </a>
          </div>

          <div>
            <p className="font-sans text-xs tracking-[0.2em] uppercase text-warm-gray font-semibold mb-4">
              Quick Links
            </p>
            <div className="space-y-2">
              <a href="#about" className="block font-sans text-sm text-ink-light hover:text-crimson transition-colors">About</a>
              <a href="#schedule" className="block font-sans text-sm text-ink-light hover:text-crimson transition-colors">Schedule</a>
              <a href="#venue" className="block font-sans text-sm text-ink-light hover:text-crimson transition-colors">Venue</a>
              <a href="#register" className="block font-sans text-sm text-ink-light hover:text-crimson transition-colors">Register</a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-ink/10 text-center">
          <p className="font-sans text-xs text-warm-gray">
            &copy; {new Date().getFullYear()} Takemusu Aiki Association Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────── PAGE ──────────────────────── */
export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <About />
      <Schedule />
      <Pricing />
      <Venue />
      <RegistrationForm />
      <Footer />
    </main>
  );
}
