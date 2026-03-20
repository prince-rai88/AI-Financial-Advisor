const toastTarget = new EventTarget();

export function notify(message, type = "info") {
  toastTarget.dispatchEvent(
    new CustomEvent("toast", {
      detail: {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        message,
        type,
      },
    })
  );
}

export function subscribeToToasts(listener) {
  const handler = (event) => listener(event.detail);
  toastTarget.addEventListener("toast", handler);
  return () => toastTarget.removeEventListener("toast", handler);
}
