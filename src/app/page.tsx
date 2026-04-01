"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { bebas } from "@/lib/fonts";
import CustomDropdown from "@/components/custom-dropdown";

const userConfig = {
  britt: {
    label: "Hi Britt",
    city: "raleigh-durham",
  },
  francesca: {
    label: "Hi Francesca",
    city: "london",
  },
  newcirclesuser: {
    label: "Hi New Circles User",
    city: "raleigh-durham",
  },
} as const;

const userOptions = Object.entries(userConfig).map(([key, user]) => ({
  value: key,
  label: user.label,
}));

type DemoUser = keyof typeof userConfig;

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<DemoUser>("britt");

  function handleTryCircles() {
    const selected = userConfig[currentUser];
    router.push(`/circles?user=${currentUser}&city=${selected.city}`);
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8">
      <div className="mx-auto flex max-w-md justify-center">
        <div className="relative w-full max-w-[390px] overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-2xl">
          <img
            src="/images/thursday-app-feed.png"
            alt="Thursday feed"
            className="block h-auto w-full"
          />

          <div className="absolute left-1/2 top-6 -translate-x-1/2">
            <CustomDropdown
              value={currentUser}
              options={userOptions}
              ariaLabel="Select user"
              onChange={(value) => setCurrentUser(value as DemoUser)}
              buttonClassName={`${bebas.className} min-w-[170px] bg-transparent px-3 text-xl uppercase text-white`}
              menuClassName="w-[220px]"
              optionClassName={`${bebas.className} text-lg uppercase`}
            />
          </div>

          <button
            onClick={handleTryCircles}
            className="absolute right-5 top-30 flex h-16 w-16 animate-[float_2.8s_ease-in-out_infinite] items-center justify-center rounded-full bg-[#EFAFD0] text-white shadow-[0_12px_30px_rgba(255,79,163,0.45)] transition-transform hover:scale-105"
            aria-label="Try Thursday Circles"
          >
            <Image
              src="/icons/thursday-icon.png"
              alt="Thursday"
              width={48}
              height={48}
              className="mt-[5px] object-contain"
            />

            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[9px] font-semibold uppercase text-[#000000] shadow">
              Try Circles
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}