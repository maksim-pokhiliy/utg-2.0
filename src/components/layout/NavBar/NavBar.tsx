"use client";

import type { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useCallback, useState } from "react";

import { NavLink } from "@root/components/layout/NavBar/NavLink";

const navbarMainItems = [
  { ref: "/", label: "HOME" },
  { ref: "/category", label: "MERCH" },
];

const StyledNavLink = ({
  isActive,
  className,
  ...linkProps
}: LinkProps & {
  isActive: boolean;
  target?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <NavLink
    className={`${className ?? ""} ${
      isActive ? "text-white" : "text-gray-400 hover:text-white"
    }`}
    {...linkProps}
  />
);

export default function NavBar() {
  const pathname = usePathname();

  const [isMenuShown, setIsMenuShown] = useState(false);
  const [linkRef, setLinkRef] = useState<LinkProps["href"]>(pathname!);

  const toggleOpen = useCallback(
    () => setIsMenuShown(!isMenuShown),
    [isMenuShown]
  );

  return (
    <>
      <button className="relative z-50 mt-2" onClick={toggleOpen}>
        <div className="space-y-2">
          {(isMenuShown
            ? [
                "rotate-45 translate-y-[13px] bg-white",
                "opacity-0 h-0",
                "-rotate-45 translate-y-[-13px] bg-white",
              ]
            : ["bg-gray-600", "bg-gray-600", "bg-gray-600"]
          ).map((className, index) => (
            <span
              key={index}
              className={
                "block h-[4px] w-8 transform transition duration-500 ease-in-out " +
                className
              }
            />
          ))}
        </div>
      </button>

      <nav
        className={`${
          isMenuShown ? "w-full opacity-100" : "w-0 opacity-0"
        } transition-all duration-500 ease-in-out block overflow-hidden fixed animate-sideways-once h-screen bg-black text-white pt-8 z-40 top-0 right-0`}
      >
        <div className="relative flex flex-col gap-2">
          <div className="h-[140px] w-[180px] overflow-hidden sm:h-[200px] sm:w-auto mx-auto">
            <Image
              className="mx-auto z-10"
              src="https://firebasestorage.googleapis.com/v0/b/ukrainian-tactical-gear.appspot.com/o/IMG-0253.PNG?alt=media&token=b2855721-c087-4bea-bdb9-0345dcf8b57f"
              width={240}
              height={240}
              alt="UTG"
            />
          </div>

          <h2 className="text-center text-6xl sm:text-[120px] mb-4 sm:mb-8 z-20">
            UTG
          </h2>
        </div>

        <ul className="flex flex-col items-center gap-4 justify-end mt-10 sm:mt-[100px]">
          {navbarMainItems.map(({ ref, label }) => (
            <li key={ref} className="relative">
              <StyledNavLink
                className="text-lg"
                isActive={ref === linkRef}
                href={ref}
                onClick={() => {
                  setLinkRef(ref);
                  setIsMenuShown(false);
                }}
              >
                {label}
              </StyledNavLink>
            </li>
          ))}

          <div className="flex text-white gap-4 mt-4">
            <StyledNavLink
              className="text-lg"
              isActive={false}
              href="https://www.instagram.com/ukrainian_tactical_gear/"
              target="_blank"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                className="w-5 h-5"
              >
                <path
                  fill="currentColor"
                  d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
                />
              </svg>
            </StyledNavLink>
          </div>
        </ul>
      </nav>
    </>
  );
}
