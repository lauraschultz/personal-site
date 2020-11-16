<script>
  import { library, dom } from "@fortawesome/fontawesome-svg-core";
  import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
  library.add(faTimes);
  dom.watch();
  export let open;
  let gEnabled;
  $: if (open) { setTimeout(() => gEnabled = true, 200) };
  // export let onClose;
  // function clickOutside(node, { enabled: initialEnabled, cb }) {
  //   const handleOutsideClick = ({ target }) => {
  //     if (!node.contains(target)) {
  //       cb();
  //     }
  //   };

  //   function update({ enabled }) {
  //     if (enabled) {
  //       window.addEventListener('click', handleOutsideClick);
  //     } else {
  //       window.removeEventListener('click', handleOutsideClick);
  //     }
  //   }

  //   update({ enabled: initialEnabled });
  //   return {
  //     update,
  //     destroy() {
  //       window.removeEventListener('click', handleOutsideClick);
  //     }
  //   };
  // }
  function clickOutside(node, { enabled, onClose }) {

    const handleOutsideClick = ({ target }) => {
      console.log(`clickOutside, enabled is ${enabled}`)
      if (!node.contains(target) && gEnabled) {
        console.log('closing')
        onClose();
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
<div class="fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50"  >
  <div class="rounded-lg shadow-lg relative overflow-hidden" use:clickOutside="{{enabled: gEnabled, onClose: () => open = false}}">
    <button on:click="{() => open = false}" class="absolute top-0 right-0 m-2 text-gray-200 bg-black rounded-full leading-tight py-1 px-2 "><i class="fas fa-times"></i></button>
    <slot></slot>
  </div>
</div>

{/if}