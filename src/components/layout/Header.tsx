import NavBar from "@root/components/layout/NavBar/NavBar";
import CartBag from "@root/components/ui/CartBag";

export default function Header() {
  return (
    <header className="h-header z-40 w-full">
      <div className="flex px-6 sm:px-14 h-header items-center gap-4 sm:gap-8">
        <h2 className="flex-1 text-xl">
          <a href="/">UTG</a>
        </h2>

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
