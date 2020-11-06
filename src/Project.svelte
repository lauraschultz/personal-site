<script>
    import Fa from 'svelte-fa'
    import { faLink, faCode } from '@fortawesome/free-solid-svg-icons'

    import allProjects from "../content/projects.json"
    export let name;
    $: p = allProjects[name];
    export let imageFirst = true;
</script>

<div class="flex flex-wrap my-4 md:my-6 lg:my-10 items-center gap-2 lg:gap-4">
    <img class="{'flex-initial w-full md:w-5/12 order-1 '+ (imageFirst ? 'md:order-1' : 'md:order-2')} " loading="lazy"
        src="{p.previewImg}" alt="screenshot of {p.title}" />
    <div class=" {'flex-1 w-full md:w-7/12 order-2 '+ (imageFirst ? 'md:order-2' : 'md:order-1')}">
        {#if p.titleImg}
            <img class="w-40 mb-2" src="{p.titleImg}" alt="{p.title}"/>
        {:else}
        <h3 class="font-bold text-2xl mb-2">{p.title}</h3>
        {/if}
        <p class="leading-tight">{p.bodyText}</p>
        <a class="py-1 px-5 rounded-full text-white bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 my-2 mx-1 inline-block shadow" href={p.siteLink} target="_blank"><Fa icon={faLink} class="inline-block mr-2"/>Live site</a>
        <a class="py-1 px-5 rounded-full text-white bg-gradient-to-r from-blue-800 to-blue-700 hover:from-blue-700 hover:to-blue-600 my-2 mx-1 inline-block shadow" href={p.sourceCodeLink} target="_blank"><Fa icon={faCode} class="inline-block mr-2"/>Source code</a>
    </div>
</div>