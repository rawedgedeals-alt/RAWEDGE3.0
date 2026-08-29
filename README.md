# RAWEDGE 2.0 — BUILD

This is the rebuilt RawEdge foundation based on the supplied campaign posters and your requested direction.

## Included
- Large, bright hero advertising position
- Large bottom advertising position
- Secondary advertising position
- RawEdge Casino Reviews / Stats & Facts positioning
- Original supplied campaign posters in `assets/`
- Premium affiliate offer cards instead of plain text links
- Responsive mobile layout
- Optional upbeat intro sound generated locally with Web Audio (visitor-controlled)
- Data/API hook for automated casino/affiliate updates
- Clear separation between editorial facts and advertising/affiliate offers

## Automated data hook
Open `index.html` and set:

`RAWEDGE_CONFIG.apiEndpoint = "YOUR_AUTHORIZED_JSON_ENDPOINT"`

Expected JSON shape is documented directly above the config in the HTML.

The site will refresh the feed every 15 minutes once an endpoint is configured.

## Important
No API credentials, affiliate IDs, or private feeds were provided, so those cannot be fabricated. The build is ready for the real authorized affiliate/API connection when you have it.
