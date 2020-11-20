<script>
    export let name;
    export let imageFirst = true;

    import { location, push } from "svelte-spa-router"
    import BlurHashImage from "./BlurHashImage.svelte";
    import allProjects from "../content/projects.json"
    import Modal from "./Modal.svelte"
    import blurHash from "./blurHash.json";
    import ProjectDesc from "./ProjectDesc.svelte";
    import { library, dom } from "@fortawesome/fontawesome-svg-core";
    import { faLink } from "@fortawesome/free-solid-svg-icons/faLink";
    import { faCode } from "@fortawesome/free-solid-svg-icons/faCode";
    import { faPlusCircle } from "@fortawesome/free-solid-svg-icons/faPlusCircle";

    $: p = { ...allProjects[name], name: name };

    let postExists = false;
    let post;
    fetch(`./assets/project-descriptions/${name}.md`, { mode: 'no-cors' }).then(r => r.status >= 200 ? r.text() : undefined).then(r => post = r);

    library.add(faLink);
    library.add(faCode);
    library.add(faPlusCircle)
    dom.watch();

</script>


<ProjectDesc project="{p}" modalOpen="{$location === `/project/${name}`}" onModalClose="{() => push('/')}" {post} />
<div class="flex flex-wrap py-8 md:py-10 lg:py-12 items-center gap-2 lg:gap-4">
    <div class="{'flex-initial w-full md:w-5/12 order-1 '+ (imageFirst ? 'md:order-1' : 'md:order-2')} ">
        <!-- <BlurhashImage src="{`./assets/project-images/${name}_main2.png`} " hash="{blurHash[name+'_main.png']}"
            width="800" height="500" /> -->
        <!-- <BlurHashImage imageUrl="{name + '_main.png'}" /> -->
        <!-- <a href="{post ? `#/project/${name}` : '#'}"> -->
        <img on:click="{post ? () => push(`/project/${name}`) : () => {}}" class="{post ? 'cursor-pointer' : ''}"
            src="{`./assets/project-images/${name}_main.png`}" alt="screenshot of {p.title}" />
        <!-- </a> -->


    </div>
    <div class=" {'flex-1 w-full md:w-7/12 order-2 '+ (imageFirst ? 'md:order-2' : 'md:order-1')}">
        {#if p.titleImg}
            <img class="w-40 mb-2" src="{p.titleImg}" alt="{p.title}"/>
        {:else}
        <h3 class="font-bold text-2xl mb-2">{p.title}</h3>
        {/if}
        <p class="leading-tight">{p.bodyText}</p>
        <a class="{post ? 'py-1 px-5 rounded-full text-white mt-2 inline-block shadow bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700' : 'hidden'}" href="{`#/project/${name}`}"><i class="fas fa-plus-circle inline-block mr-2"></i>See more</a>
        <a class="py-1 px-4 rounded-full text-white mt-2 inline-block shadow bg-gradient-to-r from-blue-800 to-blue-700 hover:from-blue-700 hover:to-blue-600 text-sm" href={p.siteLink} target="_blank"><i class="fas fa-link inline-block mr-2"></i>Live site</a>
        <a class="py-1 px-4 rounded-full text-white mt-2 inline-block shadow bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-sm" href={p.sourceCodeLink} target="_blank"><i class="fas fa-code inline-block mr-2"></i>Source code</a>
    </div>
</div>