<script>
	export let skillsIntro;
	import skills from "../../content/skills";
	import Divider2 from "../../shared/dividers/Divider2.svelte";
	import Svelte from "../../shared/icons/Svelte.svelte";
	let labelName = "";
	// let handleClick = (n) => { labelName = n; console.log(`${n} clicked`) };
	console.log(skills);
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
				<!-- <div
        class="py-1 px-3 bg-gradient-to-r from-teal-900 to-teal-700 text-white uppercase font-bold tracking-wide mt-4 mb-1 rounded-sm overflow-hidden relative">
        
        <img
          src={dots}
          class="absolute right-0 top-0 h-full -mr-1 pointer-events-none"
          alt="" />-->
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
						<!-- {skill.name} -->
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
					<!-- <span class="{(labelName===name ? 'absolute left-0 white-space-nowrap' : 'hidden')}">
                  <img class="ml-2" src={tooltipTip} />
        <p class="bg-gray-800 text-white py-1 px-3 rounded leading-tight">{name}</p> 

        </span>-->
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
