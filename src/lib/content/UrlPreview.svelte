<script lang="ts">
  import LinkCard from "./LinkCard.svelte";
  import Url from "./Url.svelte";

  let { href } = $props();
</script>

{#await fetch(href, { method: "HEAD" })}
  <div class="skeleton"></div>
{:then response}
  {@const contentType = response.headers.get("Content-Type")}
  {#if contentType?.startsWith("image/")}
    <img src={href} alt="" loading="lazy" />
  {:else if contentType?.startsWith("video/")}
    <!-- svelte-ignore a11y_media_has_caption -->
    <video controls>
      <source src={href} type={contentType} />
    </video>
  {:else if contentType?.startsWith("audio/")}
    <audio controls>
      <source src={href} type={contentType} />
    </audio>
  {:else}
    <LinkCard url={href} />
  {/if}
{:catch}
  <Url {href} />
{/await}

<style>
  img,
  video {
    margin: 12px 0;
    max-width: 100%;
    max-height: 400px;
    border-style: solid;
    border-width: 1px;
    border-radius: 12px;
    border-color: var(--border-color);
    display: block;
  }

  .skeleton {
    background-color: var(--skeleton-color);
    border-radius: 4px;
    aspect-ratio: 1.618;
  }
</style>
