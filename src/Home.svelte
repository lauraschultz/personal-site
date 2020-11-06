<script>
    let triangle = "./assets/vector.svg";
    let woman = "./assets/woman_at_desk.svg";
    export let bio;
</script>

<style>
    #intro-text {
        mix-blend-mode: difference;
    }
</style>

<section class="w-screen h-screen bg-light bg-texture bg-opacity-50 flex items-center" id="home">
    <img src="{triangle}" class="absolute z-0 w-screen h-screen pointer-events-none" alt="" />
    <!-- <div class="absolute h-screen w-screen flex items-center left-0 top-0 ml-2 pointer-events-none">
        <img src="{woman}"
            class="hidden sm:block w-full max-w-xs md:ml-32 md:max-w-sm lg:ml-48 xl:ml-64 pointer-events-none"
            alt="woman at desk" />

    </div>
    <div class="flex-1 max-w-sm z-20 m-2 lg:mr-16 lg:mr-24 xl:ml-32 text-light" id="intro-text">
        <h1 class="text-3xl font-display">Hey.</h1>
        <p class="text-lg leading-tight">{bio}</p>

    </div> -->
    <div class="flex-1 max-w-6xl mx-auto flex gap-4 justify-between items-center">
        <img src="{woman}" class="hidden sm:block sm:flex-1 pointer-events-none max-w-sm z-10" alt="woman at desk" />

        <div class="flex-1 max-w-md z-20 m-2 text-light" id="intro-text">
            <h1 class="text-3xl font-display">Hey.</h1>
            <p class="text-lg leading-tight">{@html bio}</p>
        </div>
</section>