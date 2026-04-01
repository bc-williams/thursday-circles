type AvatarProps = {
  name: string;
  photoUrl?: string | null;
  isCurrentUser?: boolean;
  size?: "sm" | "md";
  onClick?: () => void;
};

export default function Avatar({
  name,
  photoUrl,
  isCurrentUser,
  size = "md",
  onClick,
}: AvatarProps) {
  const sizeClass = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const textClass = size === "sm" ? "text-xs" : "text-sm";
  const clickable = Boolean(onClick);

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        onClick={onClick}
        className={`${sizeClass} rounded-full border border-white/10 object-cover ${
          clickable ? "cursor-pointer hover:opacity-80" : ""
        }`}
      />
    );
  }

  const parts = name.split(" ").filter(Boolean);
  const initials = isCurrentUser
    ? "Y"
    : parts.length === 0
      ? "?"
      : parts.length === 1
        ? parts[0].charAt(0).toUpperCase()
        : `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`flex ${sizeClass} items-center justify-center rounded-full bg-white/10 font-semibold text-white ${textClass} ${
        clickable ? "cursor-pointer hover:opacity-80" : ""
      }`}
    >
      {initials}
    </div>
  );
}