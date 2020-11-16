let { encode } = require("blurhash");
let PNG = require("png-js");
let fs = require("fs");
const path = require("path");
const { argv } = require("process");
const projectRoot = argv[2] || path.join(__dirname, "..");

const loadImage = async (src) =>
	new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = (...args) => reject(args);
		img.src = src;
	});

const encodeImageToBlurhash = async (imageUrl) => {
	return new Promise((resolve, reject) =>
		PNG.decode(
			path.join(projectRoot, `public/assets/project-images/${imageUrl}`),
			(px) => {
				resolve(encode(px, 800, 500, 4, 3));
			}
		)
	);
};
let hashDict = {};
fs.readdir(
	path.join(projectRoot, "public/assets/project-images"),
	async (err, files) => {
		Promise.allSettled(files.map((img) => encodeImageToBlurhash(img))).then(
			(result) => {
				// console.log(result);
				files.forEach((fileName, idx) => {
					hashDict[fileName] = result[idx].value;
				});
				fs.writeFileSync(
					path.join(projectRoot, "src/blurHash.json"),
					JSON.stringify(hashDict)
				);
			}
		);
	}
);
