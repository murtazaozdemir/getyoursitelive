export function ThemeScript() {
  const script = `
    (function() {
      try {
        var saved = localStorage.getItem("precision-theme");
        var parsed = saved ? JSON.parse(saved) : null;
        var theme = parsed?.state?.theme || "industrial";
        document.documentElement.setAttribute("data-theme", theme);
      } catch (e) {
        document.documentElement.setAttribute("data-theme", "industrial");
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
