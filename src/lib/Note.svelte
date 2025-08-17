<svelte:options customElement="nostr-note" />

<script lang="ts">
  import {
    verifyEvent,
    type Event,
    type VerifiedEvent,
  } from "nostr-tools/pure";
  import * as nip19 from "nostr-tools/nip19";
  import { onMount } from "svelte";
  import type { Content } from "nostr-typedef";
  import { fetchMetadata } from "./metadata";
  import { parseContent } from "./content";
  import UrlPreview from "./content/UrlPreview.svelte";
  import Mention from "./content/Mention.svelte";
  import Emoji from "./content/Emoji.svelte";
  import NostterIcon from "./NostterIcon.svelte";

  let { data }: { data: string } = $props();

  let noteEvent = $state<VerifiedEvent>();
  let metadataContent = $state<Content.Metadata>();
  let profileLink = $derived(
    noteEvent
      ? `https://nostter.app/${metadataContent?.nip05 ? metadataContent.nip05 : nip19.npubEncode(noteEvent.pubkey)}`
      : "https://nostter.app/",
  );
  let noteLink = $derived(
    noteEvent
      ? `https://nostter.app/${nip19.neventEncode({ id: noteEvent.id })}`
      : "https://nostter.app/",
  );

  onMount(() => {
    if (data.startsWith("{") && data.endsWith("}")) {
      try {
        const unverifiedEvent = JSON.parse(data);
        if (verifyEvent(unverifiedEvent)) {
          noteEvent = unverifiedEvent;
        }
      } catch (error) {
        console.error("[nostr-note] Failed to parse JSON:", error);
      }
    } else {
      console.error("[nostr-note] Unsupported data format");
      return;
    }

    if (!noteEvent) {
      console.error("[nostr-note] No valid note event found in data");
      return;
    }

    fetchMetadata(noteEvent.pubkey, (event: Event): void => {
      try {
        metadataContent = JSON.parse(event.content);
      } catch (error) {
        console.error("[nostr-note] Failed to parse metadata content:", error);
      }
    });
  });
</script>

<article>
  <div class="profile">
    <a href={profileLink} target="_blank" rel="noopener noreferrer">
      <div class="picture">
        {#if metadataContent?.picture && URL.canParse(metadataContent.picture)}
          <img src={metadataContent.picture} alt="" loading="lazy" />
        {:else}
          <div class="skeleton"></div>
        {/if}
      </div>
    </a>
    <div class="text">
      {#if metadataContent}
        <a href={profileLink} target="_blank" rel="noopener noreferrer">
          <div class="name">
            {metadataContent.display_name
              ? metadataContent.display_name
              : metadataContent.name}
          </div>
        </a>
      {:else}
        <div class="skeleton"></div>
      {/if}
    </div>
    <div class="icon">
      <a href={noteLink} target="_blank" rel="noopener noreferrer">
        <NostterIcon />
      </a>
    </div>
  </div>
  <div class="content">
    {#if noteEvent}
      <p>
        {#each parseContent(noteEvent.content, noteEvent.tags) as token}
          {#if token.type === "text"}
            <span>{token.value}</span>
          {:else if token.type === "hashtag"}
            <a
              href={`https://nostter.app/search?q=%23${encodeURIComponent(token.value)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              #{token.value}
            </a>
          {:else if token.type === "emoji"}
            <Emoji {token} />
          {:else if token.type === "url"}
            <UrlPreview href={token.value} />
          {:else if token.type === "reference"}
            {#if token.value.startsWith("npub") || token.value.startsWith("nprofile")}
              <Mention ref={token.value} />
            {:else}
              {@const url = `https://nostter.app/${token.value}`}
              <UrlPreview href={url} />
            {/if}
          {/if}
        {/each}
      </p>
    {:else}
      <p class="skeleton"></p>
    {/if}
  </div>
  <div class="date">
    {#if noteEvent}
      <a href={noteLink} target="_blank" rel="noopener noreferrer">
        <div>
          {new Date(noteEvent.created_at * 1000).toLocaleString()}
        </div>
      </a>
    {:else}
      <div class="skeleton"></div>
    {/if}
  </div>
</article>

<slot />

<style>
  :host {
    --border-color: rgb(207, 217, 222);
    --skeleton-color: rgb(229, 231, 235);
    --link-color: rgb(0, 111, 214);
    --primary-color: rgb(33, 53, 71);
    --secondary-color: rgb(83, 100, 113);
    --font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
      sans-serif;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --border-color: rgb(55, 65, 81);
      --skeleton-color: rgb(75, 85, 99);
      --link-color: rgb(59, 130, 246);
      --primary-color: rgb(229, 231, 235);
      --secondary-color: rgb(156, 163, 175);
    }
  }

  article {
    border: solid 1px var(--border-color);
    padding: 12px 16px;
    border-radius: 12px;
    font-family: var(--font-family);
    text-align: left;
    max-width: 550px;
    color: var(--primary-color);
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  a:hover {
    text-decoration: underline;
  }

  .skeleton {
    background-color: var(--skeleton-color);
    border-radius: 4px;
    height: 1rem;
  }

  .profile {
    display: flex;
    flex-direction: row;
  }

  .picture {
    height: 48px;
    width: 48px;
  }

  .picture img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
  }

  .picture .skeleton {
    height: 100%;
    width: 100%;
    border-radius: 50%;
  }

  .text {
    margin: 0 4px;
  }

  .text .name {
    font-weight: bold;
  }

  .text .skeleton {
    width: 5rem;
  }

  .icon {
    height: 25px;
    width: 25px;
    margin-left: auto;
  }

  p {
    white-space: pre-line;
    word-break: break-word;
  }

  p > a {
    color: var(--link-color);
  }

  .date {
    color: var(--secondary-color);
  }

  .date .skeleton {
    width: 10rem;
  }
</style>
