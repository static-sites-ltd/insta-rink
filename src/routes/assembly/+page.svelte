<script lang="ts">
  import { resolve } from '$app/paths';
  import RinkStage from '#lib/RinkStage.svelte';
</script>

<svelte:head>
  <title>Assembly Study — InstaRink</title>
  <meta name="description" content="Interactive InstaRink board assembly study." />
</svelte:head>

<main class="assembly-view">
  <div class="assembly-toolbar">
    <a href={resolve('/')}>← Back to site</a>
    <div><strong>Assembly study 04</strong><span>Drag to orbit · Scroll or use controls to zoom · Right-drag to pan</span></div>
  </div>
  <div class="assembly-canvas">
    <RinkStage interactive debug label={false} />
  </div>
</main>

<style>
  .assembly-view { position: relative; height: calc(100svh - 5.25rem); min-height: 38rem; background: #e9edef; }
  .assembly-canvas { position: absolute; inset: 0; }
  .assembly-toolbar {
    position: absolute;
    z-index: 2;
    top: 1.25rem;
    right: 1.5rem;
    left: 1.5rem;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 2rem;
    pointer-events: none;
  }
  .assembly-toolbar a, .assembly-toolbar div { padding: 0.8rem 1rem; background: rgba(245, 247, 247, 0.88); backdrop-filter: blur(10px); }
  .assembly-toolbar a { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-decoration: none; text-transform: uppercase; pointer-events: auto; }
  .assembly-toolbar div { display: grid; gap: 0.25rem; justify-items: end; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; }
  .assembly-toolbar span { color: #687175; }
  @media (max-width: 42rem) {
    .assembly-view { height: calc(100svh - 4.5rem); min-height: 32rem; }
    .assembly-toolbar div span { display: none; }
  }
</style>
