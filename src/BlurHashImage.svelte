<script>
  import { decode } from "blurhash";
  import blurHash from "./blurHash.json";
  export let imageUrl; // assumes image is in assets/project-images
  console.log(blurHash[imageUrl])

  function lazy(node) {
    // data = {blurHash: ___, src: ___}
    // node.setAttribute('src', decode(blurHash[imageUrl], 800, 500))
    const pixels = decode(blurHash[imageUrl], 800, 500);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(800, 500);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    // node.replaceWith(canvas);
    setTimeout(() => {
      let img = document.createElement("IMG");
      img.src = `./assets/project-images/${imageUrl}`;
      node.replaceWith(img)
    }, 5000)
  }
</script>
<!-- <p>image time</p> -->
<div use:lazy></div>
<!-- <img use:lazy /> -->