// @ts-ignore Import module
import * as bC from "./bunkCreator.js";
// @ts-ignore Import module
import $ from "https://code.jquery.com/jquery-3.7.0.min.js";
// @ts-ignore Import module

let campers: Array<bC.Camper> = [];


class CSVUploader {
    text: string = "";
    handleFile(f): Promise<any> {
        return new Promise((resolve, reject) => {
            const file: File = f;
            const reader = new FileReader();
            reader.addEventListener(
                "load",
                () => {
                    if(typeof reader.result == "string") {
                        resolve(reader.result);
                    }
                }, false);
            reader.addEventListener(
                "error",
                () => {
                    reject;
                }, false)
            if (file) {
                reader.readAsText(file);
            }
        });
    }
}

class BunkMakerGUI {
    eidot: bC.Eidah[]=[];
    campers: bC.Camper[]
    constructor(names: string[], reqs: any[]) {
        this.campers = names.map((self) => {
            return new bC.Camper(self);
        });
        for (const [ind, reqgroup] of reqs.entries()) {
            reqgroup.forEach((ele) => {
                let kanik = this.campers[ind];
                kanik.addPreferences(this.campers[ele[0]], ele[1]);
            });
        }
    }
    makeDisplayEidot() {
        let eidahMaker: bC.EidahSimulator = new bC.EidahSimulator(this.campers);
        this.eidot = eidahMaker.makeBunks();
        console.log(this.eidot);
        let resultsPane = document.querySelector("#results");
        resultsPane.innerHTML = "";
        for (const eidah of this.eidot) {
            let tableHTML: string = `
            <div class="suggestion">
              <span class="score"><b>Score: ${eidah.score()}</b></span>
                <table class="results-table" border="1">
                 <tr>
                  <td>
                    <table border="0">
                        <tr>
                            <td><b>Bunk א</b></td>
                            <td><b>Bunk ב</b></td>
                        </tr>`
            let maxLength: number = Math.max(eidah.bunks[0].bunkList.length, eidah.bunks[1].bunkList.length);
            for (let k=0; k<maxLength; k++) {
                let kth0 = eidah.bunks[0].bunkList[k] || "";
                let kth1 = eidah.bunks[1].bunkList[k] || "";
                tableHTML+=`<tr>
                    <td>${kth0}</td>
                    <td>${kth1}</td>
                </tr>`
            }
            tableHTML+=`            
                    </table>
                </td>
              </tr>
            </table>
            </div>`;
            if(resultsPane) {
                resultsPane.innerHTML += tableHTML;
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



$(document).ready(()=>{
    
    $("#input_file").change((event)=>{
        let names: string[] = [];
        //@ts-ignore
        let file = event.target.files[0];
        let uploader = new CSVUploader();
        let text: Promise<any> = uploader.handleFile(file);
        text.then((data)=>{
            names = handleNamingConflicts(data.split("\n")); //in case there are two Moshe Papi--s, for example 
            names.pop();
            let options = "";
            $('#reqs-and-weights').css("display", "flex");
            for (let n=0; n<names.length; n++) {
                $('#camper-tbody').append(`
                    <tr class="requests">
                        <th class="name">
                            ${names[n]}
                        </th>
                        <td>
                            <select multiple data-placeholder="Select campers..." data-name="${n}" class="chosen-select must" tabindex="5"></select>
                        </td>
                        <td>
                            <select multiple data-placeholder="Select campers..." data-name="${n}" class="chosen-select wants" tabindex="5"></select>
                        </td>
                        <td>
                            <select multiple data-placeholder="Select campers..." data-name="${n}" class="chosen-select prefersNot" tabindex="5"></select>
                        </td>
                        <td>
                            <select multiple data-placeholder="Select campers..." data-name="${n}" class="chosen-select cannot" tabindex="5"></select>
                        </td>
                    </tr>`);
                options += `<option value="${n}">${names[n]}</option>`;
            }
            
            $('.must, .wants, .prefersNot, .cannot').each((index, element)=>{
                $(element).html(options);
                $(element).chosen();
            });

            $('#generate').click(()=>{
                let reqs: any = [];
                const MUST:number = $('#A').slider("option", "value");
                const WANTS:number = $('#B').slider("option", "value");
                const PREFER_NOT:number = $('#D').slider("option", "value");
                const CANNOT:number = $('#F').slider("option", "value");
                let pushHelper = (arr, ele, ownNumber, VAL) => {
                    if(ele.length > 0 && (Number(ele) !== Number(ownNumber))) {
                        arr.push([Number(ele), VAL]);
                    }
                }; 
                $('.requests').each((index, element)=>{
                    let reqArray: any[] = [];
                    let reqBoxes = $(element).find("select");
                    const mustChanich = reqBoxes.eq(0).val();
                    const thisChanichNumber: number = reqBoxes.eq(0).attr("data-");
                    mustChanich.forEach((ele)=>{
                        pushHelper(reqArray, ele, thisChanichNumber, MUST);
                    });
                    const wantsChanich = reqBoxes.eq(1).val();
                    wantsChanich.forEach((ele)=>{
                        pushHelper(reqArray, ele, thisChanichNumber, WANTS);
                    });
                    const preferNotChanich = reqBoxes.eq(2).val();
                    preferNotChanich.forEach((ele)=>{
                        pushHelper(reqArray, ele, thisChanichNumber, PREFER_NOT);
                    });
                    const cannotChanich = reqBoxes.eq(3).val();
                    cannotChanich.forEach((ele)=>{
                        pushHelper(reqArray, ele, thisChanichNumber, CANNOT);
                    });
                    if (reqArray.length > 0) {
                        reqs.push(reqArray);
                    }
                });
                console.log(names, reqs);
                let eidahCreator = new BunkMakerGUI(names, reqs);
                eidahCreator.makeDisplayEidot();
            });
        })
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
        $('#A').find('.ui-slider-handle').append("<span class='value'></span>");
        $('#A').find('.value').html('10');
      },
      slide: (event, ui) => {
          $('#A').find('.value').html(ui.value);
      }
    });
    $("#B").slider({
      range: "min",
      min: 0,
      max: 10,
      value: 4,
      create: (event, ui) => {
        $('#B').find('.ui-slider-handle').append("<span class='value'></span>");
        $('#B').find('.value').html('4');
        
      },
      slide: (event, ui) => {
          $('#B').find('.value').html(ui.value);
      }
    });
    $("#D").slider({
      range: "min",
      min: -10,
      max: 0,
      value: -3,
      create: (event, ui) => {
        $('#D').find('.ui-slider-handle').append("<span class='value'></span>");
        $('#D').find('.value').html('-3');
        
      },
      slide: (event, ui) => {
          $('#D').find('.value').html(ui.value);
      }
    });
    $("#F").slider({
      range: "min",
      min: -10,
      max: 0,
      value: -10,
      create: (event, ui) => {
        $('#F').find('.ui-slider-handle').append("<span class='value'></span>");
        $('#F').find('.value').html('-10');
        
      },
      slide: (event, ui) => {
          $('#F').find('.value').html(ui.value);
      }
    });
  });
