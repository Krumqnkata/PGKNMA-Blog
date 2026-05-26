import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

const ParticlesComponent = (props: { id?: string; theme?: string }) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {};

const isDark = props.theme === "dark";

const options: ISourceOptions = useMemo(
  () => ({
    background: { color: { value: "transparent" } },
    fpsLimit: 30,
    interactivity: {
      events: {
        onHover: { enable: false },
        onClick: { enable: false },
      },
    },
    particles: {
      color: {
        // Светла тема: тийл нюанси, видими върху светлия фон
        // Тъмна тема: по-светли тийл/cyan, видими върху тъмния фон
        value: isDark
          ? ["#2dd4bf", "#5eead4", "#a7f3d0"]
          : ["#0d9488", "#0f766e", "#115e59"],
      },
      links: { enable: false }, // без линии
      move: {
        enable: true,
        direction: "none",
        outModes: { default: "out" },
        speed: 0.4,         // много бавно = ambient ефект
        random: true,
        straight: false,
      },
      number: {
        value: 50,          // само 35 частици
        density: { enable: false },
      },
      opacity: {
        value: isDark
          ? { min: 0.15, max: 0.45 }  // тъмна: по-видими
          : { min: 0.25, max: 0.6 },  // светла: по-наситени
        animation: {
          enable: true,
          speed: 0.4,       // бавно избледняване
          sync: false,
        },
      },
      shape: {
        type: "circle",     // само запълнени кръгове, без outline
      },
      size: {
        value: { min: 2, max: 5 }, // без size animation — то причиняваше outline ефекта
      },
    },
    detectRetina: false,
  }),
  [isDark]
);

  if (init) {
    return (
      <Particles
        id={props.id}
        particlesLoaded={particlesLoaded}
        options={options}
        className="absolute top-0 left-0 w-full h-full z-0"
      />
    );
  }

  return <></>;
};

export default ParticlesComponent;