// @ts-ignore Import module
import * as bC from "./bunkCreator.js";
// @ts-ignore Import module
import $ from "https://code.jquery.com/jquery-3.7.0.min.js";
// @ts-ignore Import module

let campers: Array<bC.Camper> = [];


class CSVUploader {
    text: string = "";
    handleFile(f) {
        const [file]: Array<File> = f.files;
        const reader = new FileReader();
        reader.addEventListener(
            "load",
            () => {
                if(typeof reader.result == "string") {
                    this.text = reader.result;
                }
            }, false);
        if (file) {
            reader.readAsText(file);
        }
    }
}

class BunkMakerGUI {
    eidot: bC.Eidah[]=[];
    constructor(names: string[], reqs: any[]) {
        let campers: bC.Camper[] = names.map((self) => {
            return new bC.Camper(self);
        });
        for (const [ind, reqgroup] of reqs.entries()) {
            reqgroup.forEach((ele) => {
                let kanik = campers[ind];
                kanik.addPreferences(campers[ele[0]], ele[1]);
            });
        }
        let eidahMaker: bC.EidahSimulator = new bC.EidahSimulator(campers);
        this.eidot = eidahMaker.makeBunks();
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

function handleNamingConflicts(arr: string[]){
    let count: Object = {};
    arr.forEach(function(x,i) {
  
      if ( arr.indexOf(x) !== i ) {
        var c = x in count ? count[x] = count[x] + 1 : count[x] = 1;
        var j = c + 1;
        var k = x + '(' + j + ')';
  
        while( arr.indexOf(k) !== -1 ) k = x + '(' + (++j) + ')';
        arr[i] = k;
      }
    });
    return arr;
  }

let names: string[] = [];
let nameAndIDDict: Object = {};

$(document).ready(()=>{
    $("#input_file").change(()=>{
        //@ts-ignore
        let file = this.prop('files')[0];
        let uploader = new CSVUploader();
        uploader.handleFile(file);
        names = handleNamingConflicts(uploader.text.split(",")); //in case there are two Moshe Papi--s, for example 
        for (let n=0; n<names.length; n++) {
            nameAndIDDict[names[n]] = n;
            $('#camper-tbody').append(`
                <tr>
                    <th class="name">
                        ${names[n]}
                    </th>
                    <td>
                        <input type="text" class="must"/>
                        <input type="text" class="wants"/>
                        <input type="text" class="prefersNot"/>
                        <input type="text" class="cannot"/>
                    </td>
                </tr>`);
        }
        $('.must, .wants, .prefersNot, .cannot').tagit({
            availableTags: names    
        });
    });
    /*
    * SLIDER STUFF FOLLOWS
    */
    $("#A").slider({
      range: "min",
      min: 0,
      max: 10,
      value: 10,
      create: (event, ui) => {
        $('.A-wrapper').find('.ui-slider-handle').append("<span class='value'></span>");
        $('.A-wrapper').find('.value').html('10');
        
      },
      slide: (event, ui) => {
          $('.A-wrapper').find('.value').html(ui.value);
      }
    });
    $("#B").slider({
      range: "min",
      min: 0,
      max: 10,
      value: 4,
      create: (event, ui) => {
        $('.B-wrapper').find('.ui-slider-handle').append("<span class='value'></span>");
        $('.B-wrapper').find('.value').html('4');
        
      },
      slide: (event, ui) => {
          $('.B-wrapper').find('.value').html(ui.value);
      }
    });
    $("#D").slider({
      range: "min",
      min: -10,
      max: 0,
      value: -3,
      create: (event, ui) => {
        $('.D-wrapper').find('.ui-slider-handle').append("<span class='value'></span>");
        $('.D-wrapper').find('.value').html('-3');
        
      },
      slide: (event, ui) => {
          $('.D-wrapper').find('.value').html(ui.value);
      }
    });
    $("#F").slider({
      range: "min",
      min: -10,
      max: 0,
      value: -10,
      create: (event, ui) => {
        $('.F-wrapper').find('.ui-slider-handle').append("<span class='value'></span>");
        $('.F-wrapper').find('.value').html('-10');
        
      },
      slide: (event, ui) => {
          $('.F-wrapper').find('.value').html(ui.value);
      }
    });
  });
