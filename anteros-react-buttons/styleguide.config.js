const path = require("path");
const { version } = require("./package");

module.exports = {
	components: "src/components/**/[A-Z]*.{js,jsx}",
	defaultExample: true,
	moduleAliases: {
		"rsg-example": path.resolve(__dirname, "src")
	},
	ribbon: {
		url: "https://github.com/styleguidist/react-styleguidist"
	},
	version,
	webpackConfig: {
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					loader: "babel-loader"
				},
				{
					test: /\.css$/,
					loader: "style-loader!css-loader"
				}
			]
		}
	},
	template: {
		head: {
			scripts: [
				
                { src: "assets/js/jquery.min.js" },
                { src: "assets/js/jquery-ui.min.js"	},
				{ src: "assets/js/jquery.nicescroll.min.js" },
				{ src: "assets/js/moment-with-locales.min.js" }
			],
			links: [
				{
					rel: "stylesheet",
					href:
						"https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
				}
			]
		}
	}
};
