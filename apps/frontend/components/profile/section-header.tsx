export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="font-serif-display italic text-2xl text-title leading-[1.1] tracking-[-0.005em]">
        {title}
      </h2>
      <p className="mt-1 font-serif-body italic text-sm text-subtitle">
        {description}
      </p>
    </div>
  );
}
