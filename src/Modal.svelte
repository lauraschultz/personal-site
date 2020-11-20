<script>
  export let open;
  export let onClose;

  import { library, dom } from "@fortawesome/fontawesome-svg-core";
  import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
  import { fade } from "svelte/transition";

  library.add(faTimes);
  dom.watch();

  let gEnabled;
  $: if (open) { setTimeout(() => gEnabled = true, 50) };

  function clickOutside(node, { enabled, close }) {

    const handleOutsideClick = ({ target }) => {
      if (!node.contains(target) && gEnabled) {
        close();
      }
    };
    window.addEventListener('click', handleOutsideClick);

    return {
      destroy() {
        window.removeEventListener('click', handleOutsideClick)
        gEnabled = false;
      }
    }
  }
</script>

{#if open}
<div in:fade out:fade class="fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50"  >
  <div class="rounded-lg shadow-lg overflow-y-scroll max-h-full relative" use:clickOutside="{{enabled: gEnabled, close: onClose}}">
    <button on:click="{onClose}" class="absolute top-0 right-0 m-2 text-gray-200 bg-black rounded-full leading-tight py-1 px-2 "><i class="fas fa-times"></i></button>
    <slot></slot>
  </div>
</div>

{/if}