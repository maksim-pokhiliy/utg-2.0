import NavBar from "@root/components/layout/NavBar/NavBar";
import CartBag from "@root/components/ui/CartBag";
import LanguageSwitcher from "@root/components/ui/LanguageSwitcher";
import { NavLink } from "@root/components/layout/NavBar/NavLink";

export default function Header() {
  return (
    <header className="h-header z-40 w-full">
      <div className="flex px-6 sm:px-14 h-header items-center gap-4 sm:gap-8">
        <h2 className="flex-1 text-xl">
          <NavLink href="/">UTG</NavLink>
        </h2>

        <div>
          <LanguageSwitcher />
        </div>

        <div>
          <CartBag />
        </div>

        <div>
          <NavBar />
        </div>
      </div>
    </header>
  );
}
