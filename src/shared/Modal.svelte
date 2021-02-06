<script>
	export let open;
	export let onClose;

	import { fade } from "svelte/transition";

	let gEnabled;
	$: if (open) {
		setTimeout(() => (gEnabled = true), 50);
	}

	function clickOutside(node, { enabled, close }) {
		const handleOutsideClick = ({ target }) => {
			if (!node.contains(target) && gEnabled) {
				close();
			}
		};
		window.addEventListener("click", handleOutsideClick);

		return {
			destroy() {
				window.removeEventListener("click", handleOutsideClick);
				gEnabled = false;
			},
		};
	}
</script>

{#if open}
	<div
		in:fade
		out:fade
		class="fixed left-0 top-0 w-screen h-screen bg-gray-900 bg-opacity-50 flex items-center justify-center z-40"
	>
		<div
			class="lg:rounded-lg shadow-lg overflow-y-scroll max-h-full relative z-50"
			use:clickOutside={{ enabled: gEnabled, close: onClose }}
		>
			<button
				on:click={onClose}
				class="absolute top-0 right-0 my-3 mx-5 text-gray-400 bg-black rounded-full leading-tight"
				><i class="fas fa-times" /></button
			>
			<slot />
		</div>
	</div>
{/if}
