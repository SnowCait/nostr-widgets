<script lang="ts">
  let { href }: { href: string } = $props();
</script>

<a {href} target="_blank" rel="noopener noreferrer">
  {href.length > 50 ? `${href.slice(0, 50)}...` : href}
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
