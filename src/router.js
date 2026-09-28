/**
 * STARMAKER Hash Router
 */
export class Router {
  constructor(routes = {}) {
    this.routes = routes;
    this.currentRoute = null;
    this.params = {};

    window.addEventListener("hashchange", () => this.handleRouting());
    window.addEventListener("load", () => this.handleRouting());
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  handleRouting() {
    const rawHash = window.location.hash || "#/";
    const [path] = rawHash.split("?");

    let matchedHandler = null;
    let extractedParams = {};

    for (const [routePattern, handler] of Object.entries(this.routes)) {
      const patternParts = routePattern.split("/");
      const currentParts = path.split("/");

      if (patternParts.length !== currentParts.length) continue;

      let isMatch = true;
      const tempParams = {};

      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(":")) {
          tempParams[patternParts[i].slice(1)] = decodeURIComponent(currentParts[i]);
        } else if (patternParts[i] !== currentParts[i]) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        matchedHandler = handler;
        extractedParams = tempParams;
        this.currentRoute = routePattern;
        break;
      }
    }

    if (!matchedHandler && this.routes["#/"]) {
      matchedHandler = this.routes["#/"];
      this.currentRoute = "#/";
      extractedParams = {};
    }

    this.params = extractedParams;

    window.dispatchEvent(
      new CustomEvent("starmaker:navigate", {
        detail: {
          route: this.currentRoute,
          path,
          params: this.params,
          handler: matchedHandler
        }
      })
    );
  }

  navigate(path) {
    window.location.hash = path;
  }
}
