<script lang="ts">
  import { asset } from '$app/paths';

  const photos = [
    { src: 'assets/gallery/IMG_4902.jpg', title: 'Front view', alt: 'Full rink board with a white face, blue top rail, and yellow kickplate.' },
    { src: 'assets/gallery/IMG_4899.jpg', title: 'Board face', alt: 'Angled view of the board face and the connector opening in the blue top rail.' },
    { src: 'assets/gallery/IMG_4901.jpg', title: 'Interlocking edge', alt: 'Front corner of the board showing the projecting connector and yellow kickplate.' },
    { src: 'assets/gallery/IMG_4900.jpg', title: 'Connector detail', alt: 'View along the blue top rail showing the recessed connector at the end of the board.' },
    { src: 'assets/gallery/IMG_4903.jpg', title: 'Rear view', alt: 'Back of the board showing its recessed panel and projecting edge connector.' },
    { src: 'assets/gallery/IMG_4904.jpg', title: 'Side profile', alt: 'Side angle showing the thickness of the board and its interlocking edge.' }
  ] as const;
</script>

<svelte:head>
  <title>Product gallery — InstaRink</title>
  <meta name="description" content="Explore photos of InstaRink boards, interlocking connectors, and product details." />
</svelte:head>

<main class="gallery shell">
  <header>
    <h1>Product gallery.</h1>
    <p class="intro">The boards, the connections, and the details. Select a photo for a closer look.</p>
  </header>

  <div class="photos">
    {#each photos as photo, i}
      <figure>
        <a href={asset(photo.src)} aria-label={`View ${photo.title.toLowerCase()} photo`}>
          <img src={asset(photo.src)} alt={photo.alt} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
        </a>
        <figcaption><span>{photo.title}</span><span aria-hidden="true">↗</span></figcaption>
      </figure>
    {/each}
  </div>
</main>

<style>
  .gallery { padding-block: 2.5rem 4rem; }
  header { margin-bottom: 2rem; }
  h1 { max-width: none; margin-bottom: 1rem; font-size: clamp(3.5rem, 8vw, 7rem); }
  .intro { max-width: 35rem; margin-bottom: 0; padding-left: 1rem; border-left: 4px solid var(--blue); color: #4b5154; line-height: 1.65; }
  .photos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2.5rem 2rem; }
  figure { min-width: 0; margin: 0; }
  figure a { display: block; background: #e9edef; }
  img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: contain; }
  figcaption { display: flex; justify-content: space-between; padding-top: 1rem; font-size: 0.8rem; font-weight: 600; }
  @media (max-width: 42rem) {
    .photos { grid-template-columns: 1fr; }
  }
</style>
