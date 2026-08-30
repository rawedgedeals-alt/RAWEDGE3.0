# RawEdge + RevenueLab integration

The RawEdge 3.0 repository now contains a server-side RevenueLab integration and a private analytics dashboard.

## What is wired in

- `api/revenuelab/dashboard.js` obtains a RevenueLab bearer token server-side.
- The same route requests reconciled earnings from RevenueLab's documented earnings endpoint.
- The route can also request RevenueLab's Get statistics method when `REVENUELAB_STATS_URL` is configured.
- `revenuelab-dashboard.html` provides a mobile-friendly analytics view for clicks, registrations, NDC, deposits, net revenue and reconciled earnings, plus offer-level earnings.
- No RevenueLab credentials or bearer token are placed in browser JavaScript or committed to Git.

## Required Vercel environment variables

Set these in the deployment environment, not in the repository:

- `REVENUELAB_USERNAME`
- `REVENUELAB_PASSWORD`
- `REVENUELAB_STATS_URL`
- `REVENUELAB_EARNINGS_AUTH_PREFIX=Bearer`
- `REVENUELAB_STATS_AUTH_PREFIX=id_token`
- `RAWEDGE_ADMIN_KEY`

RevenueLab documents a maximum of 3 API requests per second. The dashboard route is deliberately limited to one token request, one earnings request and one optional statistics request per sync.

## Important API distinction

RevenueLab's Get statistics method covers offer/traffic-source data for RevShare and Hybrid deals and returns approximate, not yet reconciled earnings. RevenueLab's Get earnings method is a POST endpoint that supports RevShare and CPA earnings and returns reconciled earnings with adjustments. RawEdge uses the earnings method for the authoritative earnings figure and the statistics method for operational traffic metrics when configured.

Source: RevenueLab API documentation: https://revenuelab.tawk.help/article/api-what-data-can-be-obtained-and-how
