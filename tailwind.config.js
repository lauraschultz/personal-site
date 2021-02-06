const colors = require("tailwindcss/colors");

module.exports = {
	future: {
		// removeDeprecatedGapUtilities: true,
		// purgeLayersByDefault: true,
	},
	purge: {
		enabled: process.env.NODE_ENV === "production",
		content: ["./src/**/*.svelte"],
	},
	theme: {
		fontFamily: {
			display: "Calistoga",
			body: "Open Sans",
		},
		extend: {
			spacing: {
				128: "32rem",
				"140p": "140vw",
				"120p": "120vw",
				"105p": "105vw",
			},
			zIndex: {
				"-10": "-10",
			},
			transitionProperty: {
				spacing: "margin, padding",
			},
			maxWidth: {
				"7xl": "84rem",
			},
			colors: {
				blue: {
					900: "#00587A",
					800: "#0B698E",
					700: "#1f7ea3",
					600: "#2a8cb2",
					500: "#3699bf",
				},
				navy: {
					900: "#1F3147",
					800: "#193D66",
					700: "#294C75",
					600: "#365b87",
					500: "#3e6798",
				},
				teal: {
					900: "#008891",
					800: "#1298A1",
					700: "#34AAB2",
					600: "#40b7bf",
					500: "#5dbfcd",
					400: "#AFDCDE",
				},
				white: "#ffffff",
				gray: colors.warmGray,
			},
		},
	},
	variants: {
		extend: {
			visibility: ["group-hover"],
			margin: ["hover", "group-hover"],
			padding: ["hover", "group-hover", "focus"],
		},
	},
	plugins: [require("tailwindcss-pseudo-elements")],
};
