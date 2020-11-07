<script>
	import Home from "./Home.svelte"
	import Projects from "./Projects.svelte"
	import Skills from "./Skills.svelte"
	import Contact from "./Contact.svelte";
	import Footer from "./Footer.svelte";
	import content from "../content/route-content.json"
	import { location } from "svelte-spa-router"
	let pageContent = content[$location] || content.default;
	let projects = pageContent.projects || content.default.projects;
	let bio = pageContent.bio || content.default.bio;
	let skillsIntro = pageContent.skillsIntro || content.default.skillsIntro;
	console.log($location)
	console.log(JSON.stringify(location))
	let y;
</script>

<svelte:window bind:scrollY={y} />

<main>
	<nav class="{'fixed z-30 p-2 sm:px-4 md:py-4 md:px-6 text-light w-full ' + (y > 200 ? 'bg-navy-900 shadow-lg' : '')}">
		<a href="#home" class="mx-1 sm:mx-2 font-display text-base sm:text-lg">Laura Schultz</a>
		<a href="#projects" class="mx-1 sm:mx-2 border-b-2 border-light text-sm sm:text-base">Projects</a>
		<a href="#skills" class="mx-1 sm:mx-2 border-b-2 border-light text-sm sm:text-base">Skills</a>
		<!-- <a href="#home" class="px-1 mx-1 border-b-2 border-light">Resume</a> -->
		<a href="#contact"
			class="mx-1 sm:mx-2 my-1 px-3 sm:px-5 py-1 rounded-full bg-teal-800 hover:bg-teal-700 text-white whitespace-no-wrap shadow-lg font-bold shadow text-sm sm:text-md">Contact
			me</a>
	</nav>
	<Home {bio} />
	<Projects {projects} />
	<Skills {skillsIntro} />
	<Contact />
	<Footer />
</main>