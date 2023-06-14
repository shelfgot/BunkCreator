export { Camper, UUID, UUIDObject, Bunk, Eidah, Req, EidahSimulator}
const SIMULATIONS_PER_BUNK = 5000;
const SENSITIVITY = 1;
const LOPSIDEDNESS = 25/20;

class Camper {
    readonly name: string;
    readonly uuid: string;
    preferences: PreferenceObject = {};
    constructor(name: string) {
      this.name = name;
      this.uuid = crypto.randomUUID();
    }
    addPreferences(otherKid: Camper, weight: number): void {
      this.preferences[otherKid.uuid] = weight;
    }
    loveRatio(otherChanich: Camper): number {
      let otherChanichsRating: number = (this.uuid in otherChanich.preferences) ? otherChanich.preferences[this.uuid] : 0;
      let chanichsRatingOfOther: number = (otherChanich.uuid in this.preferences) ? this.preferences[otherChanich.uuid]: 0;
      /*logic for evaluating both follows. This can and probably should be tweaked at some point.
      Currently the logic is pretty quantized and not smooth. The best way to figure this out would be to make a slope field
      where the xs and ys are the ratings and the slope is the overall rating, and then to derive an equation in three variables
      to automate this. In any event, this seems to work as a stopgap.
      */
      let cumulativeAlgorithm = (a: number, b: number): number => {
        if (a < -0.3 || b < -0.3) {
          return Math.min(a, b);
        }
        else {
          return (otherChanichsRating+chanichsRatingOfOther)/2;
        }
      }
      return cumulativeAlgorithm(chanichsRatingOfOther, otherChanichsRating);
    }

    checkCompatibility(bunk: Bunk): number {
      let compatibility: number = 0;
      for (const chanich of bunk.kids) {
          compatibility += this.loveRatio(chanich);
      }
      return compatibility;
    }
}

type UUID = string;

interface UUIDObject extends Object {
  [x: string]: any;
}

interface UUIDReqObject extends Object {
  [x: string]: any;
}

interface PreferenceObject extends Object {
  [x: string]: any;
}

function checkBunkEquality(bunkA: Bunk, bunks: Bunk[]): boolean {
    let val = false;
    for (let bunkB of bunks) {
        if(bunkB.kids.length == bunkA.kids.length) {
            val = bunkA.kids.every(chanich => bunkB.kids.includes(chanich)) && bunkB.kids.every(chanich => bunkA.kids.includes(chanich));
            if (val==true) return true;
        }
    }
    return val;
}

class Bunk {
    kids: Array<Camper> = [];
    bunkList: Array<string> = [];
    addCampers(additions: Array<Camper>, otherBunk: Bunk): void {
      let otherUuids;
      if (otherBunk.kids) {
        otherUuids = otherBunk.kids.map(ele => ele.uuid);
      }
      additions.forEach((camper) => {
        let uuids = this.kids.map(ele => ele.uuid);
        if ((uuids.includes(camper.uuid)) === false && otherUuids.includes(camper.uuid) === false) {
          this.kids.push(camper);
          this.bunkList.push(camper.name);
        }
      })
    }
    calculateScore(): number {
      let score: number = 0;
      //the idea here is that 1 evaluates 2,3,4,5; then 2 evaluates 3,4,5 (having already been evaluated by 1); und so weiter.
      for (const [index, chanich] of this.kids.entries()) {
        for (let j = index+1; j < this.kids.length; j++) {
          score += chanich.loveRatio(this.kids[j]);
        }
      }
      return score;
    }
}
class Eidah {
    id: number;
    bunks: Array<Bunk>;
    constructor(public num: number, public tzrifim: Array<Bunk>) {
      this.id = num;
      this.bunks = tzrifim;
    }
    score(): number {
      let eidahScore = 0;
      for (const tzrif of this.bunks) {
        eidahScore += tzrif.calculateScore();
      };
      return eidahScore;
    }
}

interface UnfinishedEidah {
    bunks: Array<Bunk>;
    looseChanichim: UUIDObject;
}

class Req {
    constructor(public firstKid: Camper, public otherKid: Camper, public weight: number | any) {
    //encapsulation is for medication, not for ease of programming. The any is because it breaks the code later on if it's removed, tRuST mE
        this.firstKid = firstKid;
        this.otherKid = otherKid;
        this.weight = weight;
    }
}

class EidahSimulator {
  kanikim: Array<Camper>;
  eidahSize: number;
  kanikim_by_ids: UUIDObject = {}; //of uuids
  reqs: Array<Req>;

  constructor(kanikim: Array<Camper>) {
    this.kanikim = kanikim;
    this.eidahSize = kanikim.length;
    this.kanikim.forEach((ele) => {
      this.kanikim_by_ids[ele.uuid] = ele;
    })
    this.reqs = this.constructReqsFromCamperPreferences();
  }

  constructReqsFromCamperPreferences(): Array<Req> {
    let reqs: Array<Req> = [];
    let uuid_reqs: UUIDReqObject = {};
    //collect, deduplicate, and calculate the weights of the requests
    for (const chanich of this.kanikim) {
      let chanichUUID = chanich.uuid;
      uuid_reqs[chanichUUID] = {}; 
      for (const otherChanichUUID of Object.keys(chanich.preferences)) {
        if ((otherChanichUUID in uuid_reqs) === false || (chanichUUID in uuid_reqs[otherChanichUUID]) === false) {
          uuid_reqs[chanichUUID][otherChanichUUID] = chanich.loveRatio(this.kanikim_by_ids[otherChanichUUID]);
        }
      }
    }
    /*now iterate through the uuid request object to create the final requests.
    Time complexity shouldn't really be an issue because many times people request each other, 
    in which case the request is handled once per the two chanichim.
    With an eidah of 80 people (theoretically), and ten requests per person (exorbitant), the maximum amount of iterations the inner loop runs is 800.*/
    for (const [chanichUUID, requests] of Object.entries(uuid_reqs)) {
      for (const [otherChanichUUID, weight] of Object.entries(requests)) {
        let firstChanich = this.kanikim_by_ids[chanichUUID];
        let secondChanich = this.kanikim_by_ids[otherChanichUUID];
        let newReq: Req = new Req(firstChanich, secondChanich, weight);
        reqs.push(newReq);
      }
    }
    return reqs;
  }

  makeBunks(): Array<Eidah> {

    let reqsAmt: number = this.reqs.length;

    let possibleEidot: Array<Eidah> = [];
    for (let n=0; n<SIMULATIONS_PER_BUNK; n++) {
      let clonedReqs: Array<Req> = [...this.reqs];
      let bunkAlef = new Bunk();
      let bunkBet = new Bunk();
      let bunksAndLooseEnds = recursiveBunkCreation(clonedReqs, this.kanikim_by_ids, [bunkAlef, bunkBet], undefined);
      let bunks = bunksAndLooseEnds["bunks"];
      if(bunksAndLooseEnds["looseChanichim"]) {
        for (const [id, chanich] of Object.entries(bunksAndLooseEnds["looseChanichim"])) {
              /*let criterion: boolean = Boolean((bunks[0].bunkList.length * 2) >= this.eidahSize || (bunks[1].bunkList.length * 2) >= this.eidahSize); 
              let bunkToPlaceIn: Bunk;
              let otherBunk: Bunk;
              if(criterion) {
                bunks.sort((a,b) => a.bunkList.length - b.bunkList.length);
                bunkToPlaceIn = bunks[0];
                otherBunk = bunks[1];
              } else {
                let bunkNum = Math.round(Math.random());
                bunkToPlaceIn = bunks[bunkNum];
                otherBunk = bunks[1-bunkNum];
              }
              bunkToPlaceIn.addCampers([chanich], otherBunk); */  
        }
      }
      let provisionalEidah: Eidah = new Eidah(n, bunks); 
      possibleEidot.push(provisionalEidah);
    }

    function recursiveBunkCreation(reqsRemaining: Array<Req>, originalChanichimUUID: UUIDObject, bunks: Array<Bunk>, looseChanichimUUID?: UUIDObject): UnfinishedEidah {
      if(!looseChanichimUUID) {
        looseChanichimUUID = {...originalChanichimUUID};
      }
      let k: number = Math.floor(Math.random()*reqsRemaining.length);
      let selectedRequest: Req = reqsRemaining.splice(k, 1)[0];
      let bunkToPlace = (req: Req, tzrifim: Bunk[]): number => {
        let delta = checkBunkCompatHelper(req, tzrifim[0]) - checkBunkCompatHelper(req, tzrifim[1]);
        if (Math.abs(delta) < SENSITIVITY) {
          return (tzrifim[0].kids.length < tzrifim[1].kids.length) ? 0 : 1;
        } else if (delta > 0 && tzrifim[0].kids.length <= Math.ceil(Object.keys(originalChanichimUUID).length/2)) {
          return 0;
        } else {
          return 1;
        }
      };
      let tzr: number = bunkToPlace(selectedRequest, bunks);
      bunks[tzr].addCampers([selectedRequest.firstKid, selectedRequest.otherKid], bunks[1 - tzr]); //see definition of addCampers for what happens if one of them is in the bunk already "the Kovy Etshalom theorem"
      //get rid of chanichim who have been added already
      delete looseChanichimUUID[selectedRequest.firstKid.uuid];
      delete looseChanichimUUID[selectedRequest.otherKid.uuid];
      if (reqsRemaining.length > 0) {
        return recursiveBunkCreation(reqsRemaining, originalChanichimUUID, bunks, looseChanichimUUID);
      } else return {"bunks": bunks, "looseChanichim": looseChanichimUUID};
    }
    function checkBunkCompatHelper(selectedRequest: Req, bunk: Bunk) {
      if (bunk.kids && bunk.kids.some((camper: Camper) => camper === selectedRequest.firstKid)) {
        return selectedRequest.otherKid.checkCompatibility(bunk);
      } else if(bunk.kids && bunk.kids.some((camper: Camper) => camper === selectedRequest.otherKid)) {
        return selectedRequest.firstKid.checkCompatibility(bunk);
      }
      return selectedRequest.firstKid.checkCompatibility(bunk) + selectedRequest.otherKid.checkCompatibility(bunk);
    }
    
    possibleEidot.sort((eidahAlef, eidahBet) => {
      let alef_score = eidahAlef.score(), bet_score = eidahBet.score();
      return bet_score - alef_score;
    })

    return possibleEidot;
  };
}

(() => {
    const A = 1, B = 0.5, D = -0.3, F = -1;
    let names: string[] = ["Beit Shammai", "Beit Hillel", "Rabbi Elazar", "Rabbi Yehoshua", "Rashbag", "Rabbi Akiva", "Rabbi Chalafta", "Rabbi Yosei", "Bar Kappara", "Shimon Shezuri"];
    let campers: Camper[] = names.map((self) => {
        return new Camper(self);
    });
    let reqs = [[[2, F], [3, A]]];
    for (const [ind, reqgroup] of reqs.entries()) {
        reqgroup.forEach((ele) => {
            let kanik = campers[ind];
            kanik.addPreferences(campers[ele[0]-1], ele[1]);
        });
    }
    let eidahMaker: EidahSimulator = new EidahSimulator(campers);
    let possibilities: Eidah[] = eidahMaker.makeBunks();
    let index=0, printed=0;
    let printedBunks: Bunk[] = [];
    while (printed<10 && possibilities[index]) {
        let givenEidah = possibilities[index];
        let alefLength = givenEidah.bunks[0].bunkList.length, betLength = givenEidah.bunks[1].bunkList.length;
        if(checkBunkEquality(givenEidah.bunks[0], printedBunks)  || (alefLength * LOPSIDEDNESS < betLength || betLength * LOPSIDEDNESS < alefLength)) {
            index++;
            continue;
        }
        console.log("SCORE: "+givenEidah.score()+". BUNK ALEF: "+givenEidah.bunks[0].bunkList + ";;;;;BUNK BET: " + givenEidah.bunks[1].bunkList);
        printedBunks.push(givenEidah.bunks[0]);
        printedBunks.push(givenEidah.bunks[1]);
        index++;
        printed++;
    }
})();