<script>
	import Divider1 from "../../shared/dividers/Divider1.svelte";
	import Project from "./Project.svelte";
	export let projects;
</script>

<section class="section bg-gray-800 text-gray-100 pt-0" id="projects">
	<Divider1 color="text-gray-100" />

	<!-- <div class="h-6 bg-contain" style="background-image: url({blob}); background-repeat: repeat-x;"></div> -->

	<div class="section-container ">
		<h2 class="section-header">Projects</h2>
		<div class="divide-y divide-gray-600">
			{#each projects as project, i}
				<Project name={project} imageFirst={i % 2 === 0} />
			{/each}
		</div>
		<div class="flex justify-end">
			<a
				class="group text-lg font-bold p flex-inital hover:pr-4 transition-spacing duration-300 mt-3 inline-block px-5 py-1.5 rounded-lg shadow-lg bg-gray-200 text-gray-900"
				href="http://github.com/lauraschultz"
				target="_blank"
			>
				<i class="fab fa-github mr-2" />
				See more on Github
				<i
					class="fas fa-arrow-right ml-1 group-hover:ml-2 transition-spacing duration-300"
				/>
			</a>
		</div>
	</div>
</section>

<style>
</style>
