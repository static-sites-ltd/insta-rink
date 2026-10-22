<script lang="ts">
  import { asset } from '$app/paths';
  import RinkStage from '#lib/RinkStage.svelte';
</script>

<svelte:head>
  <title>InstaRink — Build the rink. Play the game.</title>
  <meta name="description" content="High-quality, low-cost self-assembly ice hockey rink boards." />
</svelte:head>

<main>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-grid shell">
      <div class="hero-copy">
        <p class="eyebrow">Self-assembly rink boards</p>
        <h1 id="hero-title">Build the rink. <em>Play the game.</em></h1>
        <p class="hero-summary">High-quality rink boards designed to connect simply, build quickly, and bring real hockey home.</p>
        <a class="button" href="#system">See how it connects</a>
      </div>
      <div class="rink-stage">
        <RinkStage />
      </div>
    </div>
  </section>

  <section class="system-section shell" id="system" aria-labelledby="system-title">
    <div class="section-heading">
      <h2 id="system-title">One simple system.</h2>
      <p>Interlocking connectors join each board to the next. Straight sections build the length. Four gradual curves turn the corner. The same logic carries around the rink.</p>
    </div>

    <figure class="system-demo">
      <video controls playsinline muted preload="none" poster={asset('assets/insta-rink-introduction.jpg')} aria-label="Insta-Rink product demonstration">
        <source src={asset('assets/insta-rink-introduction.mp4')} type="video/mp4" />
        <a href={asset('assets/insta-rink-introduction.mp4')}>Download the Insta-Rink demonstration</a>
      </video>
      <figcaption><span>See the system in action.</span><span>Product demonstration / 1:33</span></figcaption>
    </figure>

    <div class="steps" id="build">
      <article class="step">
        <span class="step-number">01 / Position</span>
        <h3>Line it up.</h3>
        <p>Place each section where the next run of boards begins.</p>
      </article>
      <article class="step step-accent">
        <span class="step-number">02 / Connect</span>
        <h3>Snap it in.</h3>
        <p>The opposing three-quarter-circle connectors meet in one repeatable motion.</p>
      </article>
      <article class="step">
        <span class="step-number">03 / Play</span>
        <h3>Build the game.</h3>
        <p>Continue through the straights and corners until the ice is ready.</p>
      </article>
    </div>
  </section>

  <section class="statement" id="contact" aria-labelledby="statement-title">
    <div class="statement-grid shell">
      <h2 id="statement-title">Serious boards. <span>Simple build.</span></h2>
      <div class="statement-copy">
        <p>InstaRink is being built around a direct idea: make a quality hockey enclosure more accessible without making assembly complicated.</p>
        <a class="button" href="#system">Review the system</a>
      </div>
    </div>
  </section>
</main>
