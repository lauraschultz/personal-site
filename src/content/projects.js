import ChewLogo from "../shared/logos/ChewLogo.svelte";
import BBLogo from "../shared/logos/BBLogo.svelte";
import skills from "./skills";

const projects = {
	bikeshare: {
		bodyText:
			"BikeshareBuddy lets users save a list of their favorite bikeshare stations to easily find out if there are available docks and/or bikes. Bikeshare system data is pulled from the General Bikeshare Feed Specification data. Built with Angular, Firebase, and the Google Maps API.",
		title: "BikeshareBuddy",
		titleComponent: BBLogo,
		sourceCodeLink: "https://github.com/lauraschultz/BikeshareBuddy",
		siteLink: "https://lauraschultz.github.io/BikeshareBuddy/search",
		icons: [skills.Frontend.Angular, skills.Backend.Firebase],
	},
	chew: {
		bodyText:
			"Chew allows groups of people to easily decide on a restaurant together. After someone begins a session and shares the link, others can begin adding restaurants to the shared list and voting on each other's suggestions. Restaurant data is pulled from the Yelp API. Built using React, Node.js, express, Firebase, and Socket.io.",
		title: "Chew",
		titleComponent: ChewLogo,
		sourceCodeLink: "https://github.com/lauraschultz/chew",
		siteLink: "https://lauraschultz.dev/chew",
		icons: [
			skills.Frontend.React,
			skills.Frontend["Tailwind CSS"],
			skills.Backend["Node.js"],
			skills.Backend.Firebase,
		],
	},
	trivia: {
		bodyText:
			"Using questions retrieved from the Open Trivia Database, users can compete against their friends and see the live point total as they play. Built with React, Node.js, express, and Socket.io.",
		title: "Multiplayer Trivia Game",
		sourceCodeLink: "https://github.com/lauraschultz/trivia",
		siteLink: "https://lauraschultz.github.io/trivia/",
		icons: [
			skills.Frontend.React,
			skills.Frontend["Tailwind CSS"],
			skills.Backend["Node.js"],
		],
	},
	halloween: {
		bodyText:
			"For a safe and socially-distant halloween 2020! On the user side, kids and parents can request candy, and on the admin side, candy orders appear with an accompanying sound effect. Built using React and Firebase.",
		title: "Trick or Treat!",
		sourceCodeLink: "https://github.com/lauraschultz/trickOrTreat",
		siteLink: "https://lauraschultz.dev/trickOrTreat",
		icons: [
			skills.Frontend.React,
			skills.Frontend["Tailwind CSS"],
			skills.Backend.Firebase,
		],
	},
};

export default projects;
