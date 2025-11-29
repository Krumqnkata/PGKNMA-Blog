import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

const SNOWFLAKE_COUNT = 100;

interface Snowflake {
  id: number;
  style: React.CSSProperties;
}

const Snowfall = () => {
  const { theme } = useTheme();
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const generatedSnowflakes: Snowflake[] = [];
    const logoUrl = theme === 'dark' ? '/logo-dark.png' : '/logo-light.png';

    for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
      const size = Math.random() * 30 + 10; // 10px to 40px
      const animationDuration = Math.random() * 15 + 10; // 10s to 25s
      const animationDelay = Math.random() * -25; // Start at different times
      const left = Math.random() * 100;

      generatedSnowflakes.push({
        id: i,
        style: {
          position: 'absolute',
          top: '-5%',
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}vw`,
          animation: `fall ${animationDuration}s linear ${animationDelay}s infinite`,
          backgroundImage: `url(${logoUrl})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          willChange: 'transform, opacity',
        },
      });
    }
    setSnowflakes(generatedSnowflakes);
  }, [theme]);

  return (
    <div
      className="fixed inset-0 w-screen h-screen pointer-events-none -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {snowflakes.map(({ id, style }) => (
        <div key={id} style={style} />
      ))}
    </div>
  );
};

export default Snowfall;