/**
 * AC-11.2: in Zen mode the controls fade to opacity 0 with pointer-events none in 300 ms, but stay in the page.
 * Keeping them in the page keeps the layout still, so the clock never jumps when Zen starts or ends.
 * `inert` also takes them out of keyboard focus and screen readers while hidden.
 */
export function zenHiddenProps(isZen: boolean, className = ''): Record<string, string | boolean | undefined> {
  return {
    className: `${className} transition-opacity duration-300 motion-reduce:transition-none ${
      isZen ? 'pointer-events-none opacity-0' : 'opacity-100'
    }`,
    'aria-hidden': isZen || undefined,
    inert: isZen ? '' : undefined,
  };
}
