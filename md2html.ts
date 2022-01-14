import { Marked } from "https://deno.land/x/markdown@v2.0.0/mod.ts"

//* Utils
const decoder = new TextDecoder("utf-8")
const encoder = new TextEncoder()
const log = async (msg: string) => await Deno.stdout.write(encoder.encode(msg))

//* Parse config file
const configFile = await Deno.readTextFile(`./config.json`)
let config
if (configFile) {
  config = { ...JSON.parse(configFile) }
}

//* Target folder to parse
const inputFolder = config.notesFolder || Deno.args[0]
const outputFolder = config.htmlFolder || Deno.args[1]

//* Make sure the target folder exists
if (!inputFolder) {
  log(
    "Bruh u aint even tell me what folder ur notes finna be in...  Lmk next time you hmu or add the folder location to the config.\n"
  )
  Deno.exit()
}

//* Make sure the destination folder exists
if (!outputFolder) {
  log(
    `Got the input folder, ${inputFolder}...  but idfk where to put ur html.  Lmk the output folder too next time.\n`
  )
  Deno.exit()
}

//* Check for a theme
const theme = config.theme || "modest"
if (config.theme) {
  log(`Found theme in config.json: ${config.theme} \n`)
} else log(`No theme specified. Using default theme: modest.css\n`)

//* Do the damn thing
await compile(inputFolder, outputFolder, theme)

//* The damn thing
async function compile(input: string, output: string, theme: string) {
  let count = 0
  try {
    //* Get all the files in the target folder
    for (const file of Deno.readDirSync(input)) {
      //   console.log(input + "/" + file.name + "\n")

      //* Get the file contents
      const markdown = decoder.decode(
        await Deno.readFile(input + "/" + file.name)
      )
      //   console.log("markdown: ", markdown + "\n")

      //* Convert the markdown to html
      const html = Marked.parse(markdown)
      //   console.log({ html })

      //* Append the theme to the html in a style tag
      let style
      try {
        style = `${Deno.readTextFileSync(`./themes/${theme}.css`)}`
      } catch (e) {
        log(
          `That theme isn't in your theme folder.. you trippin.  Look what you done did smh: \n${e}`
        )
      }

      const htmlFile = await Deno.readFile(
        output + "/" + file.name.replace(".md", ".html")
      )
      const themedHTML = html.content + `\n<style>${style}<style>`

      //* Write the html to the output folder
      await Deno.writeFile(
        output + "/" + file.name.replace(".md", ".html"),
        encoder.encode(themedHTML)
      )
      log(
        `${inputFolder}/${file.name} --> ${output}/${file.name.replace(
          ".md",
          ".html"
        )}\n`
      )

      count++
    }
    console.log("👌 Successfully compiled " + count + " files")
  } catch (e) {
    log("Damn... something done fucked up.  Here go ya error message: \n")
    console.error(e)
  }
}
