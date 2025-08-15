# Nostr Widgets

Embed Nostr notes into your website.

## Note

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/nostr-widgets@0/dist/nostr-widgets.js"></script>
<nostr-note data='{...}'></nostr-note>
```

### Attributes

| attribute | required | value     | example                                      |
| --------- | :------: | --------- | -------------------------------------------- |
| data      |   yes    | Note JSON | `{ "kind": 1, "id": "", "pubkey": "", ... }` |
