<script lang="ts">
  import "./lib/index";
  import { onMount } from "svelte";
  import * as nip19 from "nostr-tools/nip19";
  import { SimplePool } from "nostr-tools/pool";
  import type { Event } from "nostr-tools/core";

  const defaultRelays = [
    "wss://relay.nostr.band/",
    "wss://nos.lol/",
    "wss://relay.damus.io/",
    "wss://yabu.me/",
  ];

  let nevent = $state("");
  let event = $state<Event | null>(null);

  let code = $derived(
    [
      '<script type="module" src="https://cdn.jsdelivr.net/npm/nostr-widgets/dist/nostr-widgets.js"><\/script>',
      `<nostr-note data='${JSON.stringify(event).replaceAll("'", "&#39;")}'></nostr-note>`,
    ].join(""),
  );

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    nevent = params.get("nevent") ?? "";
    try {
      const result = nip19.decode(nevent.trim());
      if (result.type !== "nevent") {
        return;
      }
      const { id, relays } = result.data;
      const pool = new SimplePool();
      event = await pool.get([...(relays ?? []), ...defaultRelays], {
        ids: [id],
      });
    } catch (error) {
      console.error(error);
    }
  });
</script>

<main>
  <h1>Nostr Widgets</h1>
  <p>Embed Nostr notes into your website.</p>

  <form>
    <input
      type="text"
      name="nevent"
      placeholder="nevent1..."
      bind:value={nevent}
    />
    <input type="submit" value="Show" />
  </form>

  {#if event}
    <nostr-note data={JSON.stringify(event)}></nostr-note>
    <section>
      <button onclick={() => navigator.clipboard.writeText(code)}>
        Copy code
      </button>
      <textarea>{code}</textarea>
    </section>
  {/if}
</main>

<style>
  form,
  section {
    margin: 2rem auto;
  }

  input {
    padding: 0.5rem;
  }

  input[type="text"] {
    width: 500px;
  }

  textarea {
    width: 100%;
    height: 10rem;
  }
</style>
