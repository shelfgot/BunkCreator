// @ts-ignore Import module
import { SVG } from "https://cdn.jsdelivr.net/npm/@svgdotjs/svg.js@3.0/dist/svg.min.js"
// @ts-ignore Import module
import * as bC from "./bunkCreator.js";

let campers: Array<bC.Camper> = [];
let wX = 600, wY = 600;


class CSVUploader {
    handleFile(f) {
        const [file]: Array<File> = f.files;
        const reader = new FileReader();
        reader.addEventListener(
            "load",
            () => {
                if(typeof reader.result == "string") {
                    let names: string[] = reader.result.split(",");
                    for (const chanichName of names) {
                        campers.push(new bC.Camper(chanichName));
                    }
                }
            }, false);
        if (file) {
            reader.readAsText(file);
        }
    }
}

class BunkMakerGUI {
    focusState: string;
    focusRect;
    buttons;
    draw;
    clickedNames;
    circleSize;
    init() {
        this.draw = SVG().addTo('#left').size(wX, wY);
        let buttonInfo: object = {"Must": 'rgb(40, 255, 102)', "Wants": 'rgb(187, 255, 100)', "Doesn't want": 'rgb(255, 238, 161)', "Cannot": 'rgb(255, 55, 10)'}
        this.buttons = {};
        let index = 0;
        for (const [title, color] of Object.entries(buttonInfo)) {
            let yPos = wY/10 + index*(wY*1.5);
            let xPos = wX-(wX/5);
            this.buttons[title] = this.draw.rect(wX/10, wY/10).move(xPos, yPos).fill(color);
            let text = this.draw.text(title).move(xPos, yPos+wY/3).font({family: "Helvetica", size: wY/5});

            index += 1;
        }
        //set up the initial highlighting of the focused button
        this.focusButton("Must");
        //set up the generate bunks button
        let generateBunksButton = document.createElement("button");
        generateBunksButton.value = "All done? Generate Bunks!";
        generateBunksButton.addEventListener("click", this.generateBunkSuggestions);
    }
    generateBunkSuggestions() {
        let eidot: Array<bC.Eidah> = this.getProvisionalEidot();
        this.displayEidot(eidot);
    }
    focusButton(buttonName) {
        let bToFocus = this.buttons[buttonName];
        this.focusRect = this.draw.rect(wX/10+6, wY/10+6).move(bToFocus.x()-3, bToFocus.y()-3).fill("rgb(10,30,255)").back();
        this.focusState = buttonName;
    }
    removeChanichFocus() {

    }
    putChanichInFocus(chanichCircle) {
        let focusCircle = this.draw.
         chanichCircle.svg.x()
    }
    getProvisionalEidot(): Array<bC.Eidah> {
        let eidahSimulator: bC.EidahSimulator = new bC.EidahSimulator(campers);
        let possibleEidot: Array<bC.Eidah> = eidahSimulator.makeBunks();
        return possibleEidot;
    }
    displayEidot(eidot: Array<bC.Eidah>) {
        let resultsPane = document.querySelector("#results");
        for (const eidah of eidot) {
            let bunkHTMLStrings: Array<string> = [];
            for (const bunk of eidah.bunks) {
                let tempStr: string = "";
                for (const camper of bunk.bunkList) {
                    tempStr.concat(`<td>${camper}</td>`);
                }
                bunkHTMLStrings.push(tempStr);
            }
            
            let tableHTML: string = `
            <div class="suggestion">
              <span class="score"><b>Score: ${eidah.score()}</b></span>
                <table border="1">
                 <tr>
                  <td>
                    <table border="0">
                        <tr>
                            <td><b>Bunk א</b></td>
                            <td><b>Bunk ב</b></td>
                        </tr>
                        <tr>
                            ${bunkHTMLStrings[0]}
                        </tr>
                        <tr>
                            ${bunkHTMLStrings[1]}
                        </tr>
                    </table>
                </td>
              </tr>
            </table>
            </div>`;
            if(resultsPane) {
                resultsPane.insertAdjacentHTML("beforeend", tableHTML);
            }
        }
    }
}
