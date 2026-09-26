export function money(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function long(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function longDate(iso: string): string {
  return iso ? long(parseDate(iso)) : '____________';
}

export function ordinal(n: number): string {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${suffix[(v - 20) % 10] || suffix[v] || suffix[0]}`;
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parseDate(toIso).getTime() - parseDate(fromIso).getTime()) / 86_400_000);
}

export function proratedRent(monthly: number, startIso: string) {
  const start = parseDate(startIso);
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const days = daysInMonth - start.getDate() + 1;
  return {
    partial: start.getDate() !== 1,
    days,
    amount: Math.round((monthly / daysInMonth) * days * 100) / 100,
    through: long(new Date(start.getFullYear(), start.getMonth(), daysInMonth)),
  };
}

export function joinNames(names: string[]): string {
  if (names.length <= 2) return names.join(' and ');
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}
