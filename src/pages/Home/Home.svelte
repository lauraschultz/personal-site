<script>
	import Divider1 from "../../shared/dividers/Divider1.svelte";
	import Background from "./Background.svelte";
	// let triangle = "./assets/vector.svg";
	// import WomanAtComputer from "./WomanAtComputer.svelte";
	export let bio;
</script>

<section
	class="section w-screen min-h-screen flex flex-col lg:flex-row items-start lg:items-center justify-center md:justify-end p-0 mx-auto max-w-7xl"
	id="home"
>
	<div
		class="flex-1 relative lg:absolute z-0 top-0 left-0 pointer-events-none max-w-screen-xl w-140p sm:w-120p md:w-105p lg:w-full xl:w-5/6"
	>
		<Background />
	</div>
	<div class="flex-initial max-w-md z-20 m-8 md:m-12 text-dark">
		<h1 class="text-3xl font-display mb-2">Hey, I'm Laura.</h1>
		<p class="text-lg leading-tight">
			{@html bio}
		</p>
		<a
			class="px-5 py-2 bg-blue-800 text-gray-50 inline-block shadow rounded-lg my-4 group hover:pr-4 transition-spacing duration-300 text-lg"
			href="#contact"
		>
			Contact me
			<i
				class="fas fa-arrow-right ml-1 group-hover:ml-2 transition-spacing duration-300"
			/>
		</a>
	</div>
	<div
		class="flex-initial mx-auto animate-bounce my-4 lg:absolute lg:bottom-0 lg:w-screen lg:text-center"
	>
		<a href="#projects"><i class=" fas fa-chevron-down" size="2x" /></a></div
	>
</section>
