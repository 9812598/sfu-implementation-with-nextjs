"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1 className="text-4xl font-bold">Video Conference App</h1>

        <div className="flex flex-col gap-12 items-center">
          {/* <div className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-semibold">Video Broadcast</h2>
            <div className="flex gap-4">
              <Link
                href="/broadcast/publish"
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8"
              >
                Publish Stream
              </Link>
              <Link
                href="/broadcast/subscribe"
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8"
              >
                Watch Stream
              </Link>
            </div>
          </div> */}

          <div className="flex flex-col items-center gap-6">
            <Link
              href="/conference"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8"
            >
              Join Conference
            </Link>
          </div>
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/help"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="Help icon"
            width={16}
            height={16}
          />
          Help
        </Link>
        {/* <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/settings"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Settings icon"
            width={16}
            height={16}
          />
          Settings
        </Link> */}
      </footer>
    </div>
  );
}
