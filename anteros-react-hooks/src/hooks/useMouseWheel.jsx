import { useEffect, useState } from 'react';

export default () => {
  const [mouseWheelScrolled, setMouseWheelScrolled] = useState(0);
  useEffect(() => {
    const updateScroll = (e) => {
      setMouseWheelScrolled(e.deltaY + mouseWheelScrolled);
    };
    window.addEventListener('wheel', updateScroll, false);
    return () => window.removeEventListener('wheel', updateScroll);
  });
  return mouseWheelScrolled;
};
