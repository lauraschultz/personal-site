module.exports = {
	future: {
		// removeDeprecatedGapUtilities: true,
		// purgeLayersByDefault: true,
	},
	purge: {
		enabled: true,
		content: ["./src/*.svelte"],
	},
	theme: {
		fontFamily: {
			display: "Calistoga",
			body: "Open Sans",
		},
		extend: {
			transitionProperty: {
				spacing: "margin, padding",
			},
			maxWidth: {
				"7xl": "84rem",
			},
			width: {
				"min-content": "min-content",
				"max-content": "max-content",
			},
			colors: {
				blue: {
					900: "#00587A",
					800: "#0B698E",
					700: "#1E7B9F",
					600: "#2988AE",
				},
				navy: {
					900: "#1F3147",
					800: "#193D66",
					700: "#294C75",
					600: "#355B88",
				},
				teal: {
					900: "#008891",
					800: "#1298A1",
					700: "#34AAB2",
					600: "#3DBAC2",
				},
				light: "#ECECE9",
			},
			backgroundImage: (theme) => ({
				texture: "url('./assets/bedge-grunge.png')",
			}),
		},
	},
	variants: {
		margin: ["responsive", "hover", "group-hover"],
		padding: ["responsive", "hover", "group-hover", "focus"],
	},
	plugins: [],
};
