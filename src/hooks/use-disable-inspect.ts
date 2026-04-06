import { useEffect } from 'react';

/**
 * Custom hook to disable right-click (context menu) and common developer tools 
 * keyboard shortcuts like F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, and Ctrl+U.
 */
export const useDisableInspect = () => {
  useEffect(() => {
    const showWarning = () => {
      console.log(
        "%cСТОП!",
        "color: red; font-size: 50px; font-weight: bold; -webkit-text-stroke: 1px black;"
      );
      console.log(
        "%cStrictly Dev Only: Модифицирането на кода тук компрометира защитата на вашите данни. Действайте на собствен риск.",
        "color: yellow; font-size: 18px; font-weight: bold; text-shadow: 2px 2px black;"
      );
    };
    
    showWarning();

    // Check periodically if devtools are open
    const intervalId = setInterval(() => {
      // Threshold for detecting docked devtools
      const threshold = 160;
      const isDocked = window.outerWidth - window.innerWidth > threshold || 
                       window.outerHeight - window.innerHeight > threshold;

      if (isDocked) {
        showWarning();
      }
    }, 30000);

    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable common developer tools keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        // F12 key
        e.key === "F12" ||
        // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Elements)
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C" || e.key === "i" || e.key === "j" || e.key === "c")) ||
        // Ctrl+U (View Source)
        (e.ctrlKey && (e.key === "u" || e.key === "U"))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup listeners on unmount
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
};
