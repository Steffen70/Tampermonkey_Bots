// ==UserScript==
// @name         Titoloshop Bot
// @version      2021.04.08
// @author       Steffen70
// @match        https://www.titoloshop.com/*
// ==/UserScript==

const checkoutUrl = 'https://www.titoloshop.com/ch_en/checkout/#shipping'
const sizeLabelText = '40';

const convertToSeconds = { 'd': 86400, 'h': 3600, 'm': 60, 's': 1 }

const humanInputTimeSpan = {
    min: 750,
    max: 1250
};

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function runRandom(f, timespan = humanInputTimeSpan) {
    const [min, max] = [timespan.min, timespan.max];
    const rand = Math.round(Math.random() * (max - min)) + min;
    await sleep(rand);
    f();
}

async function detectChange(valueGetter, value = null) {
    const result = valueGetter();
    if (result === value) {
        await sleep(200);
        return await detectChange(valueGetter, value);
    }
    return result;
}

function runFunctionBasedOnfragmentIdentifier() {
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        eval(`${hash}()`);
    }
}

function refreshPage() {
    location.reload();
}

async function selectSize() {
    await runRandom(() => document.querySelector(`div[option-label="${sizeLabelText}"]`).click());
    addCart();
}

async function addCart() {
    await runRandom(() => document.querySelector('.cs-addtocart__button').click());
    await runRandom(() => window.location.replace(checkoutUrl));
}

async function shipping() {
    if (document.querySelector('.cart-empty'))
        await runRandom(() => window.location.replace(checkoutUrl));
    const elem = await detectChange(() => document.querySelector('.cs-checkout__sidebar-bottom>button'));
    await detectChange(() => document.querySelector('.table-checkout-shipping-method .col-method'));
    elem.click();
    payment();
}

async function payment() {
    const elem = await detectChange(() => document.querySelector('.payment-method-title>input[value="datatranscw_twint"]'));
    elem.click();
    await runRandom(() => document.querySelector('.cs-place-order-button').click());
}

async function awaitDrop() {
    const timeUntilDrop = await getTimeUntilDropInSeconds();

    if (timeUntilDrop === 0)
        return selectSize();

    else if (timeUntilDrop > 30) {
        const sleepTime = (timeUntilDrop - 30) * 1000;
        console.log(sleepTime + 'ms')
        await sleep(sleepTime);
    }

    await runRandom(refreshPage, { min: 1000, max: 2000 });
}

async function getTimeUntilDropInSeconds() {
    const text = await detectChange(() => document.querySelector('.cs-countdown__output')?.innerText, 'Checking');

    if (text === undefined)
        return 0;

    const matches = [...text.matchAll('([1-9][0-9]*)([d,h,m,s])')];
    const dropTime = matches.reduce((a, x) => ({ ...a, [x[2]]: parseInt(x[1]) }), {});

    let seconds = 0;
    for (const [key, value] of Object.entries(dropTime))
        seconds += convertToSeconds[key] * value;

    return seconds;
}

async function test() {
    console.log(await getTimeUntilDropInSeconds() + 's');
}

runFunctionBasedOnfragmentIdentifier();