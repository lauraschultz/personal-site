<script>
    import { library, dom } from "@fortawesome/fontawesome-svg-core";
    import { faLink } from "@fortawesome/free-solid-svg-icons/faLink";
    import { faCode } from "@fortawesome/free-solid-svg-icons/faCode";
    library.add(faLink);
    library.add(faCode);
    dom.watch();
    import BlurHashImage from "./BlurHashImage.svelte";
    import allProjects from "../content/projects.json"
    import Modal from "./Modal.svelte"
    import blurHash from "./blurHash.json";
    export let name;
    $: p = allProjects[name];
    export let imageFirst = true;
    let modalOpen = false;
</script>


<Modal bind:open={modalOpen}>
    <div class="bg-white"><img src="{`./assets/project-images/${name}_main.png`}" alt="screenshow of {p.title}" /></div>
</Modal>
<div class="flex flex-wrap my-4 md:my-6 lg:my-10 items-center gap-2 lg:gap-4">
    <div class="{'flex-initial w-full md:w-5/12 order-1 '+ (imageFirst ? 'md:order-1' : 'md:order-2')} ">
        <!-- <BlurhashImage src="{`./assets/project-images/${name}_main2.png`} " hash="{blurHash[name+'_main.png']}"
            width="800" height="500" /> -->
        <!-- <BlurHashImage imageUrl="{name + '_main.png'}" /> -->
        <button on:click="{() => modalOpen = true}">
            <img src="{`./assets/project-images/${name}_main.png`}" alt="screenshow of {p.title}" />
        </button>


    </div>
    <div class=" {'flex-1 w-full md:w-7/12 order-2 '+ (imageFirst ? 'md:order-2' : 'md:order-1')}">
        {#if p.titleImg}
            <img class="w-40 mb-2" src="{p.titleImg}" alt="{p.title}"/>
        {:else}
        <h3 class="font-bold text-2xl mb-2">{p.title}</h3>
        {/if}
        <p class="leading-tight">{p.bodyText}</p>
        <a class="py-1 px-5 rounded-full text-white bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 my-2 mx-1 inline-block shadow" href={p.siteLink} target="_blank"><i class="fas fa-link inline-block mr-2"></i>Live site</a>
        <a class="py-1 px-5 rounded-full text-white bg-gradient-to-r from-blue-800 to-blue-700 hover:from-blue-700 hover:to-blue-600 my-2 mx-1 inline-block shadow" href={p.sourceCodeLink} target="_blank"><i class="fas fa-code inline-block mr-2"></i>Source code</a>
    </div>
</div>