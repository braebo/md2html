import { dirname, relative } from "https://deno.land/std@0.121.0/path/mod.ts"
import { ensureDirSync } from "https://deno.land/std@0.121.0/fs/mod.ts"
import * as Colors from "https://deno.land/std@0.121.0/fmt/colors.ts"
import { Marked } from "https://deno.land/x/markdown@v2.0.0/mod.ts"
import "https://deno.land/x/dotenv/load.ts"

const dev = Deno.env.get("dev") || false


//* Utils
const decoder = new TextDecoder("utf-8")
const encoder = new TextEncoder()
const log = async (msg: string) => await Deno.stdout.write(encoder.encode(msg))
const cwd = dev ? "./" : dirname(Deno.execPath())


//* Parse config file
const configFile = await Deno.readTextFile(`${cwd}/config.json`)
let config
if (configFile) {
	config = { ...JSON.parse(configFile) }
	// console.log("config: ", JSON.stringify(config, null, 2))
}


//* Resolve paths
let inputFolder = config.notesFolder || Deno.args[0] || cwd
let outputFolder = config.htmlFolder || Deno.args[1] || `${cwd}/HTML/`
const themesFolder = config.themeFolder || Deno.args[2] || `${cwd}/themes/`

//* Make sure they have trailing slashes
if (!inputFolder.endsWith("/")) inputFolder += "/"
if (!outputFolder.endsWith("/")) outputFolder += "/"
if (!themesFolder.endsWith("/")) outputFolder += "/"

//* ensure the folders exist
ensureDirSync(outputFolder)
ensureDirSync(themesFolder)

//* Check for a theme
const theme = config.theme || "modest"
if (config.theme) {
	console.log(Colors.magenta(`Found theme: ${config.theme} \n`))
} else console.log(Colors.magenta(`No theme specified. Using default theme: modest.css\n`))

//* Make sure the theme file exists and store it's contents
let style = ''
try {
	style = `\n\n<!-- ${theme} theme -->\n<style>${await Deno.readTextFile(themesFolder + `${theme}.css`)}\n</style>\n`
} catch (e) {
	await exitDelayed(
		`That theme isn't in your theme folder.. you trippin.  Look what you done did smh: \n${e}`,
	)
}


//* Do the damn thing
await compile(inputFolder, outputFolder, style)

//* The damn thing
async function compile(input: string, output: string, style: string) {
	let count = 0

	try {
		
		//* Get all the files in the target folder
		for (const file of Deno.readDirSync(input)) {
			
			//* Only process .md files
			if (file.name.endsWith(".md") && file.name != 'README.md') {

				//* Get the file contents
				const markdown = decoder.decode(await Deno.readFile(input + file.name))
				// console.log("markdown: ", markdown + "\n")

				//* Convert the markdown to html
				const html = Marked.parse(markdown)
				// console.log({ html })

				//* Append the theme to the html in a style tag
				const themedHTML = html.content + style

				//* Change the file extension to .html
				const outputFile = output + file.name.replace(".md", ".html")

				//* Write the html to the output folder
				await Deno.writeFile(
					outputFile,
					encoder.encode(themedHTML),
				)
				console.log(
					Colors.cyan(`${file.name}`) +  ` --> ` + Colors.blue(`${relative(input, output)}/${file.name.replace(
						".md",
						".html",
					)
					}\n`),
				)

				//* Keep track of how many files we've compiled
				count++
			}
		}
		
		if (count > 0) {
			await exitDelayed("👌 Successfully compiled " + count + " files")
		} else {
			await exitDelayed("Hmmm... no markdown files found in " + input.replaceAll('\\', '/'))
		}
	} catch (e) {
		await exitDelayed("Damn... something done fucked up.  Here go ya error message: \n" + e)
	}
}

async function exitDelayed(msg: string) {
	await console.log(msg)
	await console.log('Exiting in 10 seconds...')
	await new Promise(resolve => setTimeout(() => resolve(Deno.exit()), 10000))
}