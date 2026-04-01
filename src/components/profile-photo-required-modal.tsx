"use client";

import { bebas, archivo } from "@/lib/fonts";

type ProfilePhotoRequiredModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddPhoto: () => void;
};

export default function ProfilePhotoRequiredModal({
  isOpen,
  onClose,
  onAddPhoto,
}: ProfilePhotoRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
      <div className="relative w-full max-w-sm rounded-[28px] border border-white/10 bg-[#111111] p-6 text-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20"
        >
          ×
        </button>

        <div className="pr-10">
          <h2 className={`${bebas.className} text-3xl uppercase leading-none`}>
            Add a profile photo to host
          </h2>

          <p className={`${archivo.className} mt-4 text-sm leading-6 text-white/80`}>
            You’ll need a profile photo before hosting a meetup. It helps people
            feel comfortable joining real-world events.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddPhoto}
          className={`${bebas.className} mt-6 w-full rounded-full bg-[#EFAFD0] px-4 py-3 text-lg uppercase text-black transition hover:scale-[1.01]`}
        >
          Add profile photo
        </button>
      </div>
    </div>
  );
}