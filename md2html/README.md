# MD2HTML

Compiles a folder of markdown files to a folder of html files.

## Usage
In your terminal, run:

`md2html.exe <markdownFolder> <htmlDestinationFolder>`

<details>
	<summary>Troubleshooting</summary>
	Your terminal should be in the same directory as the executable.  If not, you can specify the path to the executable as the first argument.  i.e. with an absolute path - `C:\Users\John\Desktop\md2html.exe <markdownFolder> <htmlDestinationFolder>`, or a relative path - `../../Desktop/md2html.exe <markdownFolder> <htmlDestinationFolder>`
</details>

<br>
<br>

## Config
An optional `config.json` file can be placed in the apps folder.  It can have the following properties:

- `notesFolder` - Path to the folder containing the markdown files (relative to the executable).  Leave empty to specify
the folder location in the command line.

- `htmlDestinationFolder` - The folder where the html files will be saved.  Leave empty to specify
the folder location in the command line.

- `theme` - The filename of the `.css` theme to use.  Leave empty for no theme.  New themes can be added to the `themes` folder.
  - Current themes include:
    - foghorn
    - modest-dark
    - modest
    - retro
    - simple
    - simple-dark
  - To preview the themes, open `themes/_preview.html` in your browser.


## Build from source
To build the executable yourself, clone this repo and run `npm run build`
> note: you need to have [Deno](https://deno.land) installed