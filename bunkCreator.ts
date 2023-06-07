export { Camper, UUID, UUIDObject, Bunk, Eidah, Req, EidahSimulator}
const SIMULATIONS_PER_BUNK = 250;
const SENSITIVITY = 1;

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

type UUID = `${string}-${string}-${string}-${string}-${string}`;

interface UUIDObject extends Object {
  [x: string]: any;
  [key: UUID]: Camper;
}

interface UUIDReqObject extends Object {
  [x: string]: any;
  [key: UUID]: PreferenceObject;
}

interface PreferenceObject extends Object {
  [x: string]: any;
  [key: UUID]: number;
}

class Bunk {
    kids: Array<Camper> = [];
    bunkList: Array<string> = [];
    addCampers(additions: Array<Camper>): void {
      const uuids = this.kids.map(ele => ele.uuid);
      additions.forEach((camper) => {
        if ((camper.uuid in uuids) === false) {
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
    
    for(let n=0; n<SIMULATIONS_PER_BUNK; n++) {
      let clonedReqs: Array<Req> = [...this.reqs];
      let bunksAndLooseEnds = recursiveBunkCreation(clonedReqs);
      let bunks = bunksAndLooseEnds["bunks"];
      for (const [id, chanich] of bunksAndLooseEnds["looseChanichim"].entries()) {
        for(let i=0; i<2; i++) {
          if(chanich.checkCompatibility(bunks[i]) > chanich.checkCompatibility(bunks[1 % i])) {
            if (bunks[i].kids.length * 2 >= this.eidahSize) {
              bunks[1 % i].addCampers([chanich]);
            }
          }
        }    
      }
      let provisionalEidah: Eidah = new Eidah(n, bunks); 
      possibleEidot.push(provisionalEidah);
    }

    function recursiveBunkCreation(reqsRemaining: Array<Req>, looseChanichim: UUIDObject = this.kanikim_ids, bunks: Array<Bunk> = []): UnfinishedEidah {
      let k: number = Math.floor(Math.random()*reqsRemaining.length);
      let selectedRequest: Req = reqsRemaining.splice(k, 1);
      let bunkToPlace = (req, tzrifim): number => {
        let delta = checkBunkCompatHelper(req, tzrifim[0]) - checkBunkCompatHelper(req, tzrifim[1]);
        if (Math.abs(delta) < SENSITIVITY) {
          return (tzrifim[0].kids.length < tzrifim[1].kids.length) ? 0 : 1;
        } else if (delta > 0) {
          return 0;
        } else {
          return 1;
        }
      };
      let tzr: number = bunkToPlace(selectedRequest, bunks);
      bunks[tzr].addCampers([selectedRequest.firstKid, selectedRequest.otherKid]); //see definition of addCampers for what happens if one of them is in the bunk already "the Kovy Etshalom theorem"
      //get rid of chanichim who have been added already
      delete looseChanichim[selectedRequest.firstKid.uuid];
      delete looseChanichim[selectedRequest.otherKid.uuid];
      if (reqsRemaining.length > 0) {
        return recursiveBunkCreation(reqsRemaining, looseChanichim, bunks);
      } else return {"bunks": bunks, "looseChanichim": looseChanichim};
    }
    function checkBunkCompatHelper(selectedRequest, bunk: Bunk) {
      if (selectedRequest.firstKid in bunk.kids) {
        return selectedRequest.otherKid.checkCompatibility(bunk);
      } else if(selectedRequest.otherKid in bunk.kids) {
        return selectedRequest.firstKid.checkCompatibility(bunk);
      }
      return selectedRequest.firstKid.checkCompatibility(bunk) + selectedRequest.otherKid.checkCompatibility(bunk);
    }
    
    possibleEidot.sort((eidahAlef, eidahBet) => {
      let alef_score = eidahAlef.score(), bet_score = eidahBet.score();
      return alef_score - bet_score;
    })

    return possibleEidot;
  };
}

