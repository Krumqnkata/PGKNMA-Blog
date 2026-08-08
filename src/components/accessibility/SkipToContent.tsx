export default function SkipToContent() {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;

    event.preventDefault();
    mainContent.focus({ preventScroll: true });
    mainContent.scrollIntoView({ behavior: "auto", block: "start" });
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="fixed left-4 top-3 z-[100000] -translate-y-24 rounded-md border-2 border-black bg-yellow-300 px-4 py-3 font-semibold text-black shadow-lg transition-transform focus:translate-y-0 focus:outline-none"
    >
      Прескочи към съдържанието
    </a>
  );
}
