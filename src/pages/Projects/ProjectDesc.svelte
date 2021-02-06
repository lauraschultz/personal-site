<script>
	export let project;
	export let modalOpen = false;
	export let onModalClose;
	export let post;

	import Modal from "../../shared/Modal.svelte";
	import marked from "marked";

	const getHeadingList = (node) => {
		const headingsLen = node.getElementsByTagName("h2").length;
		let headings = [];
		for (let i = 0; i < headingsLen; i++) {
			console.log(node.getElementsByTagName("h2").item(i));
			headings.push(node.getElementsByTagName("h2").item(i).id);
		}
		return headings;
	};

	// $: if (!modalOpen) { onModalClose() }
</script>

<Modal open={modalOpen} onClose={onModalClose}>
	<div class="bg-gray-50 text-gray-800 max-w-3xl p-3 md:p-6 lg:p-8">
		<h2 class="text-4xl text-gray-800 w-48">
			{#if project.titleComponent}
				<svelte:component this={project.titleComponent} color="text-gray-800" />
			{:else}{project.title}{/if}
		</h2>
		<div class="flex justify-between items-end text-sm my-4">
			<div class="flex-1">
				<a
					class="py-1 px-4 rounded  m-1 inline-block shadow bg-navy-800 text-gray-100 hover:bg-navy-700"
					href={project.siteLink}
					target="_blank"
					><i class="fas fa-link inline-block mr-2" />Live site</a
				>
				<a
					class="py-1 px-4 rounded  m-1 inline-block shadow bg-navy-800 text-gray-100 hover:bg-navy-700"
					href={project.sourceCodeLink}
					target="_blank"
					><i class="fas fa-code inline-block mr-2" />Source code</a
				>
			</div>
			<div class="flex-initial">
				{#each project.icons as icon}
					<span class="w-8 mx-1 inline-block">
						<svelte:component this={icon} fillColor="black" />
					</span>
				{/each}
			</div>
		</div>
		<hr />

		<div class="project-post">
			{#if post}
				{@html marked(post)}
			{/if}
		</div>
	</div>
</Modal>
