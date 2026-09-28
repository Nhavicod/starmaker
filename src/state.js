/**
 * STARMAKER Reactive Store
 * Patrón Observer con inmutabilidad estricta.
 */

export function createStore(initialState = {}) {
  let state = Object.freeze({ ...initialState });
  const listeners = new Set();

  const getState = () => state;

  const setState = (updater) => {
    const nextPartial = typeof updater === "function" ? updater(state) : updater;
    if (!nextPartial || typeof nextPartial !== "object") return;

    const previousState = state;
    const candidateState = { ...state, ...nextPartial };

    const hasChanged = Object.keys(candidateState).some(
      (key) => candidateState[key] !== previousState[key]
    );

    if (hasChanged) {
      state = Object.freeze(candidateState);
      listeners.forEach((listener) => {
        try {
          listener(state, previousState);
        } catch (err) {
          console.error("[STARMAKER Store Error]", err);
        }
      });
    }
  };

  const subscribe = (listener) => {
    if (typeof listener !== "function") throw new TypeError("Listener debe ser función.");
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
}
