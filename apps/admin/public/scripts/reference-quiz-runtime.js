(() => {
  function isLoopbackHost(hostname) {
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
  }

  function getRuntimeCandidates() {
    const protocol = window.location.protocol || "http:";
    const currentHost = window.location.hostname || "localhost";
    const hosts = [currentHost];

    if (isLoopbackHost(currentHost)) {
      ["localhost", "127.0.0.1"].forEach((host) => {
        if (!hosts.includes(host)) {
          hosts.push(host);
        }
      });
    }

    return hosts.map((host) => `${protocol}//${host}:4321/scripts/quiz-app.js?v=waitlist-local-1`);
  }

  function loadRuntime(urls, index = 0) {
    if (index >= urls.length) {
      console.warn(
        `[admin references] Unable to load public quiz runtime. Start the web app on :4321 and use the same host, localhost alias, or LAN IP in both apps.`,
      );
      return;
    }

    const script = document.createElement("script");
    script.src = urls[index];
    script.async = false;
    script.crossOrigin = "anonymous";
    script.onerror = () => {
      script.remove();
      loadRuntime(urls, index + 1);
    };

    document.head.appendChild(script);
  }

  loadRuntime(getRuntimeCandidates());
})();
