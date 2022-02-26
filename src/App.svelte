<script lang="ts">
  import type { MLResult } from "../lib/tf";

  import { Version } from "./config";

  let files: FileList;
  let image: HTMLImageElement;

  let showImage = false;
  let submited = false;
  let imageData = "";

  let result: MLResult | APIError | undefined = undefined;

  interface APIError {
    message: string;
    error: number;
  }

  function isSuccess(obj: MLResult | APIError): obj is MLResult {
    return (obj as MLResult).type != undefined;
  }

  function onImgChange() {
    const file = files[0];

    if (file) {
      showImage = true;

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        imageData = reader.result as string;
        image.setAttribute("src", imageData);
        submited = false;
        result = undefined;
      });
      reader.readAsDataURL(file);

      return;
    }
  }

  async function handleSubmit() {
    if (!imageData) return;

    submited = true;

    const obj = await fetch("/api/classify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "app-version": `web-${Version.split(".")[2]}`,
        token: import.meta.env.VITE_API_TOKEN as string,
      },
      body: JSON.stringify({
        image: imageData,
      }),
    });

    result = await obj.json();
  }
</script>

<img class="mx-auto mb-5" src="redsomwua.webp" alt="Somwua" width="200" />

<main
  class="flex flex-col gap-4 w-1/2 2xl:w-1/3 mx-auto p-4 pb-6 shadow-xl bg-white rounded-xl text-center"
>
  <h1 class="font-bold big-p">Amazing Food Classifier</h1>
  <hr />
  <div class="flex flex-row justify-center items-baseline gap-2">
    <label for="image" class="font-bold text-2xl">Your Image:</label>
    <input type="file" accept="image/*" bind:files on:change={onImgChange} />
  </div>

  {#if showImage}
    <p>Image Preview</p>
    <img bind:this={image} src="" alt="Preview" />
  {/if}

  <button
    class="rounded {submited
      ? 'bg-fb-lightgreen cursor-not-allowed'
      : 'bg-fb-green hover:bg-fb-lightgreen cursor-pointer'}
      p-2 my-2 font-bold text-2xl mx-auto"
    on:click={handleSubmit}
    disabled={submited}
  >
    Submit
  </button>

  {#if submited}
    {#if result}
      {#if isSuccess(result)}
        <p class="text-2xl xl:text-4xl">The amazing AI says this picture is</p>
        <p>✨{result.type ?? "Loading..."}✨</p>
        <p>{(result.score ?? 0) * 100}% sure!</p>
      {:else}
        <p class="big-p text-red-600">Error {result.error}: {result.message}</p>
      {/if}
    {:else}
      <p class="big-p">Loading...</p>
    {/if}
  {/if}
</main>

<style lang="postcss">
  p {
    @apply text-lg lg:text-xl xl:text-2xl font-bold;
  }

  .big-p {
    @apply text-2xl xl:text-4xl;
  }
</style>
