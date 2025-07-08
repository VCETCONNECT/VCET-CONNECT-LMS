const devtools = {
  isOpen: false,
  orientation: undefined,
};

(function (window) {
  const threshold = 160;

  const emitEvent = (isOpen, orientation) => {
    window.devtools.isOpen = isOpen;
    window.devtools.orientation = orientation;
  };

  const checkDevTools = ({ emitEvents = true } = {}) => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const orientation = widthThreshold ? "vertical" : "horizontal";

    if (
      !(heightThreshold && widthThreshold) &&
      ((window.Firebug &&
        window.Firebug.chrome &&
        window.Firebug.chrome.isInitialized) ||
        widthThreshold ||
        heightThreshold)
    ) {
      if (emitEvents && !devtools.isOpen) {
        emitEvent(true, orientation);
      }
      return true;
    }

    if (emitEvents && devtools.isOpen) {
      emitEvent(false, undefined);
    }
    return false;
  };

  if (typeof window === "object") {
    window.devtools = devtools;
    window.checkDevTools = checkDevTools;
    setInterval(checkDevTools, 1000);
  }
})(typeof window !== "undefined" ? window : {});
