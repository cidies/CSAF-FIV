import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const pageUrl = new URL("./index.html", import.meta.url);
const feedUrl = new URL("./examples/csaf-feed-tlp-white.json", import.meta.url);
const data = JSON.parse(readFileSync(feedUrl, "utf8"));
const feed = data?.feed;

if (!feed || typeof feed.title !== "string" ||
    !Number.isFinite(Date.parse(feed.updated)) || !Array.isArray(feed.entry)) {
  throw new Error("Invalid example feed: expected title, updated and entry array.");
}

function escape(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

const detailPages = [];
function referenceLink(url, label) {
  const target = new URL(url);
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    throw new Error(`Unsupported reference protocol: ${target.protocol}`);
  }
  return `<a href="${escape(target.href)}">${escape(label)}</a>`;
}

function renderNotes(notes = [], heading = "h2") {
  return notes.map(note =>
    `<section><${heading}>${escape(note.title ?? note.category)}</${heading}><p>${escape(note.text)}</p></section>`
  ).join("\n");
}

function renderReferences(references = []) {
  return references.length
    ? `<h3>References</h3><ul>${references.map(ref =>
      `<li>${referenceLink(ref.url, ref.summary)}</li>`).join("")}</ul>`
    : "";
}

function detailPage(data, jsonName) {
  const doc = data.document;
  const products = new Map();
  function addProduct(product) {
    if (products.has(product.product_id)) {
      throw new Error(`Duplicate product ID: ${product.product_id}`);
    }
    products.set(product.product_id, product.name);
  }
  function collectProducts(branches = []) {
    branches.forEach(branch => {
      if (branch.product) addProduct(branch.product);
      collectProducts(branch.branches);
    });
  }
  collectProducts(data.product_tree?.branches);
  (data.product_tree?.full_product_names ?? []).forEach(addProduct);
  (data.product_tree?.relationships ?? []).forEach(rel => addProduct(rel.full_product_name));
  function productNames(ids) {
    return ids.map(id => {
      if (!products.has(id)) throw new Error(`Undefined product ID: ${id}`);
      return escape(products.get(id));
    }).join(", ");
  }
  const productRows = Array.from(products, ([id, name]) =>
    `<tr><td>${escape(name)}</td><td>${escape(id)}</td></tr>`).join("\n");
  const vulnerabilities = (data.vulnerabilities ?? []).map(vulnerability => {
    const statuses = Object.entries(vulnerability.product_status ?? {}).map(([status, ids]) =>
      `<tr><td>${escape(status.replaceAll("_", " "))}</td><td>${productNames(ids)}</td></tr>`
    ).join("\n");
    const scores = (vulnerability.scores ?? []).map(score => {
      const cvss = score.cvss_v3;
      if (!cvss) return "";
      return `<li>${productNames(score.products)}: <strong>${escape(cvss.baseScore)} (${escape(cvss.baseSeverity)})</strong>
        <br>CVSS ${escape(cvss.version)}: <code>${escape(cvss.vectorString)}</code></li>`;
    }).join("\n");
    const threats = (vulnerability.threats ?? []).map(threat =>
      `<li><strong>${escape(threat.category.replaceAll("_", " "))}</strong>: ${escape(threat.details)}
        ${threat.product_ids ? `<br>Products: ${productNames(threat.product_ids)}` : ""}</li>`
    ).join("\n");
    const remediations = (vulnerability.remediations ?? []).map(remediation =>
      `<section><h4>${escape(remediation.category.replaceAll("_", " "))}</h4>
        <p>${escape(remediation.details)}</p>
        ${remediation.product_ids ? `<p>Products: ${productNames(remediation.product_ids)}</p>` : ""}
        ${remediation.date ? `<p>Available since: ${escape(remediation.date)}</p>` : ""}
        ${remediation.restart_required ? `<p>Restart: ${escape(remediation.restart_required.category)}.
          ${escape(remediation.restart_required.details ?? "")}</p>` : ""}
        ${remediation.url ? referenceLink(remediation.url, "Remediation reference (example placeholder)") : ""}
      </section>`
    ).join("\n");
    const flags = (vulnerability.flags ?? []).map(flag =>
      `<li>${escape(flag.label.replaceAll("_", " "))}: ${productNames(flag.product_ids ?? [])}</li>`
    ).join("\n");
    return `<article>
      <h3>${escape(vulnerability.title ?? vulnerability.cve ?? "Vulnerability")}</h3>
      ${vulnerability.cve ? `<p>CVE: ${escape(vulnerability.cve)}</p>` : ""}
      ${(vulnerability.ids ?? []).map(id =>
        `<p>${escape(id.system_name)}: ${escape(id.text)}</p>`).join("\n")}
      ${vulnerability.cwe ? `<p>${escape(vulnerability.cwe.id)}: ${escape(vulnerability.cwe.name)}</p>` : ""}
      ${vulnerability.discovery_date ? `<p>Discovery: ${escape(vulnerability.discovery_date)}</p>` : ""}
      ${vulnerability.release_date ? `<p>Disclosure: ${escape(vulnerability.release_date)}</p>` : ""}
      ${renderNotes(vulnerability.notes, "h4")}
      <h4>Product status</h4><div class="table-wrap"><table>
        <thead><tr><th>Status</th><th>Products</th></tr></thead><tbody>${statuses}</tbody></table></div>
      ${flags ? `<h4>Status justification</h4><ul>${flags}</ul>` : ""}
      ${scores ? `<h4>CVSS scores</h4><ul>${scores}</ul>` : ""}
      ${threats ? `<h4>Impact and exploitation status</h4><ul>${threats}</ul>` : ""}
      ${remediations ? `<h4>Remediations</h4>${remediations}` : ""}
      ${renderReferences(vulnerability.references)}
    </article>`;
  }).join("\n");
  const metadata = [
    ["Document ID", doc.tracking.id],
    ["Publisher", doc.publisher?.name],
    ["Document category", doc.category],
    ["CSAF version", doc.csaf_version],
    ["Initial release date", doc.tracking.initial_release_date],
    ["Current release date", doc.tracking.current_release_date],
    ["Current version", doc.tracking.version],
    ["Status", doc.tracking.status],
    ["TLP", doc.distribution?.tlp?.label],
    ["Aggregate severity", doc.aggregate_severity?.text],
    ["Language", doc.lang],
    ["Contact", doc.publisher?.contact_details]
  ].map(([label, value]) =>
    `<dt>${escape(label)}</dt><dd>${escape(value ?? "Not provided")}</dd>`).join("\n");
  const notes = renderNotes(doc.notes);
  const acknowledgments = (doc.acknowledgments ?? []).map(item =>
    `<li>${escape(item.organization ?? "")}${item.names ? `: ${escape(item.names.join(", "))}` : ""}
      ${escape(item.summary ?? "")}</li>`).join("\n");
  const revisions = (doc.tracking.revision_history ?? []).map(revision =>
    `<tr><td>${escape(revision.number)}</td><td>${escape(revision.date)}</td><td>${escape(revision.summary)}</td></tr>`
  ).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(doc.tracking.id)}: ${escape(doc.title)}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.5; margin: 0; color: #2c2c2c; background: #f5f5f5; }
    main { max-width: 1000px; margin: 24px auto; padding: 24px; background: white; border: 1px solid #ddd; }
    h1 { border-left: 4px solid #007da8; padding-left: 15px; overflow-wrap: anywhere; }
    a { color: #007da8; }
    dl { display: grid; grid-template-columns: minmax(140px, 1fr) 3fr; gap: 8px 16px; }
    dt { font-weight: bold; } dd { margin: 0; overflow-wrap: anywhere; }
    p { white-space: pre-wrap; } table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid #ddd; }
    .table-wrap { overflow-x: auto; } pre { white-space: pre-wrap; overflow-wrap: anywhere; }
    code { overflow-wrap: anywhere; } article { border-top: 1px solid #ddd; padding-top: 16px; }
    @media (max-width: 600px) { main { margin: 8px; padding: 16px; } dl { display: block; } dd { margin-bottom: 12px; } }
  </style>
</head>
<body>
  <main>
    <nav><a href="../index.html">Advisory index</a> | <a href="./${escape(jsonName)}">Original CSAF JSON</a></nav>
    <h1>${escape(doc.tracking.id)}: ${escape(doc.title)}</h1>
    <dl>${metadata}</dl>
    ${notes}
    ${productRows ? `<section><h2>Product inventory</h2><div class="table-wrap"><table>
      <thead><tr><th>Product and version</th><th>Product ID</th></tr></thead>
      <tbody>${productRows}</tbody></table></div></section>` : ""}
    <section><h2>Vulnerabilities</h2>${vulnerabilities ||
      "<p>No vulnerabilities are included in this document.</p>"}</section>
    ${renderReferences(doc.references)}
    ${acknowledgments ? `<section><h2>Acknowledgments</h2><ul>${acknowledgments}</ul></section>` : ""}
    <section><h2>Revision history</h2><div class="table-wrap"><table>
      <thead><tr><th>Version</th><th>Date</th><th>Summary</th></tr></thead>
      <tbody>${revisions}</tbody>
    </table></div></section>
    <details><summary>Complete CSAF document</summary><pre>${escape(JSON.stringify(data, null, 2))}</pre></details>
    <p>Generated from the original JSON document. No remote requests are required.</p>
  </main>
</body>
</html>
`;
}

const rows = feed.entry.map(entry => {
  if (!entry || typeof entry.title !== "string" || typeof entry.id !== "string" ||
      !Number.isFinite(Date.parse(entry.updated)) ||
      typeof entry.content?.src !== "string" ||
      !/^(?:\.\/)?[a-z0-9_-]+\.json$/i.test(entry.content.src)) {
    throw new Error("Invalid example entry: expected metadata and a sibling JSON path.");
  }
  const advisoryUrl = new URL(entry.content.src, feedUrl);
  const advisory = JSON.parse(readFileSync(advisoryUrl, "utf8"));
  const doc = advisory.document;
  if (doc?.csaf_version !== "2.0" || doc.title !== entry.title ||
      doc.tracking?.id !== entry.id ||
      doc.tracking?.current_release_date !== entry.updated) {
    throw new Error(`Feed metadata does not match ${entry.content.src}.`);
  }
  const link = "./examples/" + fileURLToPath(advisoryUrl).split("/").pop();
  const htmlLink = link.replace(/\.json$/i, ".html");
  detailPages.push({
    url: new URL(advisoryUrl.href.replace(/\.json$/i, ".html")),
    content: detailPage(advisory, fileURLToPath(advisoryUrl).split("/").pop())
  });
  return `          <tr data-updated="${escape(entry.updated)}">
            <td><span class="badge">${escape(entry.updated)}</span></td>
            <td>${escape(entry.title)}</td>
            <td><span class="id">${escape(entry.id)}</span></td>
            <td class="actions"><a href="${escape(htmlLink)}" target="_blank" rel="noopener noreferrer">HTML</a> <a href="${escape(link)}" target="_blank" rel="noopener noreferrer">JSON</a></td>
          </tr>`;
}).join("\n");

let html = readFileSync(pageUrl, "utf8");
function replaceSection(name, content) {
  const pattern = new RegExp(`(<!-- generated-${name}:start -->)[\\s\\S]*?(<!-- generated-${name}:end -->)`, "g");
  const matches = html.match(pattern);
  if (matches?.length !== 1) {
    throw new Error(`Expected exactly one generated ${name} section.`);
  }
  html = html.replace(pattern, (_, start, end) => `${start}\n${content}\n          ${end}`);
}
replaceSection("meta",
  `      <strong>${escape(feed.title)}</strong>
      <div>Last updated: ${escape(feed.updated)} | Documents: ${feed.entry.length}</div>
      <div>Generated from the bundled JSON feed. Fictional test data only.</div>`);
replaceSection("rows", rows || '          <tr><td colspan="4">No advisories found.</td></tr>');
writeFileSync(pageUrl, html);
detailPages.forEach(page => writeFileSync(page.url, page.content));
console.log(`Generated index.html and ${detailPages.length} HTML advisory pages from JSON.`);
