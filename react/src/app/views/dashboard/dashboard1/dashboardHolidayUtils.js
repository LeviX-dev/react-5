export const getDaysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  const diff = Math.ceil((target - today) / 86400000);

  if (diff === 0) return { label: "Today", cls: "bg-success text-white" };
  if (diff === 1) return { label: "Tomorrow", cls: "bg-primary text-white" };
  if (diff < 0) return { label: "Past", cls: "bg-secondary text-white" };

  return { label: `${diff} days`, cls: "bg-light text-dark" };
};