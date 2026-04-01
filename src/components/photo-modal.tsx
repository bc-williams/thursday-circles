"use client";

type PhotoModalProps = {
  photoUrl: string;
  name: string;
  onClose: () => void;
};

export default function PhotoModal({
  photoUrl,
  name,
  onClose,
}: PhotoModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <div className="relative max-w-sm w-full">
        <img
          src={photoUrl}
          alt={name}
          className="w-full rounded-3xl object-cover"
        />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full bg-black/60 px-3 py-1 text-white text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  );
}