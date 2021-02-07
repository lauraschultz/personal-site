<script>
	export let name;
	export let imageFirst = true;

	import { location, push } from "svelte-spa-router";
	import projects from "../../content/projects.js";
	import Modal from "../../shared/Modal.svelte";
	import ProjectDesc from "./ProjectDesc.svelte";

	$: p = { ...projects[name], name: name };

	let post;
	fetch(`./assets/project-descriptions/${name}.md`, { mode: "no-cors" })
		.then((r) =>
			r.status < 299 && r.status >= 200
				? r.text()
				: new Promise((resolve) => resolve(undefined))
		)
		.then((r) => (post = r));
</script>

<ProjectDesc
	project={p}
	modalOpen={$location === `/project/${name}`}
	onModalClose={() => push("/")}
	{post}
/>
<div class="flex flex-wrap py-8 md:py-12 lg:py-20 items-center">
	<div
		class="{'flex-initial w-full md:w-5/12 order-1 m-2 md:m-4 ' +
			(imageFirst ? 'md:order-1' : 'md:order-2')} "
	>
		<img
			on:click={post ? () => push(`/project/${name}`) : () => {}}
			class={post ? "cursor-pointer" : ""}
			src={`./assets/project-images/${name}_main.png`}
			alt="screenshot of {p.title}"
			width="800"
			height="500"
		/>
	</div>
	<div
		class=" {'flex-1 w-full md:w-7/12 order-2 m-2 md:m-4 ' +
			(imageFirst ? 'md:order-2' : 'md:order-1')}"
	>
		{#if p.titleComponent}
			<div class=" w-32 lg:w-48 my-4">
				<svelte:component this={p.titleComponent} color="text-gray-50" /></div
			>
		{:else}
			<h3 class="font-bold text-2xl mb-2">{p.title}</h3>
		{/if}
		<p class="leading-tight">{p.bodyText}</p>
		<a
			class={post
				? "border-b-4 border-gray-400 mx-1 mt-3 inline-block px-3 pb-0.5"
				: "hidden"}
			href={`#/project/${name}`}
			><i class="fas fa-plus-circle inline-block mr-2" />See more</a
		>
		<a
			class="border-b-2 border-gray-400 mx-1 mt-3 inline-block px-2 text-sm"
			href={p.siteLink}
			target="_blank"
			rel="noopener"><i class="fas fa-link inline-block mr-2" />Live site</a
		>
		<a
			class="border-b-2 border-gray-400 mx-1 mt-3 inline-block px-2 text-sm"
			href={p.sourceCodeLink}
			target="_blank"
			rel="noopener"><i class="fas fa-code inline-block mr-2" />Source code</a
		>
	</div>
</div>
