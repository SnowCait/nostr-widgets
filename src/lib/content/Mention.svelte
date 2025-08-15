<script lang="ts">
  import { decode } from "nostr-tools/nip19";
  import { onMount } from "svelte";
  import { fetchMetadata } from "../metadata";
  import type { Event } from "nostr-tools/core";
  import type { Content } from "nostr-typedef";

  let { ref }: { ref: string } = $props();

  let metadataContent = $state<Content.Metadata>();

  onMount(() => {
    const result = decode(ref);
    const pubkey =
      result.type === "npub"
        ? result.data
        : result.type === "nprofile"
          ? result.data.pubkey
          : undefined;
    if (!pubkey) {
      return;
    }

    fetchMetadata(pubkey, (event: Event): void => {
      try {
        metadataContent = JSON.parse(event.content);
      } catch (error) {
        console.error("[nostr-note] Failed to parse metadata content:", error);
      }
    });
  });
</script>

<a href="https://nostter.app/{ref}" target="_blank" rel="noopener noreferrer">
  <span
    >@{metadataContent?.display_name
      ? metadataContent.display_name
      : metadataContent?.name
        ? metadataContent.name
        : ""}</span
  >
</a>

<style>
  a {
    text-decoration: none;
    color: var(--link-color);
  }

  a:hover {
    text-decoration: underline;
  }
</style>
