<script lang="ts">
  import Url from "./Url.svelte";

  let { url }: { url: string } = $props();

  function parseHtml(html: string): { title: string; image?: string } {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    const ogp = new Map(
      [...document.head.children]
        .filter(
          (element) =>
            element.tagName === "META" &&
            element.getAttribute("property")?.startsWith("og:") &&
            element.getAttribute("content"),
        )
        .map((element) => [
          element.getAttribute("property")!,
          element.getAttribute("content")!,
        ]),
    );
    return {
      title: ogp.get("og:title") ?? document.title,
      image: ogp.get("og:image"),
    };
  }
</script>

{#await fetch(url) then response}
  {#if response.headers.get("Content-Type")?.startsWith("text/html")}
    {#await response.text() then html}
      {@const { title, image } = parseHtml(html)}
      <a href={url} target="_blank" rel="noopener noreferrer">
        <article>
          {#if image}
            {#if URL.canParse(image)}
              <img src={image} alt="" loading="lazy" />
            {:else}
              <img
                src={new URL(url).origin +
                  (image.startsWith("/") ? image : `/${image}`)}
                alt=""
                loading="lazy"
              />
            {/if}
          {/if}
          <div>
            <div class="host">{new URL(url).hostname}</div>
            <h1>{title}</h1>
          </div>
        </article>
      </a>
    {/await}
  {:else}
    <Url href={url} />
  {/if}
{:catch}
  <Url href={url} />
{/await}

<style>
  a {
    text-decoration: none;
    color: inherit;
  }

  article {
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    margin: 12px 0;
  }

  img {
    width: 100%;
    max-height: 260px;
    object-fit: cover;
    display: block;
  }

  article > div {
    padding: 12px;
  }

  .host {
    font-size: 0.8rem;
    color: var(--secondary-color);
  }

  h1 {
    font-size: 1.1rem;
    margin: 0;
  }
</style>
