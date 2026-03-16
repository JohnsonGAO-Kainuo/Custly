export const MarketingBackdrop = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(42,95,106,0.14),_transparent_60%)]" />
    <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,_rgba(42,95,106,0.08)_1px,_transparent_1px),_linear-gradient(to_bottom,_rgba(42,95,106,0.08)_1px,_transparent_1px)] [background-size:48px_48px]" />
    <div className="absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
    <div className="absolute top-1/3 left-[-12%] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
    <div className="absolute bottom-[-20%] right-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
    <div className="absolute bottom-20 left-1/2 h-40 w-40 -translate-x-1/2 rotate-12 rounded-3xl bg-primary/10 blur-2xl" />
  </div>
);
