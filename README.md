CSAF Feed Index Viewer

A small, framework-free viewer for browsing CSAF security advisory feeds. Search advisory titles, document IDs and dates, sort the results, and open the provider’s original advisory files.

No installation, build process, backend, or dedicated web server is required. Download the repository and open index.html in a modern browser. An internet connection is required to load the configured remote feed, and the provider must permit browser access (see CORS).

> **Scope:** This project displays a **feed index**. It does not convert individual CSAF JSON advisories into human-readable HTML. The optional HTML links point to pages published separately by the provider.

Features

• Lightweight HTML, CSS and plain JavaScript; no third-party runtime dependencies
• Live search by advisory title, document ID or update date
• Sort by update date, title and document ID; newest first by default
• Open original JSON advisory files
• Optional links to provider-hosted HTML versions
• Local use or optional static hosting (including GitHub Pages)

Quick start: open locally

1. Download the repository as ZIP and extract it, keeping the folder structure intact.
2. Open js/config.js in any text editor and enter your CSAF provider’s feed URL.
3. Double-click index.html to open it in your browser.
4. Search or sort the advisory list.

You do not need Python, Node.js, a build tool, or a local web server. Some browsers restrict network requests made from file:// pages, however. If the feed does not load, check the browser console and the CORS notes below. Hosting the same files on HTTPS may help with file://-specific restrictions, but it does not override the provider’s CORS policy.

Configure your CSAF provider

Open js/config.js and edit:

window.CSAF_VIEWER_CONFIG = {
  feedUrl: 'https://u-blox.csaf-provider.com/.well-known/csaf/white/csaf-feed-tlp-white.json',
  showHtmlLinks: false
};

feedUrl is the full HTTPS URL of the provider’s JSON feed, not the provider’s homepage, not the .html index, and not an individual CSAF advisory JSON file. The bundled u-blox URL is an example; replace it with your own provider’s published feed URL. The viewer currently expects a JSON document containing feed.entry, with fields such as title, id, updated, and content.src (or a suitable link.href). Other feed formats are not automatically supported.

showHtmlLinks controls whether an additional HTML link appears beside JSON. Set it to true only if the provider actually publishes corresponding .html files at the same path as its .json files. The viewer derives these URLs by replacing the .json suffix with .html; it does not generate HTML and does not verify that the target exists.

Example: switch to another provider

window.CSAF_VIEWER_CONFIG = {
  feedUrl: 'https://security.example.org/path/to/actual-feed.json',
  showHtmlLinks: false
};

security.example.org is a placeholder, not a working feed. Use the real feed URL from your CSAF provider documentation. Save the file and reload index.html.

Which files must stay together?

csaf-feed-index-viewer/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js       # Set your provider URL here
│   └── app.js          # Feed loading, filtering and sorting
├── README.md
├── LICENSE
├── CONTRIBUTING.md
└── SECURITY.md

Optional: publish with GitHub Pages

A server is not required for personal use. If you want a public, shareable URL, push the repository to GitHub and select Settings > Pages > Deploy from a branch > main > / (root). GitHub Pages serves the same static files. No backend or deployment workflow is necessary.

Browser access and CORS

The viewer fetches the configured feed directly from the user’s browser. The remote CSAF provider must allow cross-origin requests from the page’s origin. For local file:// usage, browsers commonly send an opaque/null origin, which may be rejected even when the feed is publicly readable.

• If you see Failed to fetch, inspect the browser developer console and network tab.
• Confirm that the JSON feed URL works, returns the expected structure, and is reachable over HTTPS.
• Check whether the provider allows the relevant origin through Access-Control-Allow-Origin.
• For a locally opened file, the provider may need to permit Origin: null or use Access-Control-Allow-Origin: * for public, unauthenticated resources.
• Publishing on GitHub Pages changes the requesting origin but does not bypass CORS.
• Avoid unknown public CORS proxies, especially for private or sensitive advisories.

This project cannot fix a remote provider’s CORS configuration by itself.

Security and limitations

• Remote feed content is treated as untrusted: visible text is inserted as text rather than interpreted as HTML.
• External advisory links are restricted to HTTPS and opened with noopener noreferrer.
• The viewer does not validate CSAF schemas, verify cryptographic signatures, establish advisory authenticity, or assess vulnerability severity.
• A generated HTML link is only a URL convention, not proof of an existing resource.
• The feed index is loaded into browser memory; very large feeds may affect responsiveness.

Please report security issues according to SECURITY.md.

Roadmap and ideas for contributors

• Render individual CSAF JSON advisories as readable HTML, including products, vulnerabilities and remediation
• Accept an advisory JSON file selected locally by the user
• Support additional CSAF feed formats and provider discovery via provider-metadata.json
• Add CVE, product, severity and publication-date filters where the source data permits
• Add accessibility improvements, keyboard navigation and automated browser tests
• Provide optional multi-provider views and configurable branding

These are proposed improvements, not features of the current release.

About the project

Created and shared with the community by Zentric, a cybersecurity consulting and engineering company. Zentric also develops cybersecurity services and solutions, including Redsight, focused on security management and operational workflows.

Learn more: zentric.com.

The viewer is an independent open-source utility. References to Zentric and Redsight do not imply endorsement of, or affiliation with, the CSAF providers whose public feeds are displayed.

Contributing and license

Issues, improvements and pull requests are welcome. See CONTRIBUTING.md.

Distributed under the MIT License. Before publishing, verify that the copyright notice in LICENSE reflects the actual rights holder.