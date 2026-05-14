import sceneBg from "@/assets/scene-bg.png";

export function SceneBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${sceneBg})` }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(0.95_0.08_140/0.15)_100%)]" />
    </div>
  );
}