
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
3. The application automatically attempts to load the configured CSAF feed.
4. Browse, filter, and sort the available advisories.

No installation or build process is necessary.

**Important:** Some browsers restrict cross-origin network requests when an HTML file is opened directly using the `file://` protocol.

The application itself does not require a server. However, retrieving a remote CSAF feed depends on the browser's security policies and the provider's CORS configuration.

If a remote feed cannot be loaded locally, the same files can optionally be published using GitHub Pages or any static web hosting service.

## Configuration

The viewer is provider-independent.

To use your own CSAF provider, edit the configuration in `index.html`.

Locate the following section:

```javascript
const CONFIG = {
  feedUrl:
    "https://u-blox.csaf-provider.com/.well-known/csaf/white/csaf-feed-tlp-white.json",

  htmlLinks: true
};
```

### 1. Configure the CSAF Feed URL

Replace the value of `feedUrl` with the URL of your provider's CSAF feed.

Example:

```javascript
feedUrl: "https://security.example.com/.well-known/csaf/white/csaf-feed-tlp-white.json"
```

The URL must point to the actual JSON feed, not to an HTML overview page.

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

**Note:** The viewer does not currently convert individual CSAF JSON documents into HTML. It only links to existing HTML versions.

### 3. Save and Reload

After changing the configuration:

1. Save `index.html`.
2. Reload the page in your browser.
3. The viewer will retrieve the newly configured feed.

No compilation, package installation, or restart is necessary.

## Example: u-blox CSAF Feed

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
