<script setup>
</script>

<template>
  <section class="page-block help-page">
    <h1>Internal panel documentation</h1>

    <p class="back-link top-back-link">
      <router-link :to="{ name: 'studio-ops-panel' }">Back to administration panel</router-link>
    </p>

    <p class="updated">Version: 0.5.0-prep (lite, Netlify front-only)</p>

    <p>
      This page describes how the internal panel works for local vocabulary list editing.
      French version: <router-link to="/aide/panel-interne">Documentation du panel interne</router-link>.
    </p>

    <h2 id="scope">Scope</h2>
    <ul>
      <li>Local browser editing (<a href="#glossary-localstorage">localStorage</a>).</li>
      <li>No backend required for this version.</li>
      <li>JSON export for Git versioning.</li>
    </ul>

    <h2 id="security">Access and security</h2>
    <ul>
      <li>Username + password login (client-side hash verification).</li>
      <li>Level 1 lock: 3 invalid attempts then 30 minutes.</li>
      <li>Level 2 lock: one invalid attempt after level 1 triggers a 24-hour lock.</li>
      <li>Temporary session with timeout auto-expiration.</li>
    </ul>

    <h2 id="workflow">Recommended workflow</h2>
    <ol>
      <li>Log in to the internal panel.</li>
      <li>Select the list to edit.</li>
      <li>Edit words (English/French) and save locally.</li>
      <li>Verify output in the Languages module.</li>
      <li>Export JSON and commit/push to the repository.</li>
    </ol>

    <h2 id="json-ops">JSON operations</h2>
    <ul>
      <li><strong>Copy JSON</strong>: quick audit or ad hoc sharing.</li>
      <li><strong>Download JSON</strong>: generates a file ready for versioning.</li>
      <li><strong>Import JSON</strong>: loads an existing list into the panel.</li>
      <li><strong>Reset</strong>: restores project default content.</li>
    </ul>

    <h2 id="limits">Known limits</h2>
    <ul>
      <li>Front-only protection: not equivalent to server-side security.</li>
      <li>Local data is tied to the current device/browser.</li>
      <li>Browser data cleanup can remove local edits.</li>
    </ul>

    <h2 id="troubleshooting">Troubleshooting</h2>
    <ul>
      <li>Access blocked: wait for the countdown to reach zero.</li>
      <li>Session expired: log in again.</li>
      <li>Data mismatch: reset then re-import a reference JSON file.</li>
    </ul>

    <h2 id="glossary">Glossary</h2>
    <dl>
      <dt id="glossary-localstorage">localStorage</dt>
      <dd>Persistent browser storage scoped to one domain.</dd>

      <dt id="glossary-hash">Hash (SHA-256)</dt>
      <dd>One-way fingerprint used to verify a password without storing it as plain text.</dd>

      <dt id="glossary-timeout">Session timeout</dt>
      <dd>Maximum connected session duration before automatic logout.</dd>

      <dt id="glossary-front-only">Front-only security</dt>
      <dd>Protection implemented only in browser code, without server enforcement.</dd>

      <dt id="glossary-json">JSON</dt>
      <dd>Text format used to structure and exchange data.</dd>
    </dl>
  </section>
</template>

<style scoped>
.help-page {
  max-width: 920px;
  margin-inline: auto;
}

.updated {
  color: #4b5f79;
  font-weight: 600;
}

.back-link {
  margin: 10px 0 14px;
}

.top-back-link {
  margin-top: 4px;
  margin-bottom: 12px;
}

.back-link a {
  text-decoration: underline;
  font-weight: 700;
}

h2 {
  margin-top: 18px;
  margin-bottom: 8px;
}

p,
li,
dd {
  line-height: 1.55;
}

ul,
ol {
  padding-left: 22px;
}

dl {
  margin: 0;
}

dt {
  margin-top: 10px;
  font-weight: 700;
}

dd {
  margin-left: 0;
}

a {
  text-decoration: underline;
}
</style>

