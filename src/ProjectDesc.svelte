<script>
  export let project;
  export let modalOpen = false;
  export let onModalClose;
  export let post;

  import Modal from "./Modal.svelte"
  import marked from "marked"
  import { library, dom } from "@fortawesome/fontawesome-svg-core";
  import { faLink } from "@fortawesome/free-solid-svg-icons/faLink";
  import { faCode } from "@fortawesome/free-solid-svg-icons/faCode";

  const getHeadingList = (node) => {
    const headingsLen = node.getElementsByTagName('h2').length;
    let headings = [];
    for (let i = 0; i < headingsLen; i++) {
      console.log(node.getElementsByTagName('h2').item(i))
      headings.push(node.getElementsByTagName('h2').item(i).id);
    }
    return headings;
  }
  library.add(faLink);
  library.add(faCode);
  dom.watch();

  // $: if (!modalOpen) { onModalClose() }
</script>


<Modal open={modalOpen} onClose={onModalClose}>
  <div class="bg-gray-50 text-gray-800 max-w-3xl">
    <div class="w-full p-1 bg-gradient-to-r from-gray-800 to-gray-600">
      <h2 class="text-4xl text-white text-center my-6 md:mx-6">
        {#if project.titleImg}
          <img class="w-52 max-w-full mx-auto" src={project.titleImg} alt="{project.title}"/>
        {:else}
          {project.title}
        {/if}
      </h2>
      <div class="flex justify-between items-end text-sm">
        <div class="flex-1">
          <a class="py-1 px-5 rounded-full text-white border border-white m-1 inline-block shadow hover:bg-gray-50 hover:text-gray-800" href={project.siteLink} target="_blank"><i class="fas fa-link inline-block mr-2"></i>Live site</a>
          <a class="py-1 px-5 rounded-full text-white border border-white m-1 inline-block shadow hover:bg-gray-50 hover:text-gray-800" href={project.sourceCodeLink} target="_blank"><i class="fas fa-code inline-block mr-2"></i>Source code</a>    
        </div>
        <div class="flex-initial">
          {#each project.icons as icon}
            <span class="w-8 mx-1 inline-block">
              {@html icon}
            </span>
          {/each}
        </div>
      </div>
    </div>
    <!-- <div class="">
      <img src="{`./assets/project-images/${project.name}_main.png`}" alt="screenshot of {project.title}" />
      <div class="absolute top-0 w-full h-full flex items-center justify-center">
        <h2 class="bg-white font-display text-3xl border-b-4 border-gray-900 rounded-sm">{project.title}</h2>
      </div>
    </div> -->
    <!-- <div class="flex-initial">
      {#each headings as h}
        <a href="{'#' + h}" class="block">{h}</a>
      {/each}
    </div> -->
    <div class="px-4 pb-4 lg:px-8 project-post">
      <!-- {#await post then p} -->
        {#if post}
          {@html marked(post)}
        {:else}
          whoops
        {/if}

      <!-- {/await} -->
    </div>
    
  </div>
</Modal>