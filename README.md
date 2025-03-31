BunkCreator
===================

BunkCreator v1 is up and running!

## Installation
There are two ways to run the BunkCreator - the former for simple testing, and the latter for development. 
1. If all you want to do is try out the implementation for a spin, clone the repo and open `dist/indexV1.html` in your browser of choice (should work in all of them. I have tested mainly in in Chrome 114.)
2. At the risk of some bloating for the ease of using Typescript, dev stack is [Node](https://nodejs.org/en/download), Typescript (use `npm install -g typescript@latest`), and Webpack (in order to deal with mod[ular]al collapse; use `npm install webpack webpack-cli --save-dev`).
## How to Build (if you chose #2)
Use the `tsc` Typescript utility to compile into `.js` files. Run `npx webpack` to resolve all of the module imports and exports. At this point, the output `main.js` file should have been updated in the distribution folder (`dist`). All that is left to do is to open the file `indexV1.html`.
## How to Contribute
Much of the code is super messy and not totally modular. It most definitely violates DRY principles (see how I grab the requests in the front end, for example) since I wrote most of it over two all-nighters at camp. Stylistic PRs are welcomed.
## Usage Notes
Most of the usage is fairly self-explanatory. A demo is available here: [![BunkCreator Demo](https://img.youtube.com/vi/WW4jYt8ZCWU/0.jpg)](https://www.youtube.com/watch?v=WW4jYt8ZCWU)
Notes on formatting the CSV file with camper names. Use one column for the names, and do not provide schema/column titles. 'Duplicate' names in the CSV file are treated as if they were separate people and are tagged accordingly with `(2)`, `(3)` and so on appended to their name. The sliders on the right side of the table view control the various weights of the different preference/requirement types.
## Thanks and Acknowledgements
Thanks to Ty Kay who helped me think through some of the time complexity issues involved with a brute-force approach and suggested the rudiments of a solution. Shoutout to [Brian Kernighan](https://en.wikipedia.org/wiki/Brian_Kernighan) who also had some input on this project.
