<script lang="ts">
  import { resolve } from '$app/paths';
  import type { LayoutProps } from './$types';
  import '../app.css';

  let { children }: LayoutProps = $props();
</script>

<div class="ticker" aria-hidden="true">
  <div class="ticker-inner">
    <span>Plug in</span><span>Lock up</span><span>Build out</span><span>Drop the puck</span>
    <span>Plug in</span><span>Lock up</span><span>Build out</span><span>Drop the puck</span>
  </div>
</div>

<header class="site-header shell">
  <a class="wordmark" href={resolve('/')} aria-label="InstaRink home">Insta<span>Rink</span></a>
  <nav class="site-nav" aria-label="Main navigation">
    <a href={`${resolve('/')}#system`}>The system</a>
    <a href={`${resolve('/')}#build`}>How it builds</a>
    <a class="nav-cta" href={`${resolve('/')}#contact`}>Plan a rink</a>
  </nav>
</header>

{@render children()}

<footer class="footer-wrap">
  <div class="site-footer shell">
    <a class="wordmark" href={resolve('/')} aria-label="InstaRink home">Insta<span>Rink</span></a>
    <span>Self-assembly rink boards</span>
  </div>
</footer>
