export const formatComplex = (c: any): string => {
  const re = Number(c.re);
  const im = Number(c.im);
  const fmt = (n: number) => {
    if (Math.abs(n) < 1e-4) return '0';
    if (Math.abs(n - Math.round(n)) < 1e-4) return Math.round(n).toString();
    return n.toFixed(2);
  };
  
  if (Math.abs(im) < 1e-4) return fmt(re);
  if (Math.abs(re) < 1e-4) return `${fmt(im)}i`;
  return `${fmt(re)}${im > 0 ? '+' : ''}${fmt(im)}i`;
};
