<script>
	export let skillsIntro;
	import skills from "../../content/skills";
	import Divider2 from "../../shared/dividers/Divider2.svelte";
	let labelName = "";
</script>

<section class="section " id="skills">
	<Divider2 color="text-gray-800" />
	<div class="section-container">
		<h2 class="section-header">Skills</h2>
		<p>{skillsIntro}</p>
		{#each Object.entries(skills) as [groupName, groupContent]}
			<div
				class="uppercase font-bold tracking-wide my-4 text-lg border-b border-gray-400"
			>
				{groupName}
			</div>
			{#each Object.entries(groupContent) as [name, component]}
				<button
					class="inline-block m-1 sm:m-2 w-12 sm:w-16 relative focus:outline-none focus-visible:shadow-outline"
					alt={name}
					title={name}
					on:click={() => (labelName = name)}
					on:hover={() => (labelName = name)}
				>
					<span class="group">
						<svelte:component
							this={component}
							fillColor="#57534E"
							backgroundColor="#F5F5F4"
						/>
						<span
							class="tooltiptext invisible bg-gray-900 text-gray-50 rounded py-1 px-4 absolute group-hover:visible mt-2 transform -translate-x-1/2 z-20 whitespace-nowrap"
							>{name}</span
						>
					</span>
				</button>
			{/each}
		{/each}
	</div>
</section>

<style>
	.tooltiptext::after {
		content: " ";
		position: absolute;
		bottom: 100%;
		/* At the top of the tooltip */
		left: 50%;
		margin-left: -5px;
		border-width: 5px;
		border-style: solid;
		border-color: transparent transparent black transparent;
	}
</style>
