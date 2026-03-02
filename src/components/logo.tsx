import darkLogo from "@/assets/logos/restabot_logo_white.png";
import logo from "@/assets/logos/restabot_logo.png";
import Image from "next/image";


export function Logo() {
  return (
    <div className="relative h-14 max-w-[10.847rem]">
      <Image
        src={logo}
        fill
        className="dark:hidden"
        alt="RestABot logo"
        role="presentation"
        quality={100}
      />

      <Image
        src={darkLogo}
        fill
        className="hidden dark:block"
        alt="RestABot logo"
        role="presentation"
        quality={100}
      />
    </div>
  );
}
