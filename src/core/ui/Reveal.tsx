import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Position in a group: each next item starts a little later. */
  index?: number;
  as?: 'div' | 'li' | 'figure' | 'section';
  /** Show the content at once, without the slide-in. For what is already on screen when the page opens. */
  immediate?: boolean;
}

/**
 * Slides its content in the first time it scrolls into view (styles in src/app/site/site.css).
 * Without IntersectionObserver (old browsers, tests) the content is simply shown.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  className = '',
  index = 0,
  as: Tag = 'div',
  immediate = false,
}) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setVisible] = useState(() => immediate || typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const element = ref.current;
    if (isVisible || !element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // The area reaches far above the screen, so content that a fast scroll jumps past is shown as well.
      { rootMargin: '100000px 0px -8% 0px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`site-reveal ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ '--i': index } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
};
