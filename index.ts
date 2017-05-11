import {NaiveBayesClassifier} from './models/naive-bayes';
import * as fs from 'fs';

let bayes = new NaiveBayesClassifier();

let data: string[] = fs.readFileSync('./data/r8-train-all-terms.txt').toString('utf-8').split('\n');

data.forEach(doc => {
    let firstSpace = doc.indexOf('\t');
    let label = doc.substring(0, firstSpace);
    let text = doc.slice(firstSpace + 1);
    bayes.train(text, label);
});

let guessed = bayes.classify(`asian exporters fear damage from u s japan rift mounting trade friction between the u s and japan has raised fears among many of asia s exporting nations that the row could inflict far reaching economic damage businessmen and officials said they told reuter correspondents in asian capitals a u s move against japan might boost protectionist sentiment in the u s and lead to curbs on american imports of their products but some exporters said that while the conflict would hurt them in the long run in the short term tokyo s loss might be their gain the u s has said it will impose mln dlrs of tariffs on imports of japanese electronics goods on april in retaliation for japan s alleged failure to stick to a pact not to sell semiconductors on world markets at below cost unofficial japanese estimates put the impact of the tariffs at billion dlrs and spokesmen for major electronics firms said they would virtually halt exports of products hit by the new taxes we wouldn t be able to do business said a spokesman for leading japanese electronics firm matsushita electric industrial co ltd mc t if the tariffs remain in place for any length of time beyond a few months it will mean the complete erosion of exports of goods subject to tariffs to the u s said tom murtha a stock analyst at the tokyo office of broker james capel and co in taiwan businessmen and officials are also worried we are aware of the seriousness of the u s threat against japan because it serves as a warning to us said a senior taiwanese trade official who asked not to be named taiwan had a trade trade surplus of billion dlrs last year pct of it with the u s the surplus helped swell taiwan s foreign exchange reserves to billion dlrs among the world s largest we must quickly open our markets remove trade barriers and cut import tariffs to allow imports of u s products if we want to defuse problems from possible u s retaliation said paul sheen chairman of textile exporters taiwan safe group a senior official of south korea s trade promotion association said the trade dispute between the u s and japan might also lead to pressure on south korea whose chief exports are similar to those of japan last year south korea had a trade surplus of billion dlrs with the u s up from billion dlrs in in malaysia trade officers and businessmen said tough curbs against japan might allow hard hit producers of semiconductors in third countries to expand their sales to the u s in hong kong where newspapers have alleged japan has been selling below cost semiconductors some electronics manufacturers share that view but other businessmen said such a short term commercial advantage would be outweighed by further u s pressure to block imports that is a very short term view said lawrence mills director general of the federation of hong kong industry if the whole purpose is to prevent imports one day it will be extended to other sources much more serious for hong kong is the disadvantage of action restraining trade he said the u s last year was hong kong s biggest export market accounting for over pct of domestically produced exports the australian government is awaiting the outcome of trade talks between the u s and japan with interest and concern industry minister john button said in canberra last friday this kind of deterioration in trade relations between two countries which are major trading partners of ours is a very serious matter button said he said australia s concerns centred on coal and beef australia s two largest exports to japan and also significant u s exports to that country meanwhile u s japanese diplomatic manoeuvres to solve the trade stand off continue japan s ruling liberal democratic party yesterday outlined a package of economic measures to boost the japanese economy the measures proposed include a large supplementary budget and record public works spending in the first half of the financial year they also call for stepped up spending as an emergency measure to stimulate the economy despite prime minister yasuhiro nakasone s avowed fiscal reform program deputy u s trade representative michael smith and makoto kuroda japan s deputy minister of international trade and industry miti are due to meet in washington this week in an effort to end the dispute reuter`);
console.log(guessed);

fs.writeFileSync('./export/bayes.json', JSON.stringify(bayes), 'utf-8');

// bayes.train(`This is great article. It has a lot of positive things in it`, `good`);
// bayes.train(`Great! Perfect! I love it`, `good`);
// bayes.train(`It's amazing how great this thing is! I am amazed!`, `good`);
// bayes.train(`Fantastic thing! I adore it! My kids love it!`, `good`);
// bayes.train(`I always loved a great thing to work with. I find it very easy to use.`, `good`);
// bayes.train(`Very nice finishing touches. It has great grip and handling.`, `good`);
// bayes.train(`I just can't think my life without it anymore!`, `good`);
//
// bayes.train(`I don't like this one. It's awful and bad`, `bad`);
// bayes.train(`This is terrible!`, `bad`);
// bayes.train(`God forbid anyone buying this!`, `bad`);
// bayes.train(`Awful thing! Be aware!`, `bad`);
// bayes.train(`Not so nice handling. It's not so great and practical for every day use.`, `bad`);
// bayes.train(`I want to die every day for buying this.`, `bad`);
// bayes.train(`The worst 5 dollars spent in my life.`, `bad`);
// bayes.train(`It's not so easy to go by with it. My life is a mess when I try to use it.`, `bad`);
//
// bayes.classify(`This is great!`);