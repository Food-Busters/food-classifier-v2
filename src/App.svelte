<script lang="ts">
  import type { MLResult } from "./types";

  import { Version } from "./config";

  let files: FileList;
  let image: HTMLImageElement;

  let showImage = false;
  let submited = false;
  let modelOption = "P";
  let imageData = "";
  let time = 0;

  let result: MLResult | APIError | undefined = undefined;

  interface APIError {
    message: string;
    error: number;
  }

  function isSuccess(obj: MLResult | APIError): obj is MLResult {
    return (obj as MLResult).foodName != undefined;
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

    let start = performance.now();

    try {
      const obj = await fetch(import.meta.env.VITE_API_ENDPOINT as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          version: `web-${Version.split(".")[2]}`,
        },
        body: JSON.stringify({
          modelType: modelOption,
          image: imageData,
        }),
      });

      try {
        result = await obj.json();
      } catch (err) {
        result = {
          message: "Server throw Unexpected Response",
          error: 500,
        };
      }
    } catch (err) {
      result = {
        message: `Cannot Fetch API : ${err}`,
        error: 503,
      };
    }

    time = Math.round(performance.now() - start);
  }
</script>

<img class="mx-auto mb-5" src="redsomwua.webp" alt="Somwua" width="200" />

<main
  class="flex flex-col gap-4 items-center w-full sm:w-2/3 md:w-1/2 2xl:w-1/3 mx-auto p-4 pb-6 shadow-xl bg-white rounded-xl text-center"
>
  <h1 class="font-bold big-p">Amazing Food Classifier {Version}</h1>
  <hr />
  <div class="flex flex-row justify-center items-baseline gap-2">
    <label for="image" class="font-bold text-2xl">Your Image:</label>
    <input type="file" accept="image/*" bind:files on:change={onImgChange} />
  </div>
  <select
    class="w-auto font-bold text-xl"
    on:change={(e) => {
      modelOption = e.currentTarget.value;
      submited = false;
      result = undefined;
    }}
  >
    <option value="P">Model P</option>
    <option value="U">Model U</option>
  </select>

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
        <p class="text-2xl xl:text-4xl">
          The amazing AI {result.version} says this picture is
        </p>
        <p>✨{result.foodName.en} / {result.foodName.th}✨</p>
        <p>{Math.round(result.confidence * 10000) / 100}% sure!</p>
        <p>It took {time} ms, is that too long?</p>

        <p>🤩Food Nutrition🤩</p>
        <table class="table-fixed mx-4 xl:w-1/2 xl:mx-auto">
          <tr><th>Nutrition</th><th>Calories</th></tr>

          {#each Object.entries(result.foodNutrition) as [name, calo]}
            {#if name != "pollution"}
              <tr>
                <td>{name[0].toUpperCase() + name.slice(1)}</td>
                <td>{calo}</td>
              </tr>
            {/if}
          {/each}
        </table>
        <p>
          Pollution by this food is {result.foodNutrition.pollution} grams of CO₂
        </p>
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

  th {
    @apply text-xl text-left;
  }

  td {
    @apply text-lg text-left;
  }
</style>
