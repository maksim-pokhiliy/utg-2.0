export default function Footer() {
  return (
    <footer className="w-full m-h-56 bg-black leading-7">
      <div className="mx-auto flex items-center py-3 sm:py-11 px-6 sm:px-14 text-12 sm:text-xs">
        <p className="font-default text-white flex-1">
          © {new Date().getFullYear()} BY UTG.
        </p>
      </div>
    </footer>
  );
}
