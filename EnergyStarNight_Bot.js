// ==UserScript==
// @name         NRJ Air Bot
// @version      2019.08.05
// @author       Steffen70
// @match        https://game.energy.ch/
// ==/UserScript==

const results = {
        "Welche amerikanische Band trat am Energy Air 2016 auf?": "One Republic",
        "Wie viele Mitarbeiter sind am Energy Air im Einsatz?": "1300",
        "Energy Air Tickets kann man…": "gewinnen",
        "Mit welchem dieser Tickets geniesst du die beste Sicht zur Energy Air Bühne?": "XTRA-Circle",
        "Auf welcher Social-Media-Plattform kann man keine Energy Air Tickets gewinnen?": "Instagram",
        "Auf welchem Weg kann man KEINE Energy Air Tickets gewinnen?": "E-Mail",
        "Wann fand das Energy Air zum ersten Mal statt?": "2014",
        "Wie schwer ist die Energy Air Bühne?": "450 Tonnen",
        "Wie breit ist die Energy Air Bühne?": "70 Meter",
        "Die wievielte Energy Air Ausgabe findet dieses Jahr statt?": "Die sechste",
        "Wer war der letzte Act am Energy Air 2018?": "Lo & Leduc",
        "Wo erfährst du immer die neusten Infos rund um das Energy Air?": "im Radio, auf der Website und über Social Media",
        "Wie viele Energy Air Tickets werden verlost?": "40’000",
        "Was passiert, wenn es am Eventtag regnet?": "Energy Air findet trotzdem statt",
        "Wie reiste Kygo im Jahr 2015 ans Energy Air?": "Im Privatjet",
        "Wo findet das Energy Air statt?": "Stade de Suisse, Bern",
        "Wer eröffnete das erste Energy Air?": "Bastian Baker",
        "Wie viele Konfetti-Kanonen gibt es am Energy Air?": "60",
        "Wann beginnt das Energy Air 2019?": "Um 17 Uhr",
        "Wie viele Spotlights gibt es am Energy Air?": "250",
        "Welcher dieser Acts hatte einen Auftritt am Energy Air 2018?": "Alvaro Soler",
        "Wie viele Acts waren beim letzten Energy Air dabei?": "14",
        "Energy Air ist der einzige Energy Event, …": "...der unter freiem Himmel stattfindet.",
        "Welche DJ-Acts standen 2018 auf der Bühne des Energy Air?": "Averdeck",
        "Wen nahm Knackeboul am Energy Air 2014 mit backstage?": "Sein Mami",
        "Was verlangte Nena am Energy Air 2016?": "Eine komplett weisse Garderobe",
        "Welche Fussballmannschaft ist im Stade de Suisse zuhause?": "BSC Young Boys",
        "Wann findet das Energy Air 2019 statt?": "7. September 2019",
};

const [failed, loseheader, tryagain, minDelay, maxDelay] = ["Neustart", "Leider verloren", "Erneut versuchen", 750, 1250];

var funcArray = [];

function pushMany(from, to) {
    from.forEach(elem => {
        to.push(elem);
    });
}

function randomInterval(func, min, max) {
    var rand = Math.round(Math.random() * (max - min)) + min;
    setTimeout(() => {
        func();
        randomInterval(func, min, max);
    }, rand);
}

function checkIfSiteContains(tag, text) {
    if ((headers = $(tag)).filter(id => headers.eq(id).text().trim() == text.trim()).length >= 1) {
        return true;
    }
    return false;
}

function retryIfFailed() {
    if (checkIfSiteContains("button", failed) || checkIfSiteContains("h1", loseheader))
        if ((resetBtn = (buttons = $("button"))
            .filter(id => {
				var text = buttons.eq(id).text().trim(); 
				return text == failed.trim() || text == tryagain.trim()
			})).length >= 1) {
            resetBtn.click();
            return true;
        }
    return false;
}

function answerQuestion() {
    var question = $(".question-text").eq(0).html();
    var result = results[question];
    console.log(result);
    var label;
    if (Array.isArray(result))
        result.forEach(r => {
            if ((elem = $("[for=\"" + r + "\"]")).length != 0)
                label = elem;
        });
    else
        label = $("[for=\"" + result + "\"]");
    var button = $("#next-question");
    return [() => label.click(), () => button.click(), solve];
}

function selectPrice() {
    var ticketBtn = $(".tickets");
    return [
        () => ticketBtn.click(),
        () => (circles = $("div.circle img")).eq(Math.round(Math.random() * (circles.length - 1))).click(),
        retryIfFailed,
        solve
    ];
}

function solve() {
    if ($("h3.question-text").length != 0)
        pushMany(answerQuestion(), funcArray);
    else
        funcArray.push(() => {
            if (!retryIfFailed())
                pushMany(selectPrice(), funcArray);
            else
                funcArray.push(solve);
        });
}

solve();

randomInterval(() => {
    if (funcArray.length >= 1) {
        var func = funcArray[0];
        funcArray.shift();
        func();
    }
}, minDelay, maxDelay);