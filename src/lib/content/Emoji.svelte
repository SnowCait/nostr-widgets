<script lang="ts">
  import type { EmojiToken } from "../content";

  let { token }: { token: EmojiToken } = $props();
</script>

<img src={token.url} alt={token.value} title={token.value} loading="lazy" />

<style>
  img {
    width: 1.5em;
    height: 1.5em;
    vertical-align: top;
  }
</style>
