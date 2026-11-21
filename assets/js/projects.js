(function () {
  const dataUrl = new URL('../../data/projects.json', document.currentScript.src);
  let cached;
  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>\"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[char]));
  }
  function load() {
    if (!cached) cached = fetch(dataUrl).then((response) => {
      if (!response.ok) throw new Error('Project data could not be loaded.');
      return response.json();
    }).then((items) => {
      if (!Array.isArray(items)) throw new Error('Project data has an invalid format.');
      return items.sort((a, b) => a.sortOrder - b.sortOrder);
    });
    return cached;
  }
  window.PortfolioProjects = Object.freeze({ load, escapeHTML });
})();
