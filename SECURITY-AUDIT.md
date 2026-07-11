# bece.asia Privacy and Identity Audit

Audit date: 2026-07-11

## Executive summary

The public UI is largely branded as `bece.asia`, but full anonymity is not yet achieved. The most important residual exposure is repository and deployment provenance: the repository is public under a personal GitHub account, historical pull requests expose the account name, and several legacy adapters still contain upstream repository or deployment URLs in server-side source code.

This hardening change removes the external attendance source, replaces it with a local privacy-safe implementation, strengthens metadata, adds security headers, creates generic error pages, and adds a repeatable source audit script.

## Privacy risk score

Current score before all residual items are closed: **58/100 (medium-high exposure)**.

Target score after repository migration, legacy-source vendoring, and deployment reconfiguration: **90+/100**.

## Critical findings

| Location | Finding | Risk | Required action |
|---|---|---|---|
| Repository ownership and history | Public repository is attached to a personal GitHub account and historical PR metadata exposes that account | Direct attribution of ownership/development | Move the repository to a neutral organization account, make the old repository private or archive it without public links, and redeploy from the neutral organization |
| Legacy community-source adapter | Upstream source configuration contains a developer username, repository names, and previously contained personal sample names | Source provenance and personal identity exposure through repository inspection | Vendor sanitized source files into bece.asia or move upstream mapping to protected deployment configuration, then remove the adapter |
| FrontDesk standalone adapter | Contains an upstream repository URL and detailed legacy identity replacement patterns | Reveals source project and former organization context | Replace with a local standalone implementation and delete the remote source adapter |
| Palm oil calculator page | Direct iframe points to a legacy GitHub Pages domain | Visible in page source, browser network tools, and CSP requirements | Rebuild locally or proxy from a neutral backend, then remove the legacy domain |
| Deployment checks | Deployment target URLs reveal account/project naming | Attribution through status checks and public deployment URLs | Use a neutral Vercel team/project name and ensure only the custom domain is shared publicly |

## High findings

| Area | Finding | Mitigation |
|---|---|---|
| Error handling | Some legacy adapters returned upstream status or exception detail | Replace with generic `Something went wrong` messages and server-only logging |
| Source history | PR bodies and commit history include old domains, project names, and source provenance | Squash/migrate into a clean neutral repository; history rewriting is required for full removal |
| Browser tools | Legacy iframe/proxy applications may expose old asset names or source paths | Vendor assets locally and inspect Network, Storage, Cache, and Service Worker tabs after migration |
| Local storage | App data can retain names entered by previous users | Add per-app migration/clear logic and use neutral initial data only |

## Medium findings

- Several app descriptions use terms such as `community-built` or `adapted`, which are not personal but can invite provenance investigation.
- API routes should consistently return `no-store` and `X-Robots-Tag: noindex, nofollow, noarchive`.
- Analytics configuration was not found in the reviewed core files, but must be rechecked before adding any analytics provider.
- Public contact addresses should use only `support@bece.asia` or `contact@bece.asia`.

## Low findings

- The package name `bece-asia` is acceptable.
- Core metadata already used `bece.asia`, but lacked complete publisher, creator, canonical, Open Graph, Twitter, robots, and manifest controls.
- The existing footer did not show a personal credit.

## Remediation completed in this change

1. Replaced the externally sourced attendance application with a local browser-only Attendance Workspace.
2. Removed the attendance source proxy and its legacy organization identity patterns.
3. Added global metadata restricted to `bece.asia`.
4. Added canonical Open Graph and Twitter metadata.
5. Added `robots.ts`, `sitemap.ts`, and `manifest.ts`.
6. Added generic global error and 404 pages.
7. Added privacy and security response headers.
8. Disabled the framework-powered response header.
9. Added a neutral copyright footer.
10. Added `npm run privacy:audit` and `npm run privacy:audit:strict`.

## Required next actions

1. Move the repository from the personal GitHub account to a neutral `bece.asia` organization.
2. Create a neutral Vercel team and project, then reconnect the custom domain.
3. Vendor and sanitize FrontDesk, Family Mission, TokoMath Kids, Nusantara Games, Bintang Penjaga, and the palm oil calculator into the main repository.
4. Delete legacy source adapters after local migration.
5. Rewrite or abandon old public Git history if the objective requires protection against repository-history OSINT.
6. Review Vercel environment variables, deployment logs, runtime logs, domains, project settings, and access controls from an authenticated neutral team.
7. Run the strict privacy audit before every production release.

## Verification checklist

- [ ] Homepage source contains only `bece.asia` public identity.
- [ ] No personal names, personal emails, phone numbers, office names, or institution names in rendered HTML.
- [ ] No legacy `github.io`, `github.com`, `raw.githubusercontent.com`, `netlify.app`, or `vercel.app` references in client HTML or browser network requests.
- [ ] No personal data in Local Storage, Session Storage, IndexedDB, cookies, caches, or service workers.
- [ ] API responses contain no `owner`, `developer`, `createdBy`, private notes, or server information.
- [ ] Errors contain no stack trace, upstream URL, filesystem path, status detail, or account name.
- [ ] Metadata, sitemap, manifest, Open Graph, Twitter Card, and structured data identify only `bece.asia`.
- [ ] Repository and deployment are controlled by neutral organization accounts.

## Final recommendation

Technical sanitization alone cannot make a public project anonymous while the source repository and deployment project remain attached to identifiable personal accounts. The decisive final step is organizational migration: neutral GitHub ownership, neutral Vercel ownership, clean repository history, locally vendored assets, and removal of all legacy adapters.
