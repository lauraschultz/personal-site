<script>
	import Home from "./pages/Home/Home.svelte";
	import Projects from "./pages/Projects/Projects.svelte";
	import Skills from "./pages/Skills/Skills.svelte";
	import Contact from "./pages/Contact/Contact.svelte";
	import Footer from "./pages/Footer/Footer.svelte";
	import { location } from "svelte-spa-router";
	import content from "../content/route-content.json";
	import { library, dom } from "@fortawesome/fontawesome-svg-core";
	import { faGithub } from "@fortawesome/free-brands-svg-icons/faGithub";
	import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
	import { faPaperPlane } from "@fortawesome/free-solid-svg-icons/faPaperPlane";
	import { faEnvelope } from "@fortawesome/free-solid-svg-icons/faEnvelope";
	import { faLinkedin } from "@fortawesome/free-brands-svg-icons/faLinkedin";
	import { faLink } from "@fortawesome/free-solid-svg-icons/faLink";
	import { faCode } from "@fortawesome/free-solid-svg-icons/faCode";
	import { faPlusCircle } from "@fortawesome/free-solid-svg-icons/faPlusCircle";
	import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
	import { faPencilAlt } from "@fortawesome/free-solid-svg-icons/faPencilAlt";
	import { faAt } from "@fortawesome/free-solid-svg-icons/faAt";
	import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";

	let pageContent = content[$location] || content.default;
	let projects = pageContent.projects || content.default.projects;
	let bio = pageContent.bio || content.default.bio;
	let skillsIntro = pageContent.skillsIntro || content.default.skillsIntro;
	// let resume = pageContent.resume || content.default.resume;
	let y;

	library.add(faLinkedin);
	library.add(faPaperPlane);
	library.add(faEnvelope);
	library.add(faLink);
	library.add(faCode);
	library.add(faPlusCircle);
	library.add(faGithub);
	library.add(faArrowRight);
	library.add(faCode);
	library.add(faChevronDown);
	library.add(faPencilAlt);
	library.add(faAt);
	library.add(faTimes);

	dom.watch();
</script>

<svelte:window bind:scrollY={y} />

<main>
	<nav
		class={"fixed z-30 p-2 sm:px-4 md:py-4 md:px-6 text-gray-50 w-screen overflow-x-scroll whitespace-nowrap " +
			(y > 200 ? "bg-navy-900 shadow-lg" : "")}
	>
		<a
			href={"#home"}
			class="mx-1 sm:mx-3 font-display text-base sm:text-lg relative inline-block hover:text-white"
		>
			<h2 class="-mb-3 z-30 relative">Laura Schultz</h2>
		</a>
		<a
			href="#projects"
			class="mx-1 sm:mx-2 text-sm sm:text-base hover:text-white">Projects</a
		>
		<a href="#skills" class="mx-1 sm:mx-2 text-sm sm:text-base hover:text-white"
			>Skills</a
		>
		<a
			href="#contact"
			class="mx-1 sm:mx-2 text-sm sm:text-base hover:text-white">Contact</a
		>
	</nav>
	<Home {bio} />
	<Projects {projects} />
	<Skills {skillsIntro} />
	<Contact />
	<Footer />
</main>
