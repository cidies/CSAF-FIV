# CSAF-FIV
CSAF-Feed-Index-Viewer
# CSAF Feed Index Viewer

A lightweight, framework\-free browser interface for listing, searching and sorting CSAF advisory feed entries\.

## Features

- Load a JSON feed with a `feed.entry` array
- Search by advisory title, document ID and update date
- Sort by date, title or document ID
- Open the original JSON advisory
- Optional links to corresponding HTML files when the provider actually publishes them
- Static hosting without a backend or build step

## Quick start

1. Fork or clone this repository\.
2. Set `feedUrl` in `js/config.js` to your provider’s HTTPS JSON feed\.
3. Set `showHtmlLinks: true` only if your provider publishes HTML documents at the matching `.html` paths\.
4. Serve the repository via HTTPS or a local development server, e\.g\. `python3 -m http.server 8000`\.
5. Open `http://localhost:8000`\.

## GitHub Pages

In repository **Settings \> Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`\. GitHub Pages will serve `index.html`\. No workflow is required\.

## Important limitations

This project is a **feed index**, not a CSAF document renderer\. It does not convert advisory JSON to HTML, validate CSAF schemas, or verify signatures\. It expects the JSON feed structure used by the included example configuration, which may differ from other providers’ formats\. HTML links are optional URL conventions, not proof that HTML resources exist\.

Browser cross\-origin requests require the CSAF provider to permit access through CORS\. GitHub Pages cannot override a provider’s CORS policy\. Do not use an untrusted public CORS proxy\.

## Security

Remote titles, IDs and error messages are inserted with `textContent`, not HTML\. External links must use HTTPS and open with `rel="noopener noreferrer"`\. Do not treat displayed feed content as validated security intelligence\. Report vulnerabilities privately as described in [SECURITY\.md](SECURITY.md)\.

## License

MIT\. See [LICENSE](LICENSE)\.

## Contributions

Issues and pull requests are welcome\. See [CONTRIBUTING\.md](CONTRIBUTING.md)\.
