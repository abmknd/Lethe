export const DAY_OPTIONS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function formatHour(hour: number) {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized >= 12 ? 'PM' : 'AM';
  const base = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${base}:00 ${suffix}`;
}

export function formatSlot(dayOfWeek: number, startHour: number, endHour: number) {
  const day = DAY_OPTIONS.find((item) => item.value === dayOfWeek)?.label ?? '?';
  return `${day} ${formatHour(startHour)} - ${formatHour(endHour)}`;
}
