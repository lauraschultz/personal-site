<script>
    import { library, dom } from "@fortawesome/fontawesome-svg-core";
    import { faGithub } from "@fortawesome/free-brands-svg-icons/faGithub";
    import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
    let chew_screenshot = "./assets/chew_screenshot.png";
    let blob = "./assets/blob2.svg";
    import Project from "./Project.svelte"
    // import allProjects from "../content/projects.json"
    // import Fa from 'svelte-fa'
    // import { faGithub } from '@fortawesome/free-solid-svg-icons'
    export let projects;
    library.add(faGithub);
    library.add(faArrowRight);
    dom.watch();
</script>

<style>

</style>

<section class="section bg-gray-800 text-gray-100" id="projects">
    <!-- <div class="h-6 bg-contain" style="background-image: url({blob}); background-repeat: repeat-x;"></div> -->

    <div class="section-container">
        <div class="relative inline-block mb-3">
            <h2 class="section-header -mb-3 z-20 relative">Projects</h2>
            <div class="absolute bottom-0 bg-blue-600 py-2 w-full ml-2 opacity-50 z-10"></div>
        </div>
        {#each projects as project, i}
            <Project name={project} imageFirst={i%2===0}/>
        {/each}
        <div class="flex justify-end">
            <a class="group text-lg font-bold py-1 px-5 rounded-full bg-teal-800 hover:bg-teal-700 flex-inital hover:pr-4 transition-spacing duration-300" href="http://github.com/lauraschultz" target="_blank">
                <i class="fab fa-github mr-2"></i>
                See more on Github
                <i class="fas fa-arrow-right ml-1 group-hover:ml-2 transition-spacing duration-300"></i>
            </a>
        </div>

    </div>
</section>