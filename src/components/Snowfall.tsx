import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import './Snowfall.css';

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
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}vw`,
          animationDuration: `${animationDuration}s`,
          animationDelay: `${animationDelay}s`,
          backgroundImage: `url(${logoUrl})`,
        },
      });
    }
    setSnowflakes(generatedSnowflakes);
  }, [theme]);

  return (
    <div className="snowfall-container" aria-hidden="true">
      {snowflakes.map(({ id, style }) => (
        <div key={id} className="snowflake" style={style} />
      ))}
    </div>
  );
};

export default Snowfall;
