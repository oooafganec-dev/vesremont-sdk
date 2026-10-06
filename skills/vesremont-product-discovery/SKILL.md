---
name: vesremont-product-discovery
description: Find and inspect Vesremont products through HTML, browser WebMCP or public REST/MCP/A2A/UCP catalog operations; read current price and stock.
---

# Vesremont Product Discovery

Use this skill when the user asks to find, compare or inspect products on Vesremont.

## Procedure

1. Choose one available interface: public HTML/Markdown/REST, a compatible remote protocol, or browser WebMCP. A WebMCP-capable browser is not required for public product discovery. Start with https://vesremont.com/llms/search.md for an article/model, or https://vesremont.com/llms/catalog.md for category selection.
2. In browser WebMCP only, read the current tool list after every navigation. Page-specific tools only exist where they are valid. Steps 3–5 below describe that browser path, not remote tool arguments.
3. Use `search_products` for a name, category, brand, model or article. Use `get_visible_products` for items already rendered on a listing.
4. On catalog pages, use `get_catalog_filters`, `open_catalog_url`, `set_catalog_range`, `set_catalog_sort` and `open_catalog_page`. Prefer URLs returned by the site; do not invent filter paths.
5. On a product page, use `get_current_product` and the current HTML/schema.org data.
6. Treat price, stock, filters and orderability as dynamic. Re-read the current page before answering or acting.

## Remote catalog

For an external client use REST GET /api/v1/products, /api/v1/products/{product_id}, /api/v1/brands and /api/v1/catalog/filters, or the catalog operations of Remote MCP, A2A or UCP. Public catalog reads need no buyer token. Read the protocol schema rather than guessing tool arguments or HTML filter paths.

REST prices are rubles; UCP prices are integer kopecks with currency RUB. REST stock.local/stock.total aggregate the warehouse network and do not promise pickup today. A missing price is null, not zero. Full contract: https://vesremont.com/llms/api.md

## Interpretation rules

- The product page exposes its internal product_id and a concrete /buy/{id}:1 link as ordinary visible text. For "find this article and send a cart link", pass that published link; no OAuth, SDK or buyer session is required. JSON search, Markdown search and HTML are alternatives. If one is unavailable in your tool, use another without bypassing security. Continue with https://vesremont.com/llms/purchase.md.
- A zero local stock value means pickup today is unavailable; it does not always mean the product cannot be ordered.
- Report price, currency, stock and orderability as separate facts.
- Use canonical product URLs in the form `/catalog/product/{section-code}/{product-code}/`.

Documentation: https://vesremont.com/llms/products.md
