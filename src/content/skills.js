import Angular from "../shared/icons/Angular.svelte";
import Express from "../shared/icons/Express.svelte";
import Firebase from "../shared/icons/Firebase.svelte";
import Git from "../shared/icons/Git.svelte";
import Html5 from "../shared/icons/HTML5.svelte";
import Javascript from "../shared/icons/Javascript.svelte";
import Node from "../shared/icons/Node.svelte";
import Npm from "../shared/icons/Npm.svelte";
import Python from "../shared/icons/Python.svelte";
import React from "../shared/icons/React.svelte";
import Svelte from "../shared/icons/Svelte.svelte";
import Tailwind from "../shared/icons/Tailwind.svelte";
import Typescript from "../shared/icons/Typescript.svelte";
import VisualStudio from "../shared/icons/VisualStudio.svelte";

const skills = {
	Frontend: {
		HTML5: Html5,
		React: React,
		Angular: Angular,
		Svelte: Svelte,
		Javascript: Javascript,
		Typescript: Typescript,
		"Tailwind CSS": Tailwind,
	},

	Backend: {
		"Node.js": Node,
		express: Express,
		python: Python,
		Firebase: Firebase,
	},
	"Workflow & Misc": {
		git: Git,
		npm: Npm,
		"Visual Studio": VisualStudio,
	},
};

export default skills;
