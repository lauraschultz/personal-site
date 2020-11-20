<script>
  export let skillsIntro;
  import icons from "../content/icon-library.json";
  let dots = "./assets/dots.svg";
  let tooltipTip = "./assets/tooltip-tip.svg";
  let labelName = "";
  // let handleClick = (n) => { labelName = n; console.log(`${n} clicked`) };
</script>

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

<section class="section bg-light" id="skills">
  <div class="section-container">
    <div class="relative inline-block mb-6 md:mb-10">
      <h2 class="section-header -mb-3 z-20 relative">Skills</h2>
      <div class="absolute bottom-0 bg-teal-600 py-2 w-full ml-2 opacity-50 z-10"></div>
    </div>
    <p>{skillsIntro}</p>
    {#each Object.entries(icons) as [groupName, groupContent]}

    <div class="py-1 px-3 bg-gradient-to-r from-teal-900 to-teal-700 text-white uppercase font-bold tracking-wide mt-4 mb-1 rounded-sm overflow-hidden relative">{groupName}
      <img src={dots} class="absolute right-0 top-0 h-full -mr-1 pointer-events-none" alt=""/>
    </div>
      {#each Object.entries(groupContent) as [name, svg]}
  <button class="inline-block m-1 sm:m-2 w-12 sm:w-16 relative focus:outline-none focus-visible:shadow-outline" alt={name} title={name} on:click="{() => labelName=name}" on:hover="{() => labelName=name}">
    <span class="group">
              {@html svg}
<span class="tooltiptext invisible bg-gray-900 text-white rounded py-1 px-4 absolute group-hover:visible mt-2 transform -translate-x-1/2 z-20 whitespace-nowrap">{name}</span>
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