
# CSAF Feed Index Viewer

A lightweight, open-source viewer for browsing and searching CSAF (Common Security Advisory Framework) security advisory feeds.

The CSAF Feed Index Viewer turns a machine-readable CSAF feed index into a clear, human-readable HTML table.

**No installation, backend, database, framework, or dedicated web server is required.**

The application consists of static HTML, CSS, and JavaScript and runs entirely in your browser.

## Features

- Human-readable overview of CSAF security advisories
- Live search by advisory title, document ID, and update date
- Sortable columns
- Direct links to original CSAF JSON documents
- Optional links to HTML versions of advisories
- Display of provider information and feed metadata
- Responsive layout for desktop and mobile devices
- Configurable CSAF provider URL
- No cookies, tracking, or external JavaScript dependencies
- No backend or database required

## Quick Start

1. Download or clone this repository.
2. Open `index.html` in your browser.
3. The landing page displays the table generated from the bundled JSON feed.
4. Browse, filter, and sort the advisories, then follow **HTML** for a readable
   detail page or **JSON** for the original file.

No installation or build process is necessary.

### Bundled examples and your own advisories

The default landing page is generated from [csaf-feed-tlp-white.json](examples/csaf-feed-tlp-white.json) and links
directly to ten separate CSAF JSON examples in [examples](examples/), covering
routers, controllers, switches, gateways, sensors, panels, drives, firewalls,
cameras, and servers. The examples are fictional
and clearly marked `[TEST DATA]`; they do not describe real vulnerabilities.
Each example includes four explicit product versions, affected/fixed/unaffected
status, a synthetic vulnerability identifier, a CWE classification, CVSS 3.1
scores and vectors, impact and exploitation statements, three remediation
options, references, acknowledgments, and a two-release revision history.
The examples cover different weakness types and severities, including resource
exhaustion, authorization failures, information disclosure, and cross-site
scripting. No real CVE numbers are invented or attributed to these products.
All vendor/support/download links under `example.com` are illustrative
placeholders, not operational endpoints.
The generated table is already present in the HTML, so opening it directly via
`file://` requires no JSON fetch, server, import, or upload. Keep the `examples`
directory alongside `index.html` so the JSON links work.
The JSON feed is the source of truth; do not edit the generated table manually.

To publish your own advisories, replace the example JSON files and update
the example JSON feed: each entry contains the document title, ID,
update date, and `content.src` pointing to its JSON file. Keep these values
consistent with the original advisory's `document` and `document.tracking`
metadata. Document links are resolved relative to the feed URL, not the HTML
page. For local files next to the feed, use `./<filename>.json`, with letters,
digits, underscores, or hyphens in the filename.

After changing the feed or advisory files, regenerate the landing page using
Node.js (no dependencies required):

```sh
node generate-index.mjs
```

The generator also creates a separate HTML detail page for each advisory,
with document metadata, notes, product inventory, vulnerability details,
product status, CVSS scores, remediation instructions, references, revision
history, and the complete JSON content.
The structure is inspired by the public u-blox advisory pages, with an independent
implementation and no copied vendor content or branding. These pages work
offline and link back to the landing page and the original JSON.

The generator checks that titles, IDs, and release dates match the referenced
CSAF documents. Only maintainers need Node.js to update the page; visitors
can simply open the generated HTML. Search and sorting run in the browser.

The page provides a human-readable index before opening the original JSON
documents. The expanded examples have been checked against the official
[CSAF 2.0 schema](https://docs.oasis-open.org/csaf/csaf/v2.0/csaf_json_schema.json)
and its referenced CVSS schemas. All ten examples also pass the strict schema
check and all 43 mandatory CSAF 2.0 tests in
[`@secvisogram/csaf-validator-lib` 3.0.2](https://github.com/secvisogram/csaf-validator-lib),
including product references, status consistency, dates, CWE names, and CVSS
calculations. Validation was run locally, without uploading the documents.
This does not certify a CSAF provider's distribution infrastructure.
The generator checks metadata and rendered product references; it does not
automatically rerun the complete conformance suite after future edits.

### Remote feeds and CORS limitations

**A publicly accessible JSON URL is not necessarily readable by this viewer.**
Opening a URL in a browser tab or retrieving it with `curl` can work even when
JavaScript requests from this page are blocked by Cross-Origin Resource Sharing
(CORS).

The remote provider must send an `Access-Control-Allow-Origin` response header
that permits this page's origin. When opened using `file://`, the page typically
has the origin `null`. The optional u-blox feed was tested with
`Access-Control-Allow-Origin: *` and works with this setup.

Other providers may restrict access. During checks on November 7, 2026:

- MSRC allowed only `https://msrc.microsoft.com`, blocking this local viewer.
- The BSI/CERT-Bund feeds returned JSON but no CORS permission header.

These provider settings can change. A blocked request commonly appears in the
browser console as a CORS error followed by `TypeError: Failed to fetch`.
The viewer cannot read or process the blocked response.

Publishing the viewer on localhost, GitHub Pages, or another static host
**does not automatically fix provider-side CORS restrictions**. It only changes
the page's origin, which the provider must still allow. JavaScript cannot grant
itself this permission, and `fetch` with `mode: "no-cors"` does not help because
the response body is then unreadable.

The generated landing page makes no feed request, avoiding CORS and local file
fetch restrictions. When `feedUrl` is configured, the browser loads that feed
instead; this requires the appropriate CORS permissions. Browsers can also
block a configured local JSON feed under `file://`; such feeds need HTTP(S)
hosting. There is no automatic fallback to example data when a feed fails.
Do not disable browser security to work around restrictions.

A server-side fetch/proxy would be another solution, but is not included in
this static application.

## Configuration

The viewer is provider-independent.

To use your own CSAF provider, edit the configuration in `index.html`.

Locate the following section:

```javascript
const CONFIG = {
  feedUrl: "",

  htmlLinks: false
};
```

### 1. Configure the CSAF Feed URL

Leave `feedUrl` empty to use the table generated from the bundled JSON feed.
To use your own CSAF server, set it to your provider's JSON feed URL.

Example:

```javascript
feedUrl: "https://security.example.com/.well-known/csaf/white/csaf-feed-tlp-white.json"
```

The URL must point to the actual JSON feed, not to an HTML overview page.
It must also not point to `provider-metadata.json`: provider metadata describes
the provider and its distribution directories, but it is not itself a feed.
The directory URLs in that metadata are not interchangeable with a feed URL.

The viewer expects a feed containing an array of advisory entries under:

```text
feed.entry
```

Each entry should provide relevant metadata, including:

- Advisory title
- Document identifier
- Update timestamp
- URL of the CSAF JSON document

The application retrieves these values and creates the searchable index automatically.

### 2. Configure HTML Advisory Links

Some CSAF providers publish an HTML version alongside each JSON advisory.

For example:

```text
https://security.example.com/advisories/advisory-001.json
https://security.example.com/advisories/advisory-001.html
```

If your provider supports this convention, enable:

```javascript
htmlLinks: true
```

The viewer generates the HTML URL by replacing the `.json` extension with `.html`.

If your provider does not publish corresponding HTML files, disable this feature:

```javascript
htmlLinks: false
```

**Note:** For remote feeds, this option only links to existing HTML versions.
The local generator creates HTML versions of the bundled advisories regardless
of this setting. It renders the fields used in the examples, including CVSS 3.x
scores and product-specific remediation. It is not a universal renderer for
every optional CSAF field; all fields remain available in the complete JSON
document on each detail page.

### 3. Save and Reload

After changing the configuration:

1. Save `index.html`.
2. Reload the page in your browser.
3. The viewer displays the generated table or loads the configured JSON feed.

No compilation, package installation, or restart is necessary.

## Optional remote feed: u-blox

The following public feed can be used as an example:

```text
https://u-blox.csaf-provider.com/.well-known/csaf/white/csaf-feed-tlp-white.json
```

The corresponding HTML index is available at:

https://u-blox.csaf-provider.com/.well-known/csaf/white/csaf-feed-tlp-white.html

The u-blox deployment demonstrates how the viewer can be integrated into an existing CSAF provider environment.

This example does not imply that u-blox maintains or endorses this open-source project.

## Browser Compatibility

The viewer uses standard browser technologies:

- HTML5
- CSS3
- JavaScript
- Fetch API

It is designed for current versions of:

- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Apple Safari

No browser extensions or additional software are required.

## CORS and Network Access

The viewer loads CSAF feeds using the browser's Fetch API.

When the HTML page and the CSAF feed are hosted on different origins, the browser enforces Cross-Origin Resource Sharing (CORS) restrictions.

The CSAF provider must allow the requesting origin.

For publicly accessible feeds, a provider may choose to return:

```http
Access-Control-Allow-Origin: *
```

Whether this is appropriate depends on the provider's security and deployment requirements.

The viewer cannot bypass browser CORS restrictions.

When a feed fails to load, check:

1. Whether the configured feed URL is correct.
2. Whether the JSON feed is publicly accessible.
3. Whether the provider permits cross-origin requests.
4. Whether the browser reports a CORS error.
5. Whether the feed uses the expected JSON structure.

Opening the viewer through GitHub Pages does not automatically resolve CORS restrictions imposed by a remote CSAF provider.

## Security Considerations

The viewer processes data retrieved from external CSAF providers.

These feeds should be treated as untrusted input.

The application therefore uses text-based DOM rendering for advisory content rather than inserting untrusted values directly into HTML.

Additional security measures include:

- Restricting advisory links to HTTPS URLs
- Avoiding unnecessary external dependencies
- Opening external links with `rel="noopener noreferrer"`
- Not requiring credentials or API keys
- Not storing advisory data in a backend

The viewer does not modify CSAF documents.

It does not provide cryptographic verification of advisory authenticity or integrity.

For security-critical processing, users should independently verify CSAF documents according to the relevant CSAF specifications and their organization's security requirements.

## Limitations

The current version is intentionally lightweight.

Known limitations include:

- One configured CSAF feed at a time
- Browser access depends on provider CORS policies
- No automatic discovery of CSAF providers
- No built-in CSAF schema validation
- No cryptographic signature verification
- No local advisory archive
- No automatic JSON-to-HTML conversion for individual advisories

These capabilities may be added in future releases.

## Roadmap

Potential future enhancements include:

- Direct rendering of individual CSAF JSON documents
- Support for locally selected CSAF JSON files
- Automatic CSAF provider discovery
- Support for multiple feeds
- Filtering by CVE identifier
- Filtering by affected product
- Filtering by severity
- Additional language options
- Export of filtered advisory lists
- Improved accessibility
- Optional dark mode

Community feedback and contributions are welcome.

## Deployment

The viewer can be used in several ways.

### Local Browser

Download the repository and open `index.html`.

No web server is required to run the application itself.

Remote feed access remains subject to browser security restrictions.

### GitHub Pages

The repository can optionally be published using GitHub Pages.

1. Open the repository settings on GitHub.
2. Navigate to **Pages**.
3. Select **Deploy from a branch**.
4. Select the `main` branch and the root directory.
5. Save the configuration.

GitHub will publish the static website.

### Existing Web Server

The static files can also be copied to an existing web server.

No server-side application, database, or special runtime is required.

## Contributing

Contributions, bug reports, feature requests, and improvements are welcome.

Please open a GitHub issue to discuss significant changes before submitting a pull request.

See `CONTRIBUTING.md` for further information.

## Reporting Security Issues

Please do not publicly disclose potentially exploitable vulnerabilities before coordinated disclosure.

See `SECURITY.md` for reporting instructions.

## License

This project is intended to be distributed under the MIT License.

See the `LICENSE` file for details.

The copyright holder must be specified in the license file before publication.

## About the Project

The CSAF Feed Index Viewer was developed by **Zentric** as part of its work in cybersecurity, product security, and vulnerability management.

Zentric provides cybersecurity consulting, security engineering, and product security services, helping organizations improve their security processes and meet regulatory and industry requirements.

The project reflects Zentric's commitment to practical security tooling, open standards, and accessible vulnerability information.

Zentric also develops **Redsight**, a portfolio of cybersecurity solutions supporting security management and operational security processes.

Learn more:

- Zentric: https://www.zentric.com
- Redsight: https://www.zentric.com

This project is made available to the community as a lightweight, independent open-source utility.

It does not require any commercial Zentric or Redsight product or service.

## Disclaimer

This software is provided "as is", without warranty of any kind.

The viewer displays information supplied by external CSAF providers. The respective providers remain responsible for the content, correctness, and publication of their security advisories.

The project is not affiliated with or endorsed by the CSAF standardization bodies or by any third-party CSAF provider unless explicitly stated.
