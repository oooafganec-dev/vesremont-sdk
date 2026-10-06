---
name: vesremont-session-shopping
description: Manage a Vesremont buyer cart, favorites and checkout through browser WebMCP or OAuth-authorized protocols; require buyer confirmation before order creation.
---

# Vesremont Session Shopping

Use this skill when the user asks to manage favorites or a cart, fill checkout details, or create an order on Vesremont.

## Safety and state

- If the task is only to find a product and send a cart link, no buyer session or OAuth is needed: use the visible ID and /buy/ link on the product page, or public cart-drafts. See https://vesremont.com/llms/purchase.md. Do not stop at the statement that an ordinary cart is session-bound.
- For browser WebMCP, use only the tools registered in `document.modelContext`; do not call internal AJAX endpoints directly. Remote OAuth operations are a separate path below.
- Browser tools operate on the current browser session and use server-validated CSRF protection.
- Registration or login is not required before checkout. The server associates the order with an existing internal user or creates one during order processing.
- Re-read cart and checkout state after navigation or a mutation.

## Order procedure

1. Use `add_to_cart`, `set_cart_quantity` or `remove_from_cart`, then verify with `get_cart`.
2. Read and update checkout using `get_checkout`, `set_delivery`, `suggest_addresses`, `set_delivery_address`, `set_payment` and `set_checkout_contact` as applicable.
3. Call `prepare_order` and show the complete returned summary to the user.
4. Ask for explicit confirmation of that exact summary.
5. Only after confirmation, call `submit_order` once with `confirmed: true` and the unexpired token returned by `prepare_order`.
6. If state changed or the token expired, prepare and confirm again. Never reuse a token.

## Remote buyer operations

REST/MCP/A2A/UCP use OAuth Authorization Code + PKCE S256, least-privilege scopes and a separate resource per interface. Never send browser cookies to an external agent or use an access token as CSRF. REST cart updates use the basket line item ID; only additions use product ID. Read state after a write.

For multiple interfaces prefer the one-consent flow documented in /auth.md: explicitly list the target interfaces and needed scopes on one buyer consent page, then obtain separate audience-bound tokens through restricted token exchange. This does not widen scopes, refresh tokens or approve an order. The original single-interface flow remains supported. The buyer must still confirm each actual order on Vesremont with its current summary.

Remote prepare returns confirmation_url for the buyer to review and approve on Vesremont. Submit requires that server confirmation and a stable Idempotency-Key. An uncertain result must never be retried with a new key. UCP checkout returns continue_url and requires_escalation; the buyer completes the order on the site. A signed cart-draft link transfers products, not consent or an order.

Protocol schemas: https://vesremont.com/llms/api.md
Authentication: https://vesremont.com/auth.md
Documentation: https://vesremont.com/llms/purchase.md
